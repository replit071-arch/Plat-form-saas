import nodemailer from 'nodemailer';
import { query } from '../config/database.js';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Replace template variables
  replaceVariables(template, variables) {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    }
    return result;
  }

  // Get email template
  async getTemplate(adminId, templateKey) {
    try {
      // Try to get admin-specific template first
      let result = await query(
        'SELECT * FROM email_templates WHERE admin_id = $1 AND template_key = $2 AND is_active = true',
        [adminId, templateKey]
      );

      // If no admin-specific template, get global template
      if (result.rows.length === 0) {
        result = await query(
          'SELECT * FROM email_templates WHERE admin_id IS NULL AND template_key = $1 AND is_active = true',
          [templateKey]
        );
      }

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting email template:', error);
      return null;
    }
  }

  // Send email with template
  async sendTemplateEmail(adminId, userId, templateKey, variables, toEmail) {
    try {
      const template = await this.getTemplate(adminId, templateKey);
      
      if (!template) {
        console.error(`Template not found: ${templateKey}`);
        return false;
      }

      const subject = this.replaceVariables(template.subject, variables);
      const html = this.replaceVariables(template.body, variables);

      // Create email log entry
      const logResult = await query(
        `INSERT INTO email_logs (admin_id, user_id, template_key, to_email, subject, status)
         VALUES ($1, $2, $3, $4, $5, 'pending')
         RETURNING id`,
        [adminId, userId, templateKey, toEmail, subject]
      );

      const emailLogId = logResult.rows[0].id;

      // Send email
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@propfirm.com',
        to: toEmail,
        subject: subject,
        html: html,
      });

      // Update log as sent
      await query(
        'UPDATE email_logs SET status = $1, sent_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['sent', emailLogId]
      );

      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Update log as failed
      if (error.emailLogId) {
        await query(
          'UPDATE email_logs SET status = $1, error_message = $2 WHERE id = $3',
          ['failed', error.message, error.emailLogId]
        );
      }
      
      return false;
    }
  }

  // Send welcome email to new user
  async sendWelcomeEmail(adminId, user, companyName) {
    const variables = {
      user_name: user.full_name,
      company_name: companyName,
      email: user.email,
    };

    return await this.sendTemplateEmail(
      adminId,
      user.id,
      'welcome_user',
      variables,
      user.email
    );
  }

  // Send challenge purchase confirmation
  async sendChallengePurchaseEmail(adminId, user, challenge, order) {
    const variables = {
      user_name: user.full_name,
      challenge_name: challenge.challenge_name,
      order_number: order.order_number,
      amount: order.final_price,
      account_size: challenge.account_size,
    };

    return await this.sendTemplateEmail(
      adminId,
      user.id,
      'challenge_purchase',
      variables,
      user.email
    );
  }

  // Send payout approved email
  async sendPayoutApprovedEmail(adminId, user, payout) {
    const variables = {
      user_name: user.full_name,
      amount: payout.amount,
      payout_id: payout.id,
    };

    return await this.sendTemplateEmail(
      adminId,
      user.id,
      'payout_approved',
      variables,
      user.email
    );
  }

  // Send subscription expiry reminder
  async sendSubscriptionExpiryEmail(admin) {
    const variables = {
      admin_name: admin.full_name,
      expiry_date: new Date(admin.subscription_end_date).toLocaleDateString(),
      plan_name: admin.plan_name,
    };

    const template = await this.getTemplate(null, 'subscription_expiry');
    
    if (template) {
      const subject = this.replaceVariables(template.subject, variables);
      const html = this.replaceVariables(template.body, variables);

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@propfirm.com',
        to: admin.email,
        subject: subject,
        html: html,
      });
    }

    return true;
  }

  // Send support ticket notification
  async sendTicketNotification(ticket, recipient) {
    const subject = `Support Ticket #${ticket.ticket_number}: ${ticket.subject}`;
    const html = `
      <h2>New Support Ticket</h2>
      <p><strong>Ticket Number:</strong> ${ticket.ticket_number}</p>
      <p><strong>Subject:</strong> ${ticket.subject}</p>
      <p><strong>Priority:</strong> ${ticket.priority}</p>
      <p><strong>Category:</strong> ${ticket.category}</p>
      <p>Please log in to view and respond to this ticket.</p>
    `;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@propfirm.com',
      to: recipient.email,
      subject: subject,
      html: html,
    });

    return true;
  }

  // Send certificate email
  async sendCertificateEmail(adminId, user, certificate) {
    const variables = {
      user_name: user.full_name,
      certificate_number: certificate.certificate_number,
      certificate_url: certificate.certificate_url,
      issue_date: new Date(certificate.issue_date).toLocaleDateString(),
    };

    const template = await this.getTemplate(adminId, 'certificate_issued');
    
    if (template) {
      const subject = this.replaceVariables(template.subject, variables);
      const html = this.replaceVariables(template.body, variables);

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@propfirm.com',
        to: user.email,
        subject: subject,
        html: html,
      });
    }

    return true;
  }
}

export default new EmailService();
