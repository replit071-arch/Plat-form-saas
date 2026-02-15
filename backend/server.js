import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import challengeRoutes from './routes/challenges.js';
import ticketRoutes from './routes/tickets.js';

// Import middleware
import { extractTenant } from './middleware/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// Security
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Strict rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 requests per 15 minutes
  message: 'Too many login attempts, please try again later'
});

// Multi-tenant middleware
app.use(extractTenant);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth routes
app.use('/api/auth', authLimiter, authRoutes);

// Challenge routes
app.use('/api/challenges', challengeRoutes);

// Support ticket routes
app.use('/api/tickets', ticketRoutes);

// TODO: Add more routes
// app.use('/api/root', rootRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/user', userRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/coupons', couponRoutes);
// app.use('/api/payouts', payoutRoutes);
// app.use('/api/referrals', referralRoutes);
// app.use('/api/certificates', certificateRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request entity too large' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// SERVER START
// ============================================

app.listen(PORT, () => {
  console.log(`
  ================================================
  🚀 PropFirm SaaS Backend Server
  ================================================
  Environment: ${process.env.NODE_ENV || 'development'}
  Port: ${PORT}
  URL: http://localhost:${PORT}
  ================================================
  `);
});

export default app;
