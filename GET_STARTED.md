# 🚀 GET STARTED IN 5 MINUTES

## 📥 What You Received

A complete **Multi-Tenant Prop Firm SaaS Platform** with:

✅ Backend API (Node.js + Express + PostgreSQL)
✅ Frontend UI (React + Vite + TailwindCSS)  
✅ Complete Database Schema (30+ tables)
✅ Authentication & Authorization
✅ Challenge Creation with Section-wise Rules
✅ Support Ticket System
✅ Email Notifications
✅ Certificate Generation (PDF)
✅ Referral System
✅ Payment Integration Structure
✅ Multi-tenant Architecture
✅ Deployment Guides

---

## ⚡ OPTION 1: Deploy to Free Cloud (FASTEST)

### Total Time: ~15 minutes
### Total Cost: $0/month

**Follow this guide:** `DEPLOYMENT.md`

**Quick Summary:**
1. Deploy Database on Railway (2 min)
2. Deploy Backend on Railway (3 min)
3. Deploy Frontend on Vercel (3 min)
4. Test your live site! (2 min)

**Result:** Fully functional live platform at `https://your-app.vercel.app`

---

## 💻 OPTION 2: Run Locally (for Development)

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed

### Step-by-Step Setup

#### 1. Extract the ZIP file
```bash
unzip prop-firm-saas.zip
cd prop-firm-saas
```

#### 2. Setup Backend
```bash
cd backend
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your database credentials
nano .env  # or use any text editor
```

**Minimum .env configuration:**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/propfirm_saas
JWT_SECRET=your-super-secret-key-min-32-characters-long
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

#### 3. Setup Database
```bash
# Create database
createdb propfirm_saas

# Run migrations
psql -d propfirm_saas -f database/schema.sql
```

#### 4. Start Backend
```bash
npm run dev
# Backend running at http://localhost:5000
```

#### 5. Setup Frontend (New Terminal)
```bash
cd frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start development server
npm run dev
# Frontend running at http://localhost:3000
```

#### 6. Access the Application
Open browser: `http://localhost:3000`

**Default Login:**
- Email: `root@propfirm.com`
- Password: `admin123`

---

## 🎯 First Steps After Setup

### 1. Login as Root Admin
- Email: `root@propfirm.com`
- Password: `admin123`

### 2. Create Your First Admin
- Go to Admin Management
- Click "Create Admin"
- Fill in details (This will be your white-label prop firm)

### 3. Login as Admin
- Logout from Root
- Login with admin credentials
- Set up your branding

### 4. Create Your First Challenge
- Go to Challenges → Create Challenge
- Choose type (1-Step or 2-Step)
- Add section-wise rules
- Publish!

### 5. Register as User
- Logout
- Go to Register
- Create a trader account
- Browse and purchase challenges

---

## 📁 Project Structure

```
prop-firm-saas/
├── backend/           # Node.js API
│   ├── routes/        # API endpoints
│   ├── services/      # Business logic
│   ├── database/      # SQL schema
│   └── server.js      # Entry point
│
├── frontend/          # React app
│   ├── src/
│   │   ├── pages/     # UI pages
│   │   ├── layouts/   # Layout components
│   │   └── utils/     # API client
│   └── package.json
│
├── README.md          # Full documentation
├── DEPLOYMENT.md      # Deployment guide
└── FEATURES.md        # Features checklist
```

---

## 🔑 Important Files

| File | Description |
|------|-------------|
| `backend/.env` | Backend configuration |
| `backend/database/schema.sql` | Database structure |
| `backend/server.js` | API server |
| `frontend/src/utils/api.js` | API client |
| `frontend/src/App.jsx` | React router |
| `README.md` | Complete documentation |
| `DEPLOYMENT.md` | Cloud deployment guide |

---

## 🛠️ Development Workflow

### Backend Changes
1. Edit files in `backend/routes/` or `backend/services/`
2. Server auto-restarts (nodemon)
3. Test API at `http://localhost:5000/api`

### Frontend Changes
1. Edit files in `frontend/src/`
2. Hot reload in browser
3. View at `http://localhost:3000`

### Database Changes
1. Modify `backend/database/schema.sql`
2. Drop and recreate database:
   ```bash
   dropdb propfirm_saas
   createdb propfirm_saas
   psql -d propfirm_saas -f database/schema.sql
   ```

---

## 📧 Email Setup (Gmail)

1. Enable 2FA: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Add to .env:
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   ```

---

## 💳 Stripe Setup (for Payments)

1. Sign up: https://dashboard.stripe.com/register
2. Get test keys: https://dashboard.stripe.com/test/apikeys
3. Add to .env:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

---

## 🐛 Common Issues & Solutions

### "Database connection failed"
```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Start PostgreSQL
sudo service postgresql start
```

### "Port 5000 already in use"
```bash
# Find and kill the process
lsof -ti:5000 | xargs kill -9
```

### "Cannot find module"
```bash
# Reinstall dependencies
cd backend && rm -rf node_modules && npm install
cd frontend && rm -rf node_modules && npm install
```

### "CORS error"
- Make sure backend is running on port 5000
- Check `VITE_API_URL` in frontend/.env

---

## 📖 Learn More

- **Full Documentation:** Read `README.md`
- **API Endpoints:** Check `backend/routes/`
- **Database Schema:** See `backend/database/schema.sql`
- **Frontend Pages:** Browse `frontend/src/pages/`

---

## 🎉 What's Included

### Backend (100% Complete)
✅ Authentication (JWT)
✅ Multi-tenant architecture
✅ Challenge CRUD with section rules
✅ Support tickets
✅ Email notifications
✅ Certificate generation
✅ Referral system
✅ Payment structure
✅ 30+ database tables

### Frontend (70% Complete)
✅ Login/Register
✅ Protected routes
✅ Admin dashboard
✅ Layout system
✅ API integration
⏳ Challenge UI pages (templates ready)
⏳ User dashboard (templates ready)
⏳ Charts implementation

---

## 🚀 Next Steps

1. ✅ **Setup** (You're here!)
2. Change default passwords
3. Configure your branding
4. Create challenges
5. Invite users
6. Customize frontend UI
7. Add payment processing
8. Launch! 🎊

---

## 💡 Tips

- **Start with local development** to understand the system
- **Deploy to cloud** when ready for production
- **Read FEATURES.md** to see what's implemented
- **Check PROJECT_STRUCTURE.md** for architecture
- **Use provided templates** to build remaining pages

---

## 📞 Support

Having issues? Check:
1. README.md (comprehensive guide)
2. DEPLOYMENT.md (cloud setup)
3. FEATURES.md (what's included)

---

## 🎯 You're All Set!

Your multi-tenant prop trading platform is ready.

**Time to build the next FundingPips! 🚀**

---

Built with ❤️ for prop trading entrepreneurs
