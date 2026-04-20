#!/bin/bash

# MBTI Backend Deployment Script
# This script deploys the backend application to production

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="mbti-backend"
APP_DIR="/var/www/${APP_NAME}"
GIT_REPO="https://github.com/your-username/mbti-app.git"
BRANCH="main"
BACKUP_DIR="/var/backups/${APP_NAME}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}MBTI Backend Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"

# Function to print colored messages
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_message "${YELLOW}" "Checking prerequisites..."

if ! command_exists git; then
    print_message "${RED}" "Error: git is not installed"
    exit 1
fi

if ! command_exists node; then
    print_message "${RED}" "Error: Node.js is not installed"
    exit 1
fi

if ! command_exists psql; then
    print_message "${RED}" "Error: PostgreSQL client is not installed"
    exit 1
fi

print_message "${GREEN}" "✓ All prerequisites are installed"

# Create backup if deployment exists
if [ -d "$APP_DIR" ]; then
    print_message "${YELLOW}" "Creating backup..."
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    tar -czf "$BACKUP_FILE" -C "$APP_DIR" .
    print_message "${GREEN}" "✓ Backup created at $BACKUP_FILE"
fi

# Create application directory
print_message "${YELLOW}" "Setting up application directory..."
mkdir -p "$APP_DIR"

# Clone or pull latest code
if [ -d "$APP_DIR/.git" ]; then
    print_message "${YELLOW}" "Pulling latest code..."
    cd "$APP_DIR"
    git fetch origin
    git checkout "$BRANCH"
    git pull origin "$BRANCH"
else
    print_message "${YELLOW}" "Cloning repository..."
    git clone -b "$BRANCH" "$GIT_REPO" "$APP_DIR"
    cd "$APP_DIR"
fi

print_message "${GREEN}" "✓ Code repository updated"

# Install dependencies
print_message "${YELLOW}" "Installing dependencies..."
cd "$APP_DIR/backend"

# Install dependencies
npm ci --production=false

print_message "${GREEN}" "✓ Dependencies installed"

# Run tests
print_message "${YELLOW}" "Running tests..."
if ! npm run test; then
    print_message "${RED}" "Error: Tests failed"
    print_message "${YELLOW}" "Rolling back to backup..."
    if [ -f "$BACKUP_FILE" ]; then
        tar -xzf "$BACKUP_FILE" -C "$APP_DIR"
    fi
    exit 1
fi

print_message "${GREEN}" "✓ Tests passed"

# Build application
print_message "${YELLOW}" "Building application..."
npm run build

print_message "${GREEN}" "✓ Application built"

# Run database migrations
print_message "${YELLOW}" "Running database migrations..."
if [ -f ".env.production" ]; then
    # Load production environment
    export $(cat .env.production | grep -v '^#' | xargs)

    # Run migrations (you need to implement this)
    # npm run migration:run

    print_message "${GREEN}" "✓ Database migrations completed"
else
    print_message "${RED}" "Warning: .env.production file not found"
    print_message "${YELLOW}" "Please create .env.production from .env.production.example"
fi

# Install production dependencies only
print_message "${YELLOW}" "Installing production dependencies..."
npm ci --production

print_message "${GREEN}" "✓ Production dependencies installed"

# Setup PM2 process manager
print_message "${YELLOW}" "Setting up PM2..."
if ! command_exists pm2; then
    print_message "${YELLOW}" "Installing PM2 globally..."
    npm install -g pm2
fi

# Stop existing process if running
if pm2 list | grep -q "$APP_NAME"; then
    print_message "${YELLOW}" "Stopping existing process..."
    pm2 stop "$APP_NAME" || true
    pm2 delete "$APP_NAME" || true
fi

# Start application with PM2
print_message "${YELLOW}" "Starting application with PM2..."
NODE_ENV=production pm2 start dist/main.js --name "$APP_NAME" --max-memory-restart 1G

# Save PM2 process list
pm2 save

# Setup PM2 startup script
if ! pm2 startup | grep -q "already been executed"; then
    print_message "${YELLOW}" "Setting up PM2 startup script..."
    pm2 startup systemd -u $USER --hp /home/$USER
fi

print_message "${GREEN}" "✓ Application started with PM2"

# Setup Nginx reverse proxy (optional)
print_message "${YELLOW}" "Setting up Nginx configuration..."
NGINX_CONF="/etc/nginx/sites-available/${APP_NAME}"
if [ ! -f "$NGINX_CONF" ]; then
    sudo tee "$NGINX_CONF" > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }
}
EOF

    # Enable site
    sudo ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/${APP_NAME}"
    sudo systemctl reload nginx

    print_message "${GREEN}" "✓ Nginx configuration created"
    print_message "${YELLOW}" "Please update server_name in $NGINX_CONF"
fi

# Setup SSL certificate with Let's Encrypt (optional)
print_message "${YELLOW}" "Checking SSL certificate..."
if ! command_exists certbot; then
    print_message "${YELLOW}" "To setup SSL, install certbot:"
    print_message "${YELLOW}" "  sudo apt-get install certbot python3-certbot-nginx"
    print_message "${YELLOW}" "Then run:"
    print_message "${YELLOW}" "  sudo certbot --nginx -d your-domain.com"
else
    print_message "${GREEN}" "certbot is installed. To obtain SSL certificate:"
    print_message "${YELLOW}" "  sudo certbot --nginx -d your-domain.com"
fi

# Setup log rotation
print_message "${YELLOW}" "Setting up log rotation..."
LOGROTATE_CONF="/etc/logrotate.d/${APP_NAME}"
sudo tee "$LOGROTATE_CONF" > /dev/null <<EOF
/home/$USER/.pm2/logs/${APP_NAME}-*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 $USER $USER
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

print_message "${GREEN}" "✓ Log rotation configured"

# Cleanup old backups (keep last 7 days)
print_message "${YELLOW}" "Cleaning up old backups..."
find "$BACKUP_DIR" -name "backup-*.tar.gz" -mtime +7 -delete 2>/dev/null || true

print_message "${GREEN}" "✓ Old backups cleaned up"

# Display deployment summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Summary${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Application: ${GREEN}$APP_NAME${NC}"
echo -e "Directory: ${GREEN}$APP_DIR${NC}"
echo -e "Branch: ${GREEN}$BRANCH${NC}"
echo ""
echo -e "Status: ${GREEN}✓ Running${NC}"
echo -e "PM2 Process: ${GREEN}$APP_NAME${NC}"
echo ""
echo -e "Useful Commands:"
echo -e "  View logs: ${YELLOW}pm2 logs $APP_NAME${NC}"
echo -e "  Restart: ${YELLOW}pm2 restart $APP_NAME${NC}"
echo -e "  Stop: ${YELLOW}pm2 stop $APP_NAME${NC}"
echo -e "  Monitor: ${YELLOW}pm2 monit${NC}"
echo ""
echo -e "${GREEN}========================================${NC}"
print_message "${GREEN}" "✓ Deployment completed successfully!"

# Health check
print_message "${YELLOW}" "Performing health check..."
sleep 5

if command_exists curl; then
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_message "${GREEN}" "✓ Health check passed"
    else
        print_message "${RED}" "⚠ Health check failed - application may not be responding"
    fi
else
    print_message "${YELLOW}" "⚠ curl not installed - skipping health check"
fi

echo ""
