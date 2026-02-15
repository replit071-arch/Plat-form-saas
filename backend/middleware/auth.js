import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Generate JWT Token
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

// Verify JWT Token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Authentication Middleware
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Role-based Authorization Middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Multi-tenant Middleware (extracts admin from subdomain or custom domain)
export const extractTenant = async (req, res, next) => {
  try {
    const host = req.headers.host || req.get('host');
    
    // Extract subdomain
    const subdomain = host.split('.')[0];
    
    // Check if it's a custom domain or subdomain
    const result = await query(
      'SELECT id, company_name FROM admins WHERE subdomain = $1 OR custom_domain = $2 AND is_active = true',
      [subdomain, host]
    );

    if (result.rows.length > 0) {
      req.tenant = result.rows[0];
    }

    next();
  } catch (error) {
    console.error('Tenant extraction error:', error);
    next();
  }
};

// Check Admin Subscription Status
export const checkSubscription = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next();
    }

    const result = await query(
      'SELECT subscription_status, subscription_end_date FROM admins WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const admin = result.rows[0];

    if (admin.subscription_status === 'expired') {
      return res.status(403).json({ 
        error: 'Subscription expired',
        message: 'Please renew your subscription to continue'
      });
    }

    if (admin.subscription_status === 'suspended') {
      return res.status(403).json({ 
        error: 'Account suspended',
        message: 'Please contact support'
      });
    }

    // Check if subscription is about to expire
    const endDate = new Date(admin.subscription_end_date);
    const now = new Date();
    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 7 && daysRemaining > 0) {
      req.subscriptionWarning = `Your subscription expires in ${daysRemaining} days`;
    }

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ error: 'Subscription check failed' });
  }
};

export default {
  generateToken,
  verifyToken,
  authenticate,
  authorize,
  extractTenant,
  checkSubscription
};
