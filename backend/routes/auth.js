import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { generateToken } from '../middleware/auth.js';
import emailService from '../services/emailService.js';

const router = express.Router();

// ============================================
// ROOT ADMIN AUTH
// ============================================

// Root Admin Login
router.post('/root/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await query(
      'SELECT * FROM root_admins WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const rootAdmin = result.rows[0];
    const validPassword = await bcrypt.compare(password, rootAdmin.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      id: rootAdmin.id,
      email: rootAdmin.email,
      role: 'root_admin'
    });

    res.json({
      token,
      user: {
        id: rootAdmin.id,
        email: rootAdmin.email,
        full_name: rootAdmin.full_name,
        role: 'root_admin'
      }
    });
  } catch (error) {
    console.error('Root admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============================================
// ADMIN AUTH
// ============================================

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await query(
      `SELECT a.*, p.plan_name 
       FROM admins a
       LEFT JOIN plans p ON a.plan_id = p.id
       WHERE a.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = result.rows[0];

    if (!admin.is_active) {
      return res.status(403).json({ error: 'Account is suspended' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check subscription status
    if (admin.subscription_status === 'expired') {
      return res.status(403).json({ 
        error: 'Subscription expired',
        message: 'Please renew your subscription'
      });
    }

    const token = generateToken({
      id: admin.id,
      email: admin.email,
      role: 'admin',
      adminId: admin.id
    });

    // Log activity
    await query(
      `INSERT INTO activity_logs (admin_id, actor_role, action, description, ip_address)
       VALUES ($1, $2, $3, $4, $5)`,
      [admin.id, 'admin', 'login', 'Admin logged in', req.ip]
    );

    res.json({
      token,
      user: {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        company_name: admin.company_name,
        role: 'admin',
        subscription_status: admin.subscription_status,
        subscription_end_date: admin.subscription_end_date,
        plan_name: admin.plan_name
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Admin Register (Created by Root)
router.post('/admin/register', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      full_name, 
      company_name, 
      phone, 
      plan_id,
      subdomain 
    } = req.body;

    // Check if email exists
    const existingAdmin = await query(
      'SELECT id FROM admins WHERE email = $1',
      [email]
    );

    if (existingAdmin.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Check if subdomain exists
    const existingSubdomain = await query(
      'SELECT id FROM admins WHERE subdomain = $1',
      [subdomain]
    );

    if (existingSubdomain.rows.length > 0) {
      return res.status(400).json({ error: 'Subdomain already taken' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get plan details
    const planResult = await query('SELECT * FROM plans WHERE id = $1', [plan_id]);
    const plan = planResult.rows[0];

    // Calculate subscription dates
    const subscriptionStart = new Date();
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

    // Create admin
    const result = await query(
      `INSERT INTO admins (
        email, password, full_name, company_name, phone, plan_id,
        subscription_start_date, subscription_end_date, subdomain
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        email, hashedPassword, full_name, company_name, phone, plan_id,
        subscriptionStart, subscriptionEnd, subdomain
      ]
    );

    const admin = result.rows[0];

    // Create default branding
    await query(
      `INSERT INTO admin_branding (admin_id)
       VALUES ($1)`,
      [admin.id]
    );

    // Create default referral settings
    await query(
      `INSERT INTO referral_settings (admin_id)
       VALUES ($1)`,
      [admin.id]
    );

    res.json({
      message: 'Admin created successfully',
      admin: {
        id: admin.id,
        email: admin.email,
        company_name: admin.company_name,
        subdomain: admin.subdomain
      }
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ============================================
// USER AUTH
// ============================================

// User Register
router.post('/user/register', async (req, res) => {
  try {
    const { email, password, full_name, phone, admin_id, referral_code } = req.body;

    // Check if user exists for this admin
    const existingUser = await query(
      'SELECT id FROM users WHERE admin_id = $1 AND email = $2',
      [admin_id, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Check admin's user limit
    const adminResult = await query(
      `SELECT a.users_count, p.user_limit
       FROM admins a
       JOIN plans p ON a.plan_id = p.id
       WHERE a.id = $1`,
      [admin_id]
    );

    const admin = adminResult.rows[0];
    if (admin.user_limit !== -1 && admin.users_count >= admin.user_limit) {
      return res.status(403).json({ error: 'User limit reached for this platform' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique referral code
    const userReferralCode = `${full_name.substring(0, 3).toUpperCase()}${Date.now().toString().slice(-6)}`;

    // Check if referred by someone
    let referredByUserId = null;
    if (referral_code) {
      const referrerResult = await query(
        'SELECT id FROM users WHERE admin_id = $1 AND referral_code = $2',
        [admin_id, referral_code]
      );
      
      if (referrerResult.rows.length > 0) {
        referredByUserId = referrerResult.rows[0].id;
      }
    }

    // Create user
    const result = await query(
      `INSERT INTO users (
        admin_id, email, password, full_name, phone, referral_code, referred_by_user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [admin_id, email, hashedPassword, full_name, phone, userReferralCode, referredByUserId]
    );

    const user = result.rows[0];

    // Update admin's user count
    await query(
      'UPDATE admins SET users_count = users_count + 1 WHERE id = $1',
      [admin_id]
    );

    // Create referral record if referred
    if (referredByUserId) {
      await query(
        `INSERT INTO referrals (admin_id, referrer_user_id, referred_user_id, referral_code)
         VALUES ($1, $2, $3, $4)`,
        [admin_id, referredByUserId, user.id, referral_code]
      );
    }

    // Get company name for welcome email
    const companyResult = await query(
      'SELECT company_name FROM admins WHERE id = $1',
      [admin_id]
    );

    // Send welcome email
    await emailService.sendWelcomeEmail(admin_id, user, companyResult.rows[0].company_name);

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: 'user',
      adminId: admin_id
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: 'user',
        referral_code: user.referral_code
      }
    });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User Login
router.post('/user/login', async (req, res) => {
  try {
    const { email, password, admin_id } = req.body;

    const result = await query(
      'SELECT * FROM users WHERE admin_id = $1 AND email = $2',
      [admin_id, email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is suspended' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: 'user',
      adminId: admin_id
    });

    // Log activity
    await query(
      `INSERT INTO activity_logs (admin_id, user_id, actor_role, action, description, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [admin_id, user.id, 'user', 'login', 'User logged in', req.ip]
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: 'user',
        kyc_status: user.kyc_status,
        referral_code: user.referral_code
      }
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
