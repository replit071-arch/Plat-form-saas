# 🚀 QUICK START - Deploy to Free Hosting

## ⚡ FASTEST DEPLOYMENT (15 minutes)

### Step 1: Database Setup (Railway - FREE)

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Provision PostgreSQL"
4. Copy the `DATABASE_URL` (looks like: `postgresql://postgres:...@...railway.app:5432/railway`)

### Step 2: Backend Deployment (Railway)

1. In Railway, click "New" → "GitHub Repo"
2. Connect your GitHub account
3. Select this repository
4. Railway will auto-detect the backend
5. Add Environment Variables:
   ```
   DATABASE_URL=<from step 1>
   JWT_SECRET=your-super-secret-key-change-this-min-32-chars
   NODE_ENV=production
   PORT=5000
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-gmail-app-password
   SMTP_FROM=noreply@yourplatform.com
   STRIPE_SECRET_KEY=sk_test_... (get from stripe.com/dashboard)
   ```

6. In Settings → Build, set:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

7. Deploy! Your backend URL will be: `https://your-app.up.railway.app`

### Step 3: Run Database Migrations

1. In Railway, click on your backend service
2. Click "Shell" tab
3. Run:
   ```bash
   psql $DATABASE_URL -f database/schema.sql
   ```

### Step 4: Frontend Deployment (Vercel - FREE)

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project" → Import your repository
4. Configure:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend.up.railway.app/api
   ```

6. Deploy!

### Step 5: Test Your Application

1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Login with default credentials:
   - **Root Admin**: root@propfirm.com / admin123
3. Create your first Admin account
4. Create a challenge
5. Register as a user and test!

---

## 🔧 ALTERNATIVE: Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd prop-firm-saas

# 2. Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your values

# 3. Setup Database
createdb propfirm_saas
psql -d propfirm_saas -f database/schema.sql

# 4. Start Backend
npm run dev

# 5. Setup Frontend (new terminal)
cd ../frontend
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev
```

Access at: http://localhost:3000

---

## 📧 Gmail SMTP Setup

1. Enable 2FA on your Google Account
2. Go to: https://myaccount.google.com/apppasswords
3. Create app password for "Mail"
4. Use this password in `SMTP_PASS`

---

## 💳 Stripe Setup

1. Create account: https://dashboard.stripe.com/register
2. Get test keys: https://dashboard.stripe.com/test/apikeys
3. Add to environment variables

---

## 🎉 You're Done!

Your multi-tenant prop trading platform is now live!

**Next Steps:**
- Change default root password
- Configure your branding
- Create your first challenge
- Invite users

**Support:**
- Check README.md for full documentation
- See database/schema.sql for database structure
- All API routes in backend/routes/

---

## 🆓 Free Tier Limits

**Railway:**
- 500 hours/month
- 512MB RAM
- 1GB storage
- Perfect for MVP

**Vercel:**
- Unlimited bandwidth
- 100GB bandwidth/month
- Serverless functions
- Custom domain support

**Total Cost:** $0/month for testing and small scale!

---

## 🚨 Common Issues

**Database connection failed:**
```bash
# Check if DATABASE_URL is set correctly
echo $DATABASE_URL
```

**Port already in use:**
```bash
# Kill the process
lsof -ti:5000 | xargs kill -9
```

**CORS errors:**
- Make sure `FRONTEND_URL` in backend .env matches your Vercel URL
- Check if API_URL in frontend .env is correct

---

Built with ❤️ for prop trading platforms
