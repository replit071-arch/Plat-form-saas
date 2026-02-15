# 📱 VISUAL STEP-BY-STEP GUIDE
## Deploy PropFirm SaaS to Vercel in 10 Minutes

---

## 🎯 What We'll Do

```
Railway (Database) → Vercel (Backend) → Vercel (Frontend)
     FREE                 FREE              FREE
```

---

## STEP 1️⃣: Setup Database (2 minutes)

### Go to Railway
```
🌐 Open: https://railway.app
```

### Create Database
```
1. Click "Start a New Project"
2. Click "Provision PostgreSQL"
3. Wait 30 seconds ⏳
```

### Copy Database URL
```
1. Click on "PostgreSQL" card
2. Click "Variables" tab
3. Find "DATABASE_URL"
4. Click "📋 Copy" button

Example URL:
postgresql://postgres:abc123@containers-us-west-123.railway.app:5432/railway
```

### Run Migrations
```bash
# Option A: From your computer
psql "YOUR_DATABASE_URL_HERE" -f backend/database/schema.sql

# Option B: Railway Web Shell
1. Click "Connect" tab
2. Click "Shell"
3. Paste contents of backend/database/schema.sql
4. Press Enter
```

✅ **Database Ready!**

---

## STEP 2️⃣: Deploy Backend (3 minutes)

### Push to GitHub
```bash
# In your project folder
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/propfirm-saas.git
git push -u origin main
```

### Deploy on Vercel
```
1. Go to: https://vercel.com/new
2. Click "Import Git Repository"
3. Select your repo
4. Configure:
   Root Directory: backend
   Framework: Other
   Build Command: npm install
```

### Add Environment Variables
```
Click "Environment Variables" and add:

DATABASE_URL = YOUR_RAILWAY_URL
JWT_SECRET = your-secret-key-32-chars-minimum
NODE_ENV = production
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = your-email@gmail.com
SMTP_PASS = your-gmail-app-password
SMTP_FROM = noreply@yourplatform.com
STRIPE_SECRET_KEY = sk_test_...
STRIPE_PUBLISHABLE_KEY = pk_test_...
```

### Deploy
```
1. Click "Deploy"
2. Wait 1-2 minutes
3. Copy your backend URL:
   https://propfirm-backend-xxx.vercel.app
```

✅ **Backend Live!**

---

## STEP 3️⃣: Deploy Frontend (2 minutes)

### Create New Vercel Project
```
1. Go to: https://vercel.com/new
2. Import SAME repo
3. Configure:
   Root Directory: frontend
   Framework: Vite
   Build Command: npm run build
   Output Directory: dist
```

### Add Environment Variable
```
VITE_API_URL = https://your-backend-xxx.vercel.app/api
```

### Deploy
```
1. Click "Deploy"
2. Wait 1-2 minutes
3. Copy your frontend URL:
   https://propfirm-xxx.vercel.app
```

✅ **Frontend Live!**

---

## STEP 4️⃣: Final Configuration (1 minute)

### Update Backend CORS
```
1. Go to backend project on Vercel
2. Settings → Environment Variables
3. Add:
   FRONTEND_URL = https://your-frontend-xxx.vercel.app
4. Deployments → ... → Redeploy
```

✅ **Done!**

---

## 🎉 TEST YOUR DEPLOYMENT

### Test Backend
```bash
curl https://your-backend-xxx.vercel.app/health

# Should return:
{"status":"OK","timestamp":"..."}
```

### Test Frontend
```
1. Open: https://your-frontend-xxx.vercel.app
2. Should see login page
3. Login:
   Email: root@propfirm.com
   Password: admin123
```

---

## 🚀 AUTOMATED DEPLOYMENT (Easiest!)

Instead of manual steps, run this:

```bash
cd prop-firm-saas
chmod +x deploy-vercel.sh
./deploy-vercel.sh
```

The script will:
- ✅ Check requirements
- ✅ Get your database URL
- ✅ Run migrations
- ✅ Collect all config
- ✅ Deploy backend
- ✅ Deploy frontend
- ✅ Configure CORS
- ✅ Give you live URLs!

---

## 📊 DEPLOYMENT CHECKLIST

Before deploying:
- [ ] Railway account created
- [ ] PostgreSQL database created
- [ ] Database URL copied
- [ ] Migrations run successfully
- [ ] GitHub repo created
- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Gmail app password ready (for emails)
- [ ] Stripe test keys ready (for payments)

After deploying:
- [ ] Backend health check works
- [ ] Frontend loads
- [ ] Can login as root
- [ ] Root password changed
- [ ] First admin created
- [ ] First challenge created
- [ ] Test user registration works

---

## 🐛 COMMON ISSUES

### ❌ "Module not found"
```
Solution: Check package.json has all dependencies
Redeploy: vercel --prod
```

### ❌ "Database connection failed"
```
Solution: 
1. Check DATABASE_URL is correct
2. Railway database is running
3. Try connecting from computer: psql "$DATABASE_URL"
```

### ❌ "CORS error in browser"
```
Solution:
1. Backend project → Settings → Environment Variables
2. Update FRONTEND_URL to match your actual frontend URL
3. Redeploy backend
```

### ❌ "500 Internal Server Error"
```
Solution:
1. Vercel dashboard → Your project
2. Deployments tab → Latest deployment
3. Click "View Function Logs"
4. Check error message
5. Usually missing environment variable
```

---

## 💡 PRO TIPS

### Automatic Deployments
```
Push to main branch = Auto deploy!

git add .
git commit -m "Update feature"
git push

→ Vercel auto-deploys in 1 minute
```

### View Real-Time Logs
```bash
vercel logs https://your-project.vercel.app --follow
```

### Rollback Deployment
```
1. Vercel dashboard → Deployments
2. Find working deployment
3. Click ... → "Promote to Production"
```

### Custom Domain
```
1. Vercel project → Settings → Domains
2. Add your domain
3. Update DNS records as shown
4. SSL auto-configured ✅
```

---

## 📈 FREE TIER LIMITS

**Vercel Free:**
- ✅ 100 GB bandwidth/month
- ✅ Unlimited projects
- ✅ Automatic HTTPS
- ✅ Perfect for MVP

**Railway Free:**
- ✅ $5 credit/month
- ✅ ~500 hours
- ✅ Great for testing

**When to upgrade:**
- High traffic (100K+ visitors/month)
- Large database (>1GB)
- 24/7 uptime needed

---

## 🎓 NEXT STEPS

After deployment:

1. **Change root password**
   ```
   Login → Settings → Change Password
   ```

2. **Create first admin**
   ```
   Root Dashboard → Admin Management → Create Admin
   ```

3. **Setup custom domain**
   ```
   Vercel → Settings → Domains
   ```

4. **Enable monitoring**
   ```
   Vercel → Analytics tab
   ```

5. **Setup backups**
   ```
   Railway → PostgreSQL → Backups (automatic)
   ```

---

## 🔗 USEFUL LINKS

**Documentation:**
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app

**Support:**
- Vercel Discord: https://vercel.com/discord
- Railway Discord: https://discord.gg/railway

**Monitoring:**
- Vercel Analytics: Project → Analytics
- Railway Metrics: Database → Metrics

---

## 🎉 SUCCESS!

```
✅ Database running on Railway
✅ Backend deployed on Vercel
✅ Frontend deployed on Vercel
✅ HTTPS automatically enabled
✅ Auto-deploys on git push
✅ Free for hobby use
✅ Scales automatically

🚀 Your PropFirm SaaS is LIVE!
```

**Share your URL and start your business! 🎊**

---

## 📞 NEED HELP?

Check these files:
- `VERCEL_DEPLOYMENT.md` - Detailed guide
- `SETUP_GUIDE.md` - Local setup
- `DEPLOYMENT.md` - Other platforms
- `README.md` - Full documentation

Or run:
```bash
./deploy-vercel.sh
```

**The automated script handles everything! 🤖**
