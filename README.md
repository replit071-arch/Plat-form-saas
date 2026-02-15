# 🚀 PropFirm SaaS - Multi-Tenant Prop Trading Platform

A complete white-label SaaS platform for prop trading firms with multi-tenancy, subscription management, challenge creation, support tickets, referral system, and automated certificate generation.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Features Guide](#features-guide)
- [API Documentation](#api-documentation)

## ✨ Features

### 🎯 Core Features
- ✅ Multi-tenant architecture with subdomain support
- ✅ Role-based access control (Root Admin, Admin, User)
- ✅ Subscription & plan management
- ✅ Revenue sharing & commission tracking
- ✅ Challenge creation with section-wise rules
- ✅ Order & payment processing (Stripe)
- ✅ Coupon system
- ✅ Admin wallet & withdrawals

### 📧 Communication Features
- ✅ Email notification system
- ✅ Support ticket system (User → Admin → Root)
- ✅ Customizable email templates

### 🎁 Engagement Features
- ✅ Referral system with rewards
- ✅ Certificate generation (PDF)
- ✅ KYC verification workflow
- ✅ Activity & audit logs

### 🎨 Branding
- ✅ Custom branding (logo, colors, domain)
- ✅ White-label support
- ✅ Multi-language email templates

## 🛠 Tech Stack

### Backend
- Node.js + Express.js
- PostgreSQL
- JWT Authentication
- Stripe Payments
- Nodemailer (Emails)
- PDFKit (Certificates)

### Frontend
- React 18 + Vite
- TailwindCSS
- React Query
- React Hook Form
- Recharts (Analytics)
- Axios

## 📦 Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- Stripe Account (for payments)
- SMTP Server (Gmail, SendGrid, etc.)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd prop-firm-saas
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb propfirm_saas

# Run migrations
psql -d propfirm_saas -f database/schema.sql
```

### 4. Frontend Setup

```bash
cd ../frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### 5. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Access the application at `http://localhost:3000`

## 🌐 Deployment

### Option 1: Railway (Recommended - Free Tier Available)

#### Backend + Database on Railway

1. **Create Railway Account**: https://railway.app

2. **Deploy Database**:
   - Click "New Project"
   - Select "Provision PostgreSQL"
   - Copy the DATABASE_URL

3. **Deploy Backend**:
   - Click "New" → "GitHub Repo"
   - Select your backend folder
   - Add environment variables:
     - `DATABASE_URL` (from step 2)
     - `JWT_SECRET` (generate a random 32+ char string)
     - `STRIPE_SECRET_KEY`
     - `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`
   
4. **Run Migrations**:
   - In Railway dashboard, go to your backend service
   - Click "Settings" → "Service"
   - Under "Build", add a build command:
     ```
     npm install && psql $DATABASE_URL -f database/schema.sql
     ```

#### Frontend on Vercel

1. **Create Vercel Account**: https://vercel.com

2. **Deploy**:
   ```bash
   cd frontend
   npm run build
   vercel --prod
   ```

3. **Environment Variables on Vercel**:
   - Add `VITE_API_URL` = `https://your-backend.railway.app/api`

### Option 2: Render (Free Tier)

#### Backend + Database

1. **Create Account**: https://render.com

2. **Create PostgreSQL Database**:
   - New → PostgreSQL
   - Copy the External Database URL

3. **Create Web Service**:
   - New → Web Service
   - Connect GitHub repository
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   
4. **Environment Variables**:
   - Add all variables from `.env.example`
   - Set `DATABASE_URL` from step 2

5. **Run Migrations**:
   - Shell into your service
   - Run: `psql $DATABASE_URL -f database/schema.sql`

#### Frontend on Vercel (same as Option 1)

### Option 3: DigitalOcean App Platform

1. **Create App**: https://cloud.digitalocean.com/apps

2. **Add Resources**:
   - Database (PostgreSQL)
   - Backend (Node.js)
   - Frontend (Static Site)

3. **Configure**:
   - Backend: Port 5000, `npm start`
   - Frontend: Build command `npm run build`, Output dir `dist`

4. **Environment Variables**: Add all required vars

## 🔑 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT
JWT_SECRET=your-super-secret-key-min-32-characters

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourplatform.com

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# App
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://yourfrontend.vercel.app
```

### Frontend (.env)

```env
VITE_API_URL=https://your-backend.railway.app/api
```

## 💾 Database Setup

### Local Development

```bash
# Create database
createdb propfirm_saas

# Run schema
psql -d propfirm_saas -f backend/database/schema.sql
```

### Production (Railway/Render)

```bash
# SSH into your service or use web shell
psql $DATABASE_URL -f database/schema.sql
```

## 📖 Features Guide

### Section-Wise Rules System

Challenges support dynamic section-based rules:

```javascript
{
  "rules_sections": [
    {
      "section_name": "Profit Targets",
      "section_order": 1,
      "rules": [
        {
          "rule_number": 1,
          "rule_name": "Phase 1 Target",
          "rule_value": "10%",
          "description": "Achieve 10% profit in Phase 1"
        },
        {
          "rule_number": 2,
          "rule_name": "Phase 2 Target",
          "rule_value": "5%",
          "description": "Achieve 5% profit in Phase 2"
        }
      ]
    },
    {
      "section_name": "Drawdown Limits",
      "section_order": 2,
      "rules": [
        {
          "rule_number": 1,
          "rule_name": "Max Daily Drawdown",
          "rule_value": "5%",
          "description": "Do not exceed 5% daily loss"
        }
      ]
    }
  ]
}
```

### Support Ticket Workflow

1. **User creates ticket** → Assigned to Admin
2. **Admin responds** → Status changes to "In Progress"
3. **Admin resolves** → Status changes to "Resolved"
4. **Admin escalates to Root** → Creates new ticket to Root

### Certificate Generation

Automatically generates PDF certificates when:
- User passes a challenge
- User gets funded

Certificates include:
- Unique certificate number
- User name
- Challenge details
- QR code (for verification)
- Branded design

### Referral System

1. Each user gets a unique referral code
2. New users can register with referral code
3. Referrer gets reward (discount/cash)
4. Referred user gets welcome bonus
5. All tracked in `referrals` table

## 📚 API Documentation

### Authentication

```bash
# Root Admin Login
POST /api/auth/root/login
{
  "email": "root@propfirm.com",
  "password": "admin123"
}

# Admin Login
POST /api/auth/admin/login
{
  "email": "admin@company.com",
  "password": "password"
}

# User Registration
POST /api/auth/user/register
{
  "admin_id": 1,
  "email": "trader@example.com",
  "password": "password",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "referral_code": "ABC123" // optional
}
```

### Challenges

```bash
# Create Challenge
POST /api/challenges
Authorization: Bearer <token>
{
  "challenge_name": "Pro Trader Challenge",
  "challenge_type": "2_step",
  "account_size": 100000,
  "entry_fee": 499,
  "leverage": "1:100",
  "currency": "USD",
  "is_refundable": true,
  "rules_sections": [...],
  "restrictions": {...},
  "segments": ["forex", "indices"]
}

# Get All Challenges
GET /api/challenges
Authorization: Bearer <token>

# Get Public Challenges (for users)
GET /api/challenges/public/list?admin_id=1
```

### Support Tickets

```bash
# Create Ticket (User)
POST /api/tickets
Authorization: Bearer <token>
{
  "subject": "Cannot access my account",
  "category": "technical",
  "priority": "high",
  "message": "I'm unable to log in..."
}

# Add Message to Ticket
POST /api/tickets/:id/messages
Authorization: Bearer <token>
{
  "message": "I have reset your password."
}

# Update Ticket Status
PATCH /api/tickets/:id/status
Authorization: Bearer <token>
{
  "status": "resolved"
}
```

## 🔒 Default Credentials

**Root Admin:**
- Email: `root@propfirm.com`
- Password: `admin123`

**Note:** Change these immediately in production!

## 🐛 Troubleshooting

### Database Connection Error

```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Check connection string
echo $DATABASE_URL
```

### SMTP Email Not Sending

1. Enable "Less secure app access" for Gmail
2. Or generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password in `SMTP_PASS`

### Port Already in Use

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## 📝 License

MIT License - Free to use for commercial and personal projects

## 🤝 Support

For issues and questions:
- Open a GitHub issue
- Email: support@yourplatform.com

## 🎉 What's Next?

- [ ] Add Webhook handlers for Stripe
- [ ] Implement MT4/MT5 API integration
- [ ] Add real-time trading data sync
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode

---

Built with ❤️ by PropFirm SaaS Team
#   P l a t - f o r m - s a a s  
 #   P l a t - f o r m - s a a s  
 #   P l a t - f o r m - s a a s  
 