-- Multi-Tenant Prop Firm SaaS Database Schema
-- PostgreSQL Database

-- ============================================
-- CORE TABLES
-- ============================================

-- Root Admins Table
CREATE TABLE root_admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plans Table
CREATE TABLE plans (
    id SERIAL PRIMARY KEY,
    plan_name VARCHAR(255) NOT NULL,
    monthly_price DECIMAL(10, 2) NOT NULL,
    revenue_share_percentage DECIMAL(5, 2) NOT NULL,
    challenge_limit INTEGER NOT NULL,
    user_limit INTEGER NOT NULL,
    coupon_enabled BOOLEAN DEFAULT false,
    custom_domain_enabled BOOLEAN DEFAULT false,
    advanced_analytics_enabled BOOLEAN DEFAULT false,
    api_access BOOLEAN DEFAULT false,
    storage_limit_mb INTEGER DEFAULT 1000,
    features JSON,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admins Table (White-label Prop Firm Owners)
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    plan_id INTEGER REFERENCES plans(id),
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    subscription_status VARCHAR(50) DEFAULT 'active', -- active, expired, suspended
    challenges_used INTEGER DEFAULT 0,
    users_count INTEGER DEFAULT 0,
    total_revenue DECIMAL(15, 2) DEFAULT 0,
    commission_owed DECIMAL(15, 2) DEFAULT 0,
    wallet_balance DECIMAL(15, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    subdomain VARCHAR(100) UNIQUE,
    custom_domain VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Branding Table
CREATE TABLE admin_branding (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER UNIQUE REFERENCES admins(id) ON DELETE CASCADE,
    logo_url VARCHAR(500),
    favicon_url VARCHAR(500),
    primary_color VARCHAR(7) DEFAULT '#3B82F6',
    secondary_color VARCHAR(7) DEFAULT '#10B981',
    footer_text TEXT,
    about_us TEXT,
    social_links JSON,
    email_template TEXT,
    show_powered_by BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table (Traders)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    kyc_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    kyc_document_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    referral_code VARCHAR(50) UNIQUE,
    referred_by_user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(admin_id, email)
);

-- ============================================
-- CHALLENGE SYSTEM
-- ============================================

-- Challenge Templates (Pre-built templates)
CREATE TABLE challenge_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    challenge_type VARCHAR(50) NOT NULL, -- 1_step, 2_step, instant
    config JSON NOT NULL, -- Stores all challenge rules
    is_global BOOLEAN DEFAULT true, -- Available to all admins
    created_by_root BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Challenges Table
CREATE TABLE challenges (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
    challenge_name VARCHAR(255) NOT NULL,
    challenge_type VARCHAR(50) NOT NULL, -- 1_step, 2_step, instant
    account_size DECIMAL(15, 2) NOT NULL,
    entry_fee DECIMAL(10, 2) NOT NULL,
    leverage VARCHAR(20) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    is_refundable BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'draft', -- draft, published, archived
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Challenge Rules (Section-wise rules system)
CREATE TABLE challenge_rules (
    id SERIAL PRIMARY KEY,
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
    section_name VARCHAR(100) NOT NULL, -- profit_targets, drawdown_limits, trading_days, restrictions, etc.
    section_order INTEGER DEFAULT 0,
    rules JSON NOT NULL, -- Array of rule objects with {rule_number, rule_name, rule_value, rule_description}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example of rules JSON structure:
-- {
--   "rules": [
--     {"rule_number": 1, "rule_name": "Profit Target", "rule_value": "10%", "description": "Achieve 10% profit"},
--     {"rule_number": 2, "rule_name": "Max Daily Drawdown", "rule_value": "5%", "description": "Don't exceed 5% daily loss"}
--   ]
-- }

-- Challenge Trading Restrictions
CREATE TABLE challenge_restrictions (
    id SERIAL PRIMARY KEY,
    challenge_id INTEGER UNIQUE REFERENCES challenges(id) ON DELETE CASCADE,
    news_trading_allowed BOOLEAN DEFAULT true,
    scalping_allowed BOOLEAN DEFAULT true,
    hedging_allowed BOOLEAN DEFAULT true,
    martingale_allowed BOOLEAN DEFAULT false,
    ea_allowed BOOLEAN DEFAULT true,
    copy_trading_allowed BOOLEAN DEFAULT true,
    grid_allowed BOOLEAN DEFAULT false,
    arbitrage_allowed BOOLEAN DEFAULT false,
    overnight_holding_allowed BOOLEAN DEFAULT true,
    weekend_holding_allowed BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Challenge Allowed Segments
CREATE TABLE challenge_segments (
    id SERIAL PRIMARY KEY,
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
    segment_name VARCHAR(50) NOT NULL, -- forex, crypto, indices, commodities, stocks
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(challenge_id, segment_name)
);

-- ============================================
-- ORDER & PAYMENT SYSTEM
-- ============================================

-- Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id),
    user_id INTEGER REFERENCES users(id),
    challenge_id INTEGER REFERENCES challenges(id),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    original_price DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    final_price DECIMAL(10, 2) NOT NULL,
    coupon_id INTEGER,
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
    payment_method VARCHAR(50),
    payment_intent_id VARCHAR(255), -- Stripe payment intent
    commission_percentage DECIMAL(5, 2) NOT NULL,
    commission_amount DECIMAL(10, 2) NOT NULL,
    admin_earning DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Challenges (Purchased challenges)
CREATE TABLE user_challenges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    challenge_id INTEGER REFERENCES challenges(id),
    order_id INTEGER REFERENCES orders(id),
    status VARCHAR(50) DEFAULT 'active', -- active, passed, failed, funded
    current_balance DECIMAL(15, 2),
    profit_target DECIMAL(15, 2),
    current_profit DECIMAL(15, 2) DEFAULT 0,
    max_drawdown DECIMAL(15, 2),
    current_drawdown DECIMAL(15, 2) DEFAULT 0,
    trading_days_completed INTEGER DEFAULT 0,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    mt4_login VARCHAR(100),
    mt4_password VARCHAR(100),
    mt4_server VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Commissions Table
CREATE TABLE commissions (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id),
    order_id INTEGER REFERENCES orders(id),
    commission_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, settled, disputed
    settled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- COUPON SYSTEM
-- ============================================

CREATE TABLE coupons (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
    coupon_code VARCHAR(50) NOT NULL,
    discount_type VARCHAR(20) NOT NULL, -- percentage, flat
    discount_value DECIMAL(10, 2) NOT NULL,
    min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount DECIMAL(10, 2),
    challenge_id INTEGER REFERENCES challenges(id), -- NULL = applies to all
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(admin_id, coupon_code)
);

-- ============================================
-- PAYOUT SYSTEM
-- ============================================

CREATE TABLE payouts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    user_challenge_id INTEGER REFERENCES user_challenges(id),
    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, paid
    bank_name VARCHAR(255),
    account_number VARCHAR(100),
    account_holder_name VARCHAR(255),
    ifsc_code VARCHAR(50),
    swift_code VARCHAR(50),
    rejection_reason TEXT,
    approved_by INTEGER, -- admin_id
    approved_at TIMESTAMP,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Withdrawals (Admin withdrawing from wallet)
CREATE TABLE admin_withdrawals (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id),
    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, paid
    bank_name VARCHAR(255),
    account_number VARCHAR(100),
    account_holder_name VARCHAR(255),
    ifsc_code VARCHAR(50),
    swift_code VARCHAR(50),
    rejection_reason TEXT,
    approved_by INTEGER, -- root_admin_id
    approved_at TIMESTAMP,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- REFERRAL SYSTEM
-- ============================================

CREATE TABLE referrals (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id),
    referrer_user_id INTEGER REFERENCES users(id),
    referred_user_id INTEGER REFERENCES users(id),
    referral_code VARCHAR(50) NOT NULL,
    reward_type VARCHAR(50), -- discount, cash, credit
    reward_amount DECIMAL(10, 2),
    reward_status VARCHAR(50) DEFAULT 'pending', -- pending, credited, expired
    credited_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE referral_settings (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER UNIQUE REFERENCES admins(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT false,
    referrer_reward_type VARCHAR(50) DEFAULT 'discount', -- discount, cash
    referrer_reward_value DECIMAL(10, 2) DEFAULT 0,
    referred_reward_type VARCHAR(50) DEFAULT 'discount',
    referred_reward_value DECIMAL(10, 2) DEFAULT 0,
    min_purchase_for_reward DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CERTIFICATE SYSTEM
-- ============================================

CREATE TABLE certificates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    user_challenge_id INTEGER REFERENCES user_challenges(id),
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    certificate_type VARCHAR(50), -- challenge_passed, funded_trader
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    certificate_url VARCHAR(500),
    is_valid BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- EMAIL NOTIFICATION SYSTEM
-- ============================================

CREATE TABLE email_templates (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id), -- NULL for global templates
    template_key VARCHAR(100) NOT NULL, -- welcome_user, challenge_purchase, payout_approved, etc.
    template_name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL, -- HTML content with variables like {{user_name}}, {{challenge_name}}
    variables JSON, -- List of available variables
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(admin_id, template_key)
);

CREATE TABLE email_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id),
    user_id INTEGER REFERENCES users(id),
    template_key VARCHAR(100),
    to_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed
    error_message TEXT,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SUPPORT TICKET SYSTEM
-- ============================================

CREATE TABLE support_tickets (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id),
    user_id INTEGER REFERENCES users(id), -- NULL if admin creates ticket to root
    ticket_number VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(500) NOT NULL,
    category VARCHAR(100), -- technical, payment, challenge, account, other
    priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high, urgent
    status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, closed
    assigned_to INTEGER, -- admin_id or root_admin_id
    created_by_role VARCHAR(50), -- user, admin, root_admin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE TABLE ticket_messages (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL,
    sender_role VARCHAR(50) NOT NULL, -- user, admin, root_admin
    message TEXT NOT NULL,
    attachment_url VARCHAR(500),
    is_internal_note BOOLEAN DEFAULT false, -- Only visible to admins/root
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ACTIVITY & AUDIT LOGS
-- ============================================

CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id),
    user_id INTEGER,
    actor_role VARCHAR(50), -- root_admin, admin, user
    action VARCHAR(255) NOT NULL, -- login, create_challenge, update_plan, etc.
    description TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SUBSCRIPTION MANAGEMENT
-- ============================================

CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER UNIQUE REFERENCES admins(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES plans(id),
    subscription_start_date TIMESTAMP NOT NULL,
    subscription_end_date TIMESTAMP NOT NULL,
    auto_renew BOOLEAN DEFAULT true,
    payment_method VARCHAR(50),
    stripe_subscription_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active', -- active, cancelled, expired
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscription_payments (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER REFERENCES subscriptions(id),
    admin_id INTEGER REFERENCES admins(id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_status VARCHAR(50) DEFAULT 'completed',
    stripe_invoice_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- GLOBAL SETTINGS
-- ============================================

CREATE TABLE global_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50), -- string, number, boolean, json
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_users_admin_id ON users(admin_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_challenges_admin_id ON challenges(admin_id);
CREATE INDEX idx_orders_admin_id ON orders(admin_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX idx_support_tickets_admin_id ON support_tickets(admin_id);
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_activity_logs_admin_id ON activity_logs(admin_id);
CREATE INDEX idx_email_logs_admin_id ON email_logs(admin_id);
CREATE INDEX idx_certificates_user_id ON certificates(user_id);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_user_id);

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default root admin (password: admin123)
INSERT INTO root_admins (email, password, full_name) 
VALUES ('root@propfirm.com', '$2a$10$rZJ3qGN.8qEKmVvE7Zqz4.5YJXK4UqrXdJw5Kj.xJQoF5VxZ.KmWy', 'Root Admin');

-- Insert default plans
INSERT INTO plans (plan_name, monthly_price, revenue_share_percentage, challenge_limit, user_limit, coupon_enabled, custom_domain_enabled, advanced_analytics_enabled, api_access, storage_limit_mb) VALUES
('Starter', 49.00, 15.00, 10, 500, true, false, false, false, 1000),
('Professional', 149.00, 12.00, 50, 5000, true, true, true, false, 5000),
('Enterprise', 499.00, 8.00, -1, -1, true, true, true, true, 20000);

-- Insert global email templates
INSERT INTO email_templates (admin_id, template_key, template_name, subject, body, variables) VALUES
(NULL, 'welcome_user', 'Welcome Email', 'Welcome to {{company_name}}!', '<h1>Welcome {{user_name}}!</h1><p>Thank you for joining {{company_name}}.</p>', '["user_name", "company_name"]'),
(NULL, 'challenge_purchase', 'Challenge Purchase Confirmation', 'Your Challenge Purchase - {{challenge_name}}', '<h1>Purchase Confirmed!</h1><p>Hi {{user_name}},</p><p>You have successfully purchased {{challenge_name}}.</p>', '["user_name", "challenge_name", "order_number", "amount"]'),
(NULL, 'payout_approved', 'Payout Approved', 'Your Payout Request Approved', '<h1>Congratulations {{user_name}}!</h1><p>Your payout request of {{amount}} has been approved.</p>', '["user_name", "amount", "payout_id"]'),
(NULL, 'subscription_expiry', 'Subscription Expiry Reminder', 'Your Subscription Expires Soon', '<h1>Hi {{admin_name}},</h1><p>Your subscription expires on {{expiry_date}}.</p>', '["admin_name", "expiry_date", "plan_name"]');

-- Insert global settings
INSERT INTO global_settings (setting_key, setting_value, setting_type, description) VALUES
('platform_name', 'PropFirm SaaS', 'string', 'Platform name'),
('max_leverage', '1:100', 'string', 'Maximum leverage allowed globally'),
('min_profit_target', '5', 'number', 'Minimum profit target percentage'),
('max_daily_drawdown', '10', 'number', 'Maximum daily drawdown allowed');
