#!/bin/bash

# PropFirm SaaS - Complete Database Setup Script
# This script will create and configure your PostgreSQL database

set -e

echo "======================================"
echo "PropFirm SaaS - Database Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL is not installed!"
    echo ""
    echo "Please install PostgreSQL first:"
    echo "  - macOS: brew install postgresql"
    echo "  - Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    echo "  - Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi

print_success "PostgreSQL is installed"

# Get database configuration
echo ""
print_info "Database Configuration"
echo "----------------------"

read -p "Database name [propfirm_saas]: " DB_NAME
DB_NAME=${DB_NAME:-propfirm_saas}

read -p "Database user [postgres]: " DB_USER
DB_USER=${DB_USER:-postgres}

read -sp "Database password: " DB_PASSWORD
echo ""

read -p "Database host [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Database port [5432]: " DB_PORT
DB_PORT=${DB_PORT:-5432}

echo ""
print_info "Creating database: $DB_NAME"

# Check if database exists
if PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -p $DB_PORT -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    print_info "Database $DB_NAME already exists"
    read -p "Do you want to drop and recreate it? (y/N): " RECREATE
    if [[ $RECREATE =~ ^[Yy]$ ]]; then
        print_info "Dropping existing database..."
        PGPASSWORD=$DB_PASSWORD dropdb -U $DB_USER -h $DB_HOST -p $DB_PORT $DB_NAME
        print_success "Database dropped"
        
        print_info "Creating new database..."
        PGPASSWORD=$DB_PASSWORD createdb -U $DB_USER -h $DB_HOST -p $DB_PORT $DB_NAME
        print_success "Database created"
    fi
else
    print_info "Creating new database..."
    PGPASSWORD=$DB_PASSWORD createdb -U $DB_USER -h $DB_HOST -p $DB_PORT $DB_NAME
    print_success "Database created"
fi

# Run schema migration
echo ""
print_info "Running database migrations..."

if [ ! -f "database/schema.sql" ]; then
    print_error "schema.sql not found!"
    print_error "Make sure you're running this script from the backend directory"
    exit 1
fi

PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -f database/schema.sql

if [ $? -eq 0 ]; then
    print_success "Database schema created successfully!"
else
    print_error "Failed to create database schema"
    exit 1
fi

# Generate DATABASE_URL
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"

echo ""
print_success "Database setup complete!"
echo ""
echo "======================================"
echo "Database Connection Details"
echo "======================================"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo ""
echo "Add this to your .env file:"
echo "DATABASE_URL=$DATABASE_URL"
echo ""

# Update .env file if it exists
if [ -f ".env" ]; then
    read -p "Do you want to update .env file automatically? (y/N): " UPDATE_ENV
    if [[ $UPDATE_ENV =~ ^[Yy]$ ]]; then
        if grep -q "^DATABASE_URL=" .env; then
            sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" .env
            print_success ".env file updated"
        else
            echo "DATABASE_URL=$DATABASE_URL" >> .env
            print_success "DATABASE_URL added to .env file"
        fi
    fi
else
    print_info "No .env file found. Creating one..."
    cp .env.example .env
    sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" .env
    print_success ".env file created"
    echo ""
    print_info "Please edit .env and add your SMTP and Stripe credentials"
fi

echo ""
print_success "All done! Your database is ready to use."
echo ""
echo "Default login credentials:"
echo "  Email: root@propfirm.com"
echo "  Password: admin123"
echo ""
print_info "IMPORTANT: Change the root password immediately after first login!"
echo ""
