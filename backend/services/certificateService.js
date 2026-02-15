import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { query } from '../config/database.js';

class CertificateService {
  constructor() {
    this.certificatesDir = path.join(process.cwd(), 'uploads', 'certificates');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(this.certificatesDir)) {
      fs.mkdirSync(this.certificatesDir, { recursive: true });
    }
  }

  // Generate unique certificate number
  generateCertificateNumber(adminId, userId) {
    const timestamp = Date.now();
    return `CERT-${adminId}-${userId}-${timestamp}`;
  }

  // Create certificate PDF
  async generateCertificate(userChallengeId, userId, adminId) {
    try {
      // Get user and challenge details
      const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
      const challengeResult = await query(
        `SELECT uc.*, c.challenge_name, c.account_size, a.company_name
         FROM user_challenges uc
         JOIN challenges c ON uc.challenge_id = c.id
         JOIN admins a ON c.admin_id = a.id
         WHERE uc.id = $1`,
        [userChallengeId]
      );

      if (userResult.rows.length === 0 || challengeResult.rows.length === 0) {
        throw new Error('User or challenge not found');
      }

      const user = userResult.rows[0];
      const challenge = challengeResult.rows[0];

      // Generate certificate number
      const certificateNumber = this.generateCertificateNumber(adminId, userId);
      const fileName = `${certificateNumber}.pdf`;
      const filePath = path.join(this.certificatesDir, fileName);

      // Create PDF
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Certificate Design
      // Border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .lineWidth(3)
         .strokeColor('#3B82F6')
         .stroke();

      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
         .lineWidth(1)
         .strokeColor('#3B82F6')
         .stroke();

      // Title
      doc.fontSize(36)
         .fillColor('#1E40AF')
         .font('Helvetica-Bold')
         .text('CERTIFICATE OF ACHIEVEMENT', 0, 100, { align: 'center' });

      // Subtitle
      doc.fontSize(14)
         .fillColor('#64748B')
         .font('Helvetica')
         .text('This is to certify that', 0, 160, { align: 'center' });

      // User Name
      doc.fontSize(32)
         .fillColor('#0F172A')
         .font('Helvetica-Bold')
         .text(user.full_name, 0, 190, { align: 'center' });

      // Achievement Text
      doc.fontSize(14)
         .fillColor('#64748B')
         .font('Helvetica')
         .text('has successfully completed the', 0, 240, { align: 'center' });

      // Challenge Name
      doc.fontSize(24)
         .fillColor('#3B82F6')
         .font('Helvetica-Bold')
         .text(challenge.challenge_name, 0, 270, { align: 'center' });

      // Challenge Details
      doc.fontSize(12)
         .fillColor('#64748B')
         .font('Helvetica')
         .text(`Account Size: $${challenge.account_size} | Profit: $${challenge.current_profit}`, 0, 310, { align: 'center' });

      // Issue Date
      const issueDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      doc.fontSize(12)
         .fillColor('#64748B')
         .text(`Issued on ${issueDate}`, 0, 360, { align: 'center' });

      // Certificate Number
      doc.fontSize(10)
         .fillColor('#94A3B8')
         .text(`Certificate No: ${certificateNumber}`, 0, 390, { align: 'center' });

      // Company Name
      doc.fontSize(16)
         .fillColor('#1E40AF')
         .font('Helvetica-Bold')
         .text(challenge.company_name, 0, 450, { align: 'center' });

      // Signature Line
      doc.moveTo(250, 500)
         .lineTo(550, 500)
         .stroke();

      doc.fontSize(10)
         .fillColor('#64748B')
         .font('Helvetica')
         .text('Authorized Signature', 250, 510, { width: 300, align: 'center' });

      doc.end();

      // Wait for PDF to be written
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      // Save certificate record to database
      const certificateUrl = `/uploads/certificates/${fileName}`;
      
      await query(
        `INSERT INTO certificates (user_id, user_challenge_id, certificate_number, certificate_type, certificate_url)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, userChallengeId, certificateNumber, 'challenge_passed', certificateUrl]
      );

      return {
        certificateNumber,
        certificateUrl,
        filePath
      };
    } catch (error) {
      console.error('Error generating certificate:', error);
      throw error;
    }
  }

  // Generate funded trader certificate
  async generateFundedCertificate(userChallengeId, userId, adminId) {
    try {
      const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
      const challengeResult = await query(
        `SELECT uc.*, c.challenge_name, c.account_size, a.company_name
         FROM user_challenges uc
         JOIN challenges c ON uc.challenge_id = c.id
         JOIN admins a ON c.admin_id = a.id
         WHERE uc.id = $1`,
        [userChallengeId]
      );

      const user = userResult.rows[0];
      const challenge = challengeResult.rows[0];

      const certificateNumber = this.generateCertificateNumber(adminId, userId);
      const fileName = `${certificateNumber}.pdf`;
      const filePath = path.join(this.certificatesDir, fileName);

      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Golden theme for funded certificate
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .lineWidth(3)
         .strokeColor('#D97706')
         .stroke();

      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
         .lineWidth(1)
         .strokeColor('#F59E0B')
         .stroke();

      doc.fontSize(36)
         .fillColor('#92400E')
         .font('Helvetica-Bold')
         .text('FUNDED TRADER CERTIFICATE', 0, 100, { align: 'center' });

      doc.fontSize(14)
         .fillColor('#64748B')
         .font('Helvetica')
         .text('This certifies that', 0, 160, { align: 'center' });

      doc.fontSize(32)
         .fillColor('#0F172A')
         .font('Helvetica-Bold')
         .text(user.full_name, 0, 190, { align: 'center' });

      doc.fontSize(14)
         .fillColor('#64748B')
         .font('Helvetica')
         .text('is now a Funded Trader with', 0, 240, { align: 'center' });

      doc.fontSize(24)
         .fillColor('#D97706')
         .font('Helvetica-Bold')
         .text(challenge.company_name, 0, 270, { align: 'center' });

      doc.fontSize(12)
         .fillColor('#64748B')
         .font('Helvetica')
         .text(`Funded Account Size: $${challenge.account_size}`, 0, 310, { align: 'center' });

      const issueDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      doc.fontSize(12)
         .fillColor('#64748B')
         .text(`Funded on ${issueDate}`, 0, 360, { align: 'center' });

      doc.fontSize(10)
         .fillColor('#94A3B8')
         .text(`Certificate No: ${certificateNumber}`, 0, 390, { align: 'center' });

      doc.moveTo(250, 500)
         .lineTo(550, 500)
         .stroke();

      doc.fontSize(10)
         .fillColor('#64748B')
         .font('Helvetica')
         .text('Authorized Signature', 250, 510, { width: 300, align: 'center' });

      doc.end();

      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      const certificateUrl = `/uploads/certificates/${fileName}`;
      
      await query(
        `INSERT INTO certificates (user_id, user_challenge_id, certificate_number, certificate_type, certificate_url)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, userChallengeId, certificateNumber, 'funded_trader', certificateUrl]
      );

      return {
        certificateNumber,
        certificateUrl,
        filePath
      };
    } catch (error) {
      console.error('Error generating funded certificate:', error);
      throw error;
    }
  }

  // Get user certificates
  async getUserCertificates(userId) {
    try {
      const result = await query(
        `SELECT c.*, uc.challenge_id, ch.challenge_name
         FROM certificates c
         JOIN user_challenges uc ON c.user_challenge_id = uc.id
         JOIN challenges ch ON uc.challenge_id = ch.id
         WHERE c.user_id = $1 AND c.is_valid = true
         ORDER BY c.issue_date DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting user certificates:', error);
      throw error;
    }
  }

  // Verify certificate
  async verifyCertificate(certificateNumber) {
    try {
      const result = await query(
        `SELECT c.*, u.full_name, u.email, ch.challenge_name, a.company_name
         FROM certificates c
         JOIN users u ON c.user_id = u.id
         JOIN user_challenges uc ON c.user_challenge_id = uc.id
         JOIN challenges ch ON uc.challenge_id = ch.id
         JOIN admins a ON ch.admin_id = a.id
         WHERE c.certificate_number = $1 AND c.is_valid = true`,
        [certificateNumber]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error verifying certificate:', error);
      throw error;
    }
  }
}

export default new CertificateService();
