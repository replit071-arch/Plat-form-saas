#!/bin/bash

# PropFirm SaaS - Quick Vercel Deployment Script
# This script helps you deploy to Vercel step by step

set -e

echo "=============================================="
echo "PropFirm SaaS - Vercel Deployment Helper"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_info "Installing Vercel CLI..."
    npm install -g vercel
    print_success "Vercel CLI installed"
else
    print_success "Vercel CLI is already installed"
fi

echo ""
print_info "STEP 1: Database Setup"
echo "----------------------------------------"
echo "Before deploying, you need a database URL from Railway."
echo ""
echo "Follow these steps:"
echo "1. Go to https://railway.app"
echo "2. Create a new project"
echo "3. Click 'Provision PostgreSQL'"
echo "4. Go to Variables tab and copy DATABASE_URL"
echo ""
read -p "Do you have your Railway DATABASE_URL? (y/N): " HAS_DB_URL

if [[ ! $HAS_DB_URL =~ ^[Yy]$ ]]; then
    print_error "Please get your DATABASE_URL from Railway first!"
    echo ""
    echo "Quick guide:"
    echo "  1. Go to https://railway.app"
    echo "  2. New Project → PostgreSQL"
    echo "  3. Copy DATABASE_URL"
    exit 1
fi

read -p "Paste your DATABASE_URL: " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL cannot be empty!"
    exit 1
fi

print_success "Database URL saved"

# Check if migrations need to be run
echo ""
print_info "Running database migrations..."
echo ""

if command -v psql &> /dev/null; then
    psql "$DATABASE_URL" -f database/schema.sql
    print_success "Database migrations completed"
else
    print_error "PostgreSQL client not found!"
    echo ""
    echo "You have two options:"
    echo ""
    echo "Option 1: Install PostgreSQL client"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt install postgresql-client"
    echo ""
    echo "Option 2: Use Railway shell"
    echo "  1. Go to Railway dashboard"
    echo "  2. Click on PostgreSQL service"
    echo "  3. Click 'Connect' → 'Shell'"
    echo "  4. Copy and paste contents of database/schema.sql"
    echo ""
    read -p "Have you run migrations using Railway shell? (y/N): " RAN_MIGRATIONS
    
    if [[ ! $RAN_MIGRATIONS =~ ^[Yy]$ ]]; then
        print_error "Please run migrations first!"
        exit 1
    fi
    
    print_success "Migrations confirmed"
fi

echo ""
print_info "STEP 2: Environment Variables"
echo "----------------------------------------"

# Collect environment variables
read -p "JWT Secret (32+ characters): " JWT_SECRET
read -p "SMTP Host (e.g., smtp.gmail.com): " SMTP_HOST
read -p "SMTP Port (587): " SMTP_PORT
SMTP_PORT=${SMTP_PORT:-587}
read -p "SMTP User (your email): " SMTP_USER
read -sp "SMTP Password (app password): " SMTP_PASS
echo ""
read -p "SMTP From (noreply@yourplatform.com): " SMTP_FROM
read -p "Stripe Secret Key (sk_test_...): " STRIPE_SECRET_KEY
read -p "Stripe Publishable Key (pk_test_...): " STRIPE_PUBLISHABLE_KEY

echo ""
print_success "Environment variables collected"

echo ""
print_info "STEP 3: Login to Vercel"
echo "----------------------------------------"

vercel login

print_success "Logged in to Vercel"

echo ""
print_info "STEP 4: Deploy Backend"
echo "----------------------------------------"

cd backend

echo "Deploying backend to Vercel..."
BACKEND_URL=$(vercel --prod --confirm | grep -o 'https://[^[:space:]]*' | tail -1)

if [ -z "$BACKEND_URL" ]; then
    print_error "Failed to get backend URL"
    exit 1
fi

print_success "Backend deployed to: $BACKEND_URL"

# Add environment variables to Vercel
echo ""
print_info "Setting up environment variables..."

echo "$DATABASE_URL" | vercel env add DATABASE_URL production
echo "$JWT_SECRET" | vercel env add JWT_SECRET production
echo "production" | vercel env add NODE_ENV production
echo "$SMTP_HOST" | vercel env add SMTP_HOST production
echo "$SMTP_PORT" | vercel env add SMTP_PORT production
echo "$SMTP_USER" | vercel env add SMTP_USER production
echo "$SMTP_PASS" | vercel env add SMTP_PASS production
echo "$SMTP_FROM" | vercel env add SMTP_FROM production
echo "$STRIPE_SECRET_KEY" | vercel env add STRIPE_SECRET_KEY production
echo "$STRIPE_PUBLISHABLE_KEY" | vercel env add STRIPE_PUBLISHABLE_KEY production

print_success "Environment variables set"

# Redeploy with env vars
echo ""
print_info "Redeploying with environment variables..."
vercel --prod --confirm
print_success "Backend deployed with environment variables"

cd ..

echo ""
print_info "STEP 5: Deploy Frontend"
echo "----------------------------------------"

cd frontend

# Add frontend environment variable
echo "${BACKEND_URL}/api" | vercel env add VITE_API_URL production

echo "Deploying frontend to Vercel..."
FRONTEND_URL=$(vercel --prod --confirm | grep -o 'https://[^[:space:]]*' | tail -1)

if [ -z "$FRONTEND_URL" ]; then
    print_error "Failed to get frontend URL"
    exit 1
fi

print_success "Frontend deployed to: $FRONTEND_URL"

cd ..

echo ""
print_info "STEP 6: Update Backend CORS"
echo "----------------------------------------"

cd backend
echo "$FRONTEND_URL" | vercel env add FRONTEND_URL production
vercel --prod --confirm
cd ..

print_success "CORS configured"

echo ""
echo "=============================================="
print_success "DEPLOYMENT COMPLETE!"
echo "=============================================="
echo ""
echo "Your PropFirm SaaS is now live:"
echo ""
echo "🌐 Frontend: $FRONTEND_URL"
echo "🔧 Backend: $BACKEND_URL"
echo "💾 Database: Railway PostgreSQL"
echo ""
echo "Default login:"
echo "  Email: root@propfirm.com"
echo "  Password: admin123"
echo ""
echo "⚠️  IMPORTANT: Change the root password immediately!"
echo ""
echo "Next steps:"
echo "  1. Visit $FRONTEND_URL"
echo "  2. Login with default credentials"
echo "  3. Change root password"
echo "  4. Create your first admin"
echo "  5. Start creating challenges!"
echo ""
echo "=============================================="
