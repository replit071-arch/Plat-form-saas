# 📘 COMPLETE SETUP GUIDE - Step by Step

This guide will walk you through setting up the PropFirm SaaS platform from scratch.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Email Configuration](#email-configuration)
6. [Payment Configuration](#payment-configuration)
7. [Testing](#testing)
8. [Production Deployment](#production-deployment)

---

## 1. Prerequisites

### Required Software

#### PostgreSQL 14+
**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Run installer
- Remember the password you set for the `postgres` user

#### Node.js 18+
**All platforms:**
- Download from: https://nodejs.org/
- Or use nvm: `nvm install 18`

**Verify installation:**
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
psql --version  # Should show 14.x or higher
```

---

## 2. Database Setup

### Option A: Automatic Setup (Recommended)

```bash
cd backend
chmod +x setup-database.sh
./setup-database.sh
```

The script will:
- ✅ Check if PostgreSQL is installed
- ✅ Create the database
- ✅ Run all migrations
- ✅ Insert default data
- ✅ Generate DATABASE_URL
- ✅ Update your .env file

### Option B: Manual Setup

#### Step 1: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE propfirm_saas;

# Exit psql
\q
```

#### Step 2: Run Migrations

```bash
cd backend
psql -U postgres -d propfirm_saas -f database/schema.sql
```

#### Step 3: Verify Setup

```bash
psql -U postgres -d propfirm_saas

# Check if tables exist
\dt

# Check root admin
SELECT * FROM root_admins;

# Exit
\q
```

You should see 30+ tables and 1 root admin record.

---

## 3. Backend Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment

```bash
# Copy example file
cp .env.example .env

# Edit .env file
nano .env  # or use your favorite editor
```

### Step 3: Configure .env File

Edit `.env` with these values:

```env
# Database (from setup script or manual setup)
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/propfirm_saas

# JWT Secret (generate a random 32+ character string)
JWT_SECRET=your_super_secret_key_please_change_this_to_random_32_chars

# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# SMTP Email (Gmail example - see Email Configuration section)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM=noreply@yourplatform.com

# Stripe (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Platform
PLATFORM_NAME=PropFirm SaaS
PLATFORM_DOMAIN=localhost:3000
SUPPORT_EMAIL=support@yourplatform.com
```

### Step 4: Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

You should see:
```
================================================
🚀 PropFirm SaaS Backend Server
================================================
Environment: development
Port: 5000
URL: http://localhost:5000
================================================
```

### Step 5: Test API

Open a new terminal:
```bash
# Test health endpoint
curl http://localhost:5000/health

# Should return: {"status":"OK","timestamp":"..."}
```

---

## 4. Frontend Setup

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Configure Environment

```bash
# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### Step 3: Start Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Step 4: Access Application

Open browser: http://localhost:3000

You should see the login page.

---

## 5. Email Configuration

### Gmail Setup (Recommended for Development)

#### Step 1: Enable 2-Factor Authentication
1. Go to: https://myaccount.google.com/security
2. Enable 2-Step Verification

#### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and your device
3. Click "Generate"
4. Copy the 16-character password

#### Step 3: Update .env
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop  # The 16-char password (spaces are okay)
SMTP_FROM=noreply@yourplatform.com
```

#### Step 4: Test Email

```bash
# Restart backend server
cd backend
npm run dev
```

Register a new user and check if you receive the welcome email.

### Other SMTP Providers

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

**Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your_mailgun_username
SMTP_PASS=your_mailgun_password
```

---

## 6. Payment Configuration

### Stripe Setup

#### Step 1: Create Stripe Account
1. Go to: https://dashboard.stripe.com/register
2. Complete registration

#### Step 2: Get API Keys
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy "Publishable key" (starts with `pk_test_`)
3. Reveal and copy "Secret key" (starts with `sk_test_`)

#### Step 3: Update .env
```env
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxxxxxxxxxx
```

#### Step 4: Test Mode
- Always use **test keys** (pk_test_* and sk_test_*) for development
- Use test credit card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC

---

## 7. Testing

### Test the Complete Flow

#### Step 1: Login as Root Admin
```
Email: root@propfirm.com
Password: admin123
```

✅ You should see the Root Dashboard

#### Step 2: Create Admin
1. Go to "Admin Management"
2. Click "Create Admin"
3. Fill in details:
   - Full Name: Test Admin
   - Company Name: Test Prop Firm
   - Email: admin@test.com
   - Phone: +1234567890
   - Password: test123
   - Subdomain: testfirm
   - Plan: Starter
4. Click "Create Admin"

✅ Admin should appear in the table

#### Step 3: Login as Admin
1. Logout
2. Login with: `admin@test.com` / `test123`

✅ You should see the Admin Dashboard

#### Step 4: Create Challenge
1. Go to "Challenges" → "Create Challenge"
2. Fill in basic details
3. Add section-wise rules
4. Set restrictions
5. Select segments
6. Click "Publish"

✅ Challenge should be created

#### Step 5: Register as User
1. Logout
2. Go to "Register"
3. Fill in registration form
4. Click "Create Account"

✅ You should receive a welcome email
✅ You should be logged in as user

#### Step 6: Browse Challenges
1. Go to "Browse Challenges"

✅ You should see the challenge created by admin

---

## 8. Production Deployment

### Railway (Backend + Database)

#### Step 1: Create Account
- Go to: https://railway.app
- Sign up with GitHub

#### Step 2: Deploy Database
1. Click "New Project" → "Provision PostgreSQL"
2. Copy the `DATABASE_URL` from "Variables" tab

#### Step 3: Deploy Backend
1. Push code to GitHub
2. In Railway, click "New" → "GitHub Repo"
3. Select your repository
4. Set Root Directory: `backend`
5. Add environment variables (see .env.example)

#### Step 4: Run Migrations
1. In Railway, go to your backend service
2. Click "Settings" → "Deploy"
3. Add Deploy Command: `npm install && psql $DATABASE_URL -f database/schema.sql && npm start`

### Vercel (Frontend)

#### Step 1: Create Account
- Go to: https://vercel.com
- Sign up with GitHub

#### Step 2: Deploy
```bash
cd frontend
npm run build
vercel --prod
```

#### Step 3: Configure
- Framework Preset: Vite
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

#### Step 4: Add Environment Variable
```
VITE_API_URL=https://your-backend.up.railway.app/api
```

---

## 🎉 Success!

Your PropFirm SaaS platform is now fully set up!

### Default Credentials
- **Root Admin:** root@propfirm.com / admin123

### Important Next Steps
1. ⚠️ Change the root admin password
2. 🎨 Customize branding
3. 💳 Add real Stripe keys for production
4. 📧 Configure production SMTP
5. 🔒 Set up SSL certificate
6. 📊 Set up monitoring

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Start if not running
sudo service postgresql start

# Test connection
psql -U postgres -c "SELECT version();"
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -ti:5000

# Kill the process
kill -9 $(lsof -ti:5000)
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Email Not Sending
1. Check SMTP credentials in .env
2. Verify app password for Gmail
3. Check spam folder
4. Look at backend logs for errors

### CORS Error
1. Check `FRONTEND_URL` in backend .env
2. Check `VITE_API_URL` in frontend .env
3. Restart both servers

---

## 📞 Need Help?

1. Check README.md for detailed documentation
2. Review FEATURES.md for implemented features
3. Check logs for error messages
4. Ensure all prerequisites are installed

---

## 🎓 Learning Resources

### Database
- PostgreSQL Tutorial: https://www.postgresqltutorial.com/
- SQL Basics: https://www.w3schools.com/sql/

### Backend
- Node.js Docs: https://nodejs.org/docs/
- Express.js Guide: https://expressjs.com/guide/

### Frontend
- React Tutorial: https://react.dev/learn
- Vite Guide: https://vitejs.dev/guide/

---

Happy Building! 🚀
