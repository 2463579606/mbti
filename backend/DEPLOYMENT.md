# MBTI Application - Production Deployment Guide

This guide covers deploying the MBTI personality test application to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Deployment Options](#deployment-options)
5. [Monitoring and Maintenance](#monitoring-and-maintenance)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Operating System**: Linux (Ubuntu 22.04+ recommended)
- **Node.js**: v20 or higher
- **PostgreSQL**: v14 or higher
- **Redis**: v7 or higher
- **Memory**: Minimum 2GB RAM (4GB recommended)
- **Storage**: Minimum 20GB disk space
- **CPU**: Minimum 2 cores

### Software Requirements

```bash
# Install Node.js (using nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Install PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Install Redis
sudo apt-get install redis-server

# Install Nginx (for reverse proxy)
sudo apt-get install nginx

# Install PM2 (process manager)
npm install -g pm2
```

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/mbti-app.git
cd mbti-app/backend
```

### 2. Configure Environment Variables

```bash
# Copy production environment template
cp .env.production.example .env.production

# Edit the file with your production values
nano .env.production
```

### Required Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-secure-password
DB_NAME=mbti_prod

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# JWT Secret (generate a secure random string)
JWT_SECRET=$(openssl rand -base64 32)

# AI Configuration
AI_ENABLED=true
AI_API_KEY=your-zhipu-api-key
AI_MODEL=glm-4.7

# Application
NODE_ENV=production
PORT=3000
```

## Database Setup

### 1. Create Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE mbti_prod;
CREATE USER mbti_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE mbti_prod TO mbti_user;
\q
```

### 2. Run Migrations

```bash
# Load database schema
psql -U mbti_user -d mbti_prod -f migrations/init.sql

# Seed initial data (MBTI types and questions)
psql -U mbti_user -d mbti_prod -f migrations/seed.sql
```

### 3. Verify Database

```bash
# Check if tables were created
psql -U mbti_user -d mbti_prod -c "\dt"

# Verify MBTI types
psql -U mbti_user -d mbti_prod -c "SELECT COUNT(*) FROM mbti_types;"

# Verify questions
psql -U mbti_user -d mbti_prod -c "SELECT COUNT(*) FROM questions;"
```

## Deployment Options

### Option 1: Direct Deployment (Recommended for VPS)

#### Automated Deployment

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment script
./deploy.sh
```

#### Manual Deployment

```bash
# Install dependencies
npm install

# Build application
npm run build

# Run tests
npm run test

# Start with PM2
NODE_ENV=production pm2 start dist/main.js --name mbti-backend

# Save PM2 process list
pm2 save

# Setup startup script
pm2 startup systemd
```

### Option 2: Docker Deployment

#### Using Docker Compose

```bash
# Build and start all services
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Stop services
docker-compose -f docker-compose.production.yml down

# Restart specific service
docker-compose -f docker-compose.production.yml restart api
```

#### Using Docker Commands

```bash
# Build image
docker build -t mbti-backend:latest .

# Run container
docker run -d \
  --name mbti-api \
  --env-file .env.production \
  -p 3000:3000 \
  --network mbti-network \
  mbti-backend:latest
```

### Option 3: Kubernetes Deployment

```bash
# Apply Kubernetes configurations
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -l app=mbti-api

# View logs
kubectl logs -f deployment/mbti-api
```

## Monitoring and Maintenance

### Application Monitoring

#### PM2 Monitoring

```bash
# View process list
pm2 list

# Monitor in real-time
pm2 monit

# View logs
pm2 logs mbti-backend

# Show metrics
pm2 show mbti-backend
```

#### Health Checks

```bash
# Basic health check
curl http://localhost:3000/health

# Check AI service
curl http://localhost:3000/api/v1/ai/health

# Database connection check
psql -U mbti_user -d mbti_prod -c "SELECT 1;"
```

### Log Management

```bash
# View application logs
pm2 logs mbti-backend --lines 100

# View error logs only
pm2 logs mbti-backend --err

# Archive old logs
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Database Maintenance

```bash
# Backup database
pg_dump -U mbti_user mbti_prod | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore from backup
gunzip < backup_20240101.sql.gz | psql -U mbti_user mbti_prod

# Analyze table performance
psql -U mbti_user -d mbti_prod -c "VACUUM ANALYZE;"

# Check database size
psql -U mbti_user -d mbti_prod -c "SELECT pg_size_pretty(pg_database_size('mbti_prod'));"
```

### Redis Maintenance

```bash
# Check Redis info
redis-cli INFO

# Monitor Redis commands
redis-cli MONITOR

# Backup Redis data
redis-cli BGSAVE

# Check memory usage
redis-cli INFO memory
```

## Performance Optimization

### Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_test_reports_user_id ON test_reports(user_id);
CREATE INDEX CONCURRENTLY idx_ai_analysis_records_report_id ON ai_analysis_records(report_id);
CREATE INDEX CONCURRENTLY idx_ai_analysis_records_status ON ai_analysis_records(status);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM test_reports WHERE user_id = 1;
```

### Redis Configuration

```conf
# /etc/redis/redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### Application Scaling

```bash
# Start multiple instances with PM2
pm2 start dist/main.js -i max --name mbti-backend

# Or specific number of instances
pm2 start dist/main.js -i 4 --name mbti-backend
```

## Security Best Practices

### 1. Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 2. SSL/TLS Configuration

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

### 3. Environment Variables Security

```bash
# Set restrictive permissions
chmod 600 .env.production

# Never commit .env.production to git
echo ".env.production" >> .gitignore
```

## Troubleshooting

### Common Issues

#### Issue 1: Application won't start

```bash
# Check error logs
pm2 logs mbti-backend --err

# Verify environment variables
pm2 env 0

# Check if port is already in use
sudo lsof -i :3000
```

#### Issue 2: Database connection failed

```bash
# Test database connection
psql -U mbti_user -d mbti_prod -h localhost

# Check PostgreSQL status
sudo systemctl status postgresql

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

#### Issue 3: Redis connection failed

```bash
# Test Redis connection
redis-cli ping

# Check Redis status
sudo systemctl status redis

# View Redis logs
sudo tail -f /var/log/redis/redis-server.log
```

#### Issue 4: AI analysis not working

```bash
# Check AI configuration
curl http://localhost:3000/api/v1/ai/health

# Verify API key
grep AI_API_KEY .env.production

# Check AI service logs
pm2 logs mbti-backend | grep AI
```

### Emergency Recovery

```bash
# Rollback to previous version
pm2 stop mbti-backend
cd /var/www/mbti-backend
git checkout previous-stable-tag
npm install
npm run build
pm2 restart mbti-backend

# Restore database from backup
gunzip < backup_latest.sql.gz | psql -U mbti_user mbti_prod

# Clear all caches
redis-cli FLUSHALL
```

## Support and Maintenance

### Regular Maintenance Tasks

- **Daily**: Monitor application logs and error rates
- **Weekly**: Review database performance and run VACUUM ANALYZE
- **Monthly**: Review and rotate logs, update dependencies
- **Quarterly**: Review security patches and upgrade plans

### Backup Strategy

```bash
# Daily automated backup (add to crontab)
0 2 * * * pg_dump -U mbti_user mbti_prod | gzip > /var/backups/mbti/db_$(date +\%Y\%m\%d).sql.gz

# Keep last 30 days of backups
0 3 * * * find /var/backups/mbti -name "db_*.sql.gz" -mtime +30 -delete
```

### Update and Upgrade

```bash
# Update dependencies
npm update
npm audit fix

# Rebuild and restart
npm run build
pm2 restart mbti-backend

# Database schema migrations
# (implement migration scripts for schema changes)
```

For more detailed information or assistance, refer to the main README.md or open an issue on GitHub.
