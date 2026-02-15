# 📁 Project Structure

```
prop-firm-saas/
│
├── backend/                          # Node.js + Express Backend
│   ├── config/
│   │   └── database.js              # PostgreSQL connection
│   │
│   ├── middleware/
│   │   └── auth.js                  # JWT authentication & authorization
│   │
│   ├── routes/
│   │   ├── auth.js                  # Login/Register routes
│   │   ├── challenges.js            # Challenge CRUD + section-wise rules
│   │   └── tickets.js               # Support ticket system
│   │
│   ├── services/
│   │   ├── emailService.js          # Email notification system
│   │   └── certificateService.js    # PDF certificate generation
│   │
│   ├── database/
│   │   └── schema.sql               # Complete database schema
│   │
│   ├── uploads/                     # File uploads storage
│   │   ├── certificates/            # Generated PDF certificates
│   │   ├── documents/               # KYC documents
│   │   └── branding/                # Logo, favicon uploads
│   │
│   ├── .env.example                 # Environment variables template
│   ├── package.json
│   └── server.js                    # Express server entry point
│
├── frontend/                         # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx   # Route protection
│   │   │   └── Placeholders.jsx     # Placeholder components
│   │   │
│   │   ├── layouts/
│   │   │   ├── RootLayout.jsx       # Root admin layout
│   │   │   ├── AdminLayout.jsx      # Admin layout with sidebar
│   │   │   └── UserLayout.jsx       # User layout
│   │   │
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx        # Multi-role login
│   │   │   │   └── Register.jsx     # User registration
│   │   │   │
│   │   │   ├── root/                # Root admin pages
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── AdminManagement.jsx
│   │   │   │   ├── PlanManagement.jsx
│   │   │   │   └── Tickets.jsx
│   │   │   │
│   │   │   ├── admin/               # Admin pages
│   │   │   │   ├── Dashboard.jsx    # Admin dashboard with charts
│   │   │   │   ├── challenges/
│   │   │   │   │   ├── ChallengeList.jsx
│   │   │   │   │   ├── CreateChallenge.jsx
│   │   │   │   │   └── EditChallenge.jsx
│   │   │   │   ├── UserManagement.jsx
│   │   │   │   ├── CouponManagement.jsx
│   │   │   │   ├── BrandingSettings.jsx
│   │   │   │   ├── Tickets.jsx
│   │   │   │   └── PayoutManagement.jsx
│   │   │   │
│   │   │   └── user/                # User pages
│   │   │       ├── Dashboard.jsx
│   │   │       ├── BrowseChallenges.jsx
│   │   │       ├── MyChallenges.jsx
│   │   │       ├── RequestPayout.jsx
│   │   │       ├── Tickets.jsx
│   │   │       ├── Certificates.jsx
│   │   │       └── Referrals.jsx
│   │   │
│   │   ├── utils/
│   │   │   └── api.js               # Axios API wrapper
│   │   │
│   │   ├── App.jsx                  # Main app with routing
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Global styles + Tailwind
│   │
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── README.md                         # Complete documentation
├── DEPLOYMENT.md                     # Quick deployment guide
└── PROJECT_STRUCTURE.md              # This file
```

## 🎯 Key Features by Module

### Backend Modules

#### Authentication (`routes/auth.js`)
- ✅ Root admin login
- ✅ Admin login with subscription check
- ✅ User registration with referral support
- ✅ JWT token generation
- ✅ Activity logging

#### Challenges (`routes/challenges.js`)
- ✅ Create/Edit/Delete challenges
- ✅ Section-wise rules system (dynamic)
- ✅ Trading restrictions management
- ✅ Allowed segments (Forex, Crypto, etc.)
- ✅ Duplicate challenges
- ✅ Archive challenges
- ✅ Publish/Draft status

#### Support Tickets (`routes/tickets.js`)
- ✅ User → Admin tickets
- ✅ Admin → Root tickets
- ✅ Message threading
- ✅ Status updates (Open → In Progress → Resolved)
- ✅ Priority levels
- ✅ Ticket assignment
- ✅ Statistics dashboard

#### Email Service (`services/emailService.js`)
- ✅ Template-based emails
- ✅ Variable replacement
- ✅ Welcome emails
- ✅ Purchase confirmations
- ✅ Payout notifications
- ✅ Subscription expiry reminders
- ✅ Email logs

#### Certificate Service (`services/certificateService.js`)
- ✅ PDF generation using PDFKit
- ✅ Challenge completion certificates
- ✅ Funded trader certificates
- ✅ Unique certificate numbers
- ✅ Branded design
- ✅ Certificate verification

### Database Tables

**Core Tables:**
- `root_admins` - Platform owners
- `admins` - White-label prop firm owners
- `users` - Traders
- `plans` - Subscription plans
- `subscriptions` - Admin subscriptions

**Challenge System:**
- `challenges` - Challenge definitions
- `challenge_rules` - Section-wise rules
- `challenge_restrictions` - Trading rules
- `challenge_segments` - Allowed markets
- `challenge_templates` - Pre-built templates
- `user_challenges` - Purchased challenges

**Financial:**
- `orders` - Challenge purchases
- `commissions` - Revenue tracking
- `payouts` - User payout requests
- `admin_withdrawals` - Admin withdrawals
- `coupons` - Discount codes

**Engagement:**
- `referrals` - Referral tracking
- `referral_settings` - Referral configuration
- `certificates` - Generated certificates
- `email_templates` - Custom email templates
- `email_logs` - Email delivery logs

**Support:**
- `support_tickets` - Ticket system
- `ticket_messages` - Ticket conversation
- `activity_logs` - Audit trail

**Branding:**
- `admin_branding` - Custom branding per admin

## 🔐 Security Features

1. **JWT Authentication** - Secure token-based auth
2. **Role-Based Access Control** - Fine-grained permissions
3. **Multi-Tenant Isolation** - Data segregation by admin_id
4. **Rate Limiting** - Prevent abuse
5. **Password Hashing** - bcrypt encryption
6. **SQL Injection Protection** - Parameterized queries
7. **CORS Protection** - Configured origins
8. **Helmet Security Headers** - XSS, clickjacking protection

## 📊 API Endpoints Summary

### Authentication
- `POST /api/auth/root/login`
- `POST /api/auth/admin/login`
- `POST /api/auth/user/login`
- `POST /api/auth/user/register`
- `POST /api/auth/admin/register`

### Challenges
- `GET /api/challenges` - List challenges
- `POST /api/challenges` - Create challenge
- `GET /api/challenges/:id` - Get challenge details
- `PUT /api/challenges/:id` - Update challenge
- `POST /api/challenges/:id/publish` - Publish challenge
- `POST /api/challenges/:id/duplicate` - Duplicate challenge
- `DELETE /api/challenges/:id` - Delete challenge
- `GET /api/challenges/public/list` - Public challenges

### Support Tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/my-tickets` - User tickets
- `GET /api/tickets/admin-tickets` - Admin tickets
- `GET /api/tickets/:id` - Get ticket details
- `POST /api/tickets/:id/messages` - Add message
- `PATCH /api/tickets/:id/status` - Update status

## 🎨 Frontend Components

### Layouts
- **RootLayout** - Sidebar navigation for root admin
- **AdminLayout** - Sidebar + top bar for admins
- **UserLayout** - Simple layout for traders

### Pages
- **Login** - Multi-role login (Root/Admin/User)
- **Register** - User registration with referral
- **Dashboard** - Role-specific dashboards
- **Challenge Management** - CRUD operations
- **Support Tickets** - Ticket system UI

### Utilities
- **api.js** - Centralized API calls with interceptors
- **ProtectedRoute** - Route authentication

## 🚀 Deployment Architecture

```
┌─────────────┐
│   Vercel    │ ◄── Frontend (React + Vite)
└─────────────┘
       │
       ▼
┌─────────────┐
│   Railway   │ ◄── Backend (Node.js + Express)
└─────────────┘
       │
       ▼
┌─────────────┐
│ PostgreSQL  │ ◄── Database (Railway)
└─────────────┘
```

## 📈 Scalability Considerations

1. **Database Indexing** - All foreign keys indexed
2. **Connection Pooling** - PostgreSQL connection pool
3. **API Rate Limiting** - Prevent abuse
4. **Compression** - gzip compression enabled
5. **Caching Ready** - Redis integration points
6. **Microservice Ready** - Modular structure

## 🔮 Future Enhancements

- [ ] Redis caching layer
- [ ] WebSocket for real-time updates
- [ ] MT4/MT5 API integration
- [ ] Advanced analytics charts
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Automated testing suite
- [ ] CI/CD pipeline
- [ ] Docker containerization

---

Last Updated: 2024
