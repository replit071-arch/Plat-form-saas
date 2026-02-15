# 🚀 COMPLETE VERCEL DEPLOYMENT GUIDE

## Overview: Deploy EVERYTHING on Vercel + Free Database

This guide shows you how to deploy:
- ✅ Frontend on Vercel
- ✅ Backend on Vercel (Serverless Functions)
- ✅ Database on Railway (Free PostgreSQL)

**Total Cost: $0/month for hobby projects**

---

## 📋 Prerequisites

- GitHub account
- Vercel account (free): https://vercel.com/signup
- Railway account (free): https://railway.app

---

## STEP 1: Setup Database on Railway

### 1.1 Create Railway Account
1. Go to https://railway.app
2. Click "Start a New Project"
3. Login with GitHub

### 1.2 Create PostgreSQL Database
1. Click "New Project"
2. Select "Provision PostgreSQL"
3. Wait for database to provision (30 seconds)

### 1.3 Get Database URL
1. Click on the PostgreSQL service
2. Go to "Variables" tab
3. Find `DATABASE_URL` - it looks like:
   ```
   postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway
   ```
4. **Copy this URL** - you'll need it!

### 1.4 Run Database Migrations

#### Option A: From Your Computer
```bash
# Make sure PostgreSQL client is installed
# macOS: brew install postgresql
# Ubuntu: sudo apt install postgresql-client

# Run migrations
psql "postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway" -f backend/database/schema.sql
```

#### Option B: Using Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run psql $DATABASE_URL -f backend/database/schema.sql
```

#### Option C: Using Railway Web Shell
1. In Railway dashboard, click on PostgreSQL service
2. Click "Connect" tab
3. Click "Shell"
4. Copy and paste the contents of `backend/database/schema.sql`
5. Press Enter

**✅ Database is now ready!**

---

## STEP 2: Prepare Your Code for Vercel

### 2.1 Create Vercel Configuration for Backend

Create `backend/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2.2 Update Backend server.js

Add this to the END of your `backend/server.js`:

```javascript
// Export for Vercel serverless
export default app;
```

### 2.3 Create Root vercel.json (for monorepo)

Create `vercel.json` in the ROOT directory:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

---

## STEP 3: Deploy Backend to Vercel

### 3.1 Push Code to GitHub
```bash
cd prop-firm-saas

# Initialize git if not already
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/prop-firm-saas.git
git branch -M main
git push -u origin main
```

### 3.2 Deploy Backend on Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Output Directory:** `.` (leave default)
   - **Install Command:** `npm install`

5. Click "Environment Variables" and add:

```
DATABASE_URL=postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway
JWT_SECRET=your-super-secret-key-change-this-min-32-chars
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=noreply@yourplatform.com
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
FRONTEND_URL=https://your-frontend.vercel.app
```

6. Click "Deploy"

**Your backend is now live at:** `https://your-backend-xxxx.vercel.app`

---

## STEP 4: Deploy Frontend to Vercel

### 4.1 Create New Project on Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import SAME GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. Click "Environment Variables" and add:

```
VITE_API_URL=https://your-backend-xxxx.vercel.app/api
```

6. Click "Deploy"

**Your frontend is now live at:** `https://your-frontend-yyyy.vercel.app`

---

## STEP 5: Update CORS Settings

### 5.1 Update Backend Environment Variable

1. Go to your backend project on Vercel
2. Click "Settings" → "Environment Variables"
3. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://your-frontend-yyyy.vercel.app
   ```
4. Go to "Deployments" tab
5. Click "..." on latest deployment → "Redeploy"

---

## STEP 6: Test Your Deployment

### 6.1 Test Backend
```bash
# Test health endpoint
curl https://your-backend-xxxx.vercel.app/health

# Should return: {"status":"OK","timestamp":"..."}
```

### 6.2 Test Frontend
1. Open: `https://your-frontend-yyyy.vercel.app`
2. You should see the login page
3. Login with: `root@propfirm.com` / `admin123`

---

## 🎉 DEPLOYMENT COMPLETE!

Your PropFirm SaaS is now live on the internet!

- **Frontend:** https://your-frontend-yyyy.vercel.app
- **Backend API:** https://your-backend-xxxx.vercel.app
- **Database:** Railway PostgreSQL

---

## 🔧 ALTERNATIVE: Deploy Using Vercel CLI

### Install Vercel CLI
```bash
npm install -g vercel
```

### Deploy Backend
```bash
cd backend

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Add environment variables
vercel env add DATABASE_URL
# Paste your Railway DATABASE_URL

vercel env add JWT_SECRET
# Paste your secret

# Add all other env variables...

# Redeploy with env vars
vercel --prod
```

### Deploy Frontend
```bash
cd frontend

# Add environment variable
vercel env add VITE_API_URL
# Paste: https://your-backend.vercel.app/api

# Deploy
vercel --prod
```

---

## 🔗 Connect Custom Domain (Optional)

### For Frontend
1. Go to your frontend project on Vercel
2. Click "Settings" → "Domains"
3. Add your domain: `yourcompany.com`
4. Follow DNS instructions

### For Backend
1. Go to your backend project on Vercel
2. Click "Settings" → "Domains"
3. Add: `api.yourcompany.com`
4. Update frontend env: `VITE_API_URL=https://api.yourcompany.com/api`

---

## 📊 Monitor Your Deployment

### Vercel Dashboard
- **Logs:** See all server logs in real-time
- **Analytics:** Track page views and performance
- **Deployments:** See deployment history

### Railway Dashboard
- **Metrics:** Monitor database CPU, memory, connections
- **Logs:** See database query logs
- **Backups:** Automatic daily backups

---

## 🐛 TROUBLESHOOTING

### Issue: 500 Internal Server Error

**Solution:**
1. Go to Vercel project → "Deployments"
2. Click on latest deployment
3. Click "View Function Logs"
4. Check for errors
5. Most common: Missing environment variables

### Issue: Database Connection Timeout

**Solution:**
1. Check Railway database is running
2. Verify `DATABASE_URL` in Vercel is correct
3. Railway databases sleep after 5 minutes of inactivity (free tier)
4. First request might be slow - this is normal

### Issue: CORS Error

**Solution:**
1. Update `FRONTEND_URL` in backend environment
2. Make sure it matches your actual frontend URL
3. Redeploy backend

### Issue: Module Not Found

**Solution:**
1. Check `package.json` includes all dependencies
2. Redeploy: `vercel --prod`

---

## 💡 PRO TIPS

### 1. Automatic Deployments
- Push to `main` branch → Auto deploy to production
- Push to other branches → Auto deploy to preview URL

### 2. Environment Variables per Branch
```bash
# Production only
vercel env add MY_VAR production

# Preview only
vercel env add MY_VAR preview

# Development only
vercel env add MY_VAR development
```

### 3. View Logs in Real-Time
```bash
vercel logs YOUR_DEPLOYMENT_URL --follow
```

### 4. Rollback Deployment
1. Go to Vercel dashboard
2. Click "Deployments"
3. Find previous working deployment
4. Click "..." → "Promote to Production"

---

## 📈 SCALING TIPS

### Free Tier Limits
**Vercel:**
- 100 GB bandwidth/month
- 100 serverless function invocations/day
- Perfect for MVP and testing

**Railway:**
- $5 free credit/month
- ~500 hours uptime
- 1GB RAM, 1GB storage
- Perfect for small projects

### When to Upgrade
- **Vercel Pro ($20/mo):** Unlimited bandwidth, more function time
- **Railway ($5/mo):** Keep database always on, more resources

---

## 🎓 LEARNING RESOURCES

### Vercel Documentation
- Serverless Functions: https://vercel.com/docs/functions
- Environment Variables: https://vercel.com/docs/environment-variables
- Custom Domains: https://vercel.com/docs/custom-domains

### Railway Documentation
- PostgreSQL: https://docs.railway.app/databases/postgresql
- CLI Usage: https://docs.railway.app/develop/cli

---

## 🔐 SECURITY CHECKLIST

Before going live:

- [ ] Change default root password
- [ ] Add real Stripe keys (not test keys)
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable Railway database SSL
- [ ] Set up proper SMTP (not Gmail for production)
- [ ] Add rate limiting
- [ ] Enable HTTPS only
- [ ] Set up monitoring (Vercel Analytics, Sentry)
- [ ] Create database backups

---

## 📞 NEED HELP?

### Vercel Support
- Community: https://github.com/vercel/vercel/discussions
- Discord: https://vercel.com/discord

### Railway Support
- Discord: https://discord.gg/railway
- Docs: https://docs.railway.app

---

## 🎉 SUCCESS!

Your PropFirm SaaS is now:
- ✅ Deployed to production
- ✅ Accessible worldwide
- ✅ Automatic HTTPS
- ✅ Automatic deployments on git push
- ✅ Free for hobby use
- ✅ Scales automatically

**Share your live URL and start your prop trading business! 🚀**

---

## 📝 QUICK REFERENCE

```bash
# Backend URL
https://your-backend.vercel.app

# Frontend URL
https://your-frontend.vercel.app

# Database URL
Railway Dashboard → PostgreSQL → Connect

# Deploy Commands
vercel --prod                    # Deploy
vercel logs --follow            # View logs
vercel env ls                   # List env vars
vercel domains                  # Manage domains
```

---

**Need the step-by-step visual guide? Check the screenshots folder in the documentation!**
