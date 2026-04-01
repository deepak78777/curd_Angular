# 🚀 CRUD Angular - Complete Docker & CI/CD Deployment Guide

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Production Server Setup](#production-server-setup)
3. [GitHub Actions Configuration](#github-actions-configuration)
4. [Nginx & SSL Setup](#nginx--ssl-setup)
5. [Monitoring & Maintenance](#monitoring--maintenance)
6. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites
- Docker Desktop (Mac/Windows) or Docker Engine + Docker Compose (Linux)
- Git
- Node.js 20+ (optional, for local Angular development)
- Python 3.11+ (optional, for local Django development)

### Step 1: Clone & Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/curd_Angular.git
cd curd_Angular

# Create environment file
cp .env.example .env

# Edit .env with your local settings
nano .env
```

### Step 2: Update Settings.py

First, update Django settings to support PostgreSQL:

```bash
# server/myproject/myproject/settings.py
```

Replace the database configuration with:

```python
import os
import dj_database_url

if os.getenv('DB_ENGINE') == 'django.db.backends.postgresql':
    DATABASES = {
        'default': dj_database_url.config(
            default=f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Update CORS and ALLOWED_HOSTS from environment
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:4200').split(',')
DEBUG = os.getenv('DEBUG', 'False') == 'True'
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-change-this-in-production')
```

### Step 3: Build and Start Containers

```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Build and start all containers
./scripts/deploy.sh start

# Or use docker-compose directly
docker-compose up -d

# Check status
./scripts/deploy.sh health
```

### Step 4: Access Applications

- **Frontend**: http://localhost (or http://localhost:4200 direct)
- **Backend API**: http://localhost/api
- **Django Admin**: http://localhost/admin
- **API Documentation**: http://localhost/api/docs (if available)

### Step 5: Create Superuser

```bash
./scripts/deploy.sh superuser
# Or directly
docker-compose exec backend python manage.py createsuperuser
```

---

## Production Server Setup

### Prerequisites on Linux Server
- Ubuntu 20.04 LTS or later
- SSH access with root permissions
- Minimum 2GB RAM, 20GB disk space
- Domain name (for SSL)

### Step 1: Initial Server Setup

```bash
# On your local machine, copy setup script to server
scp scripts/setup-server.sh root@your-server-ip:/root/

# SSH into server
ssh root@your-server-ip

# Run setup script
chmod +x /root/setup-server.sh
/root/setup-server.sh
```

This script will:
- Install Docker and Docker Compose
- Configure firewall
- Create deploy user
- Setup backup scripts
- Install monitoring tools

### Step 2: Clone Repository on Server

```bash
# SSH into server as deploy user
ssh deploy@your-server-ip

# Create app directory
sudo mkdir -p /app/crud-angular
sudo chown deploy:deploy /app/crud-angular

# Clone repository
cd /app
git clone https://github.com/yourusername/curd_Angular.git crud-angular
cd crud-angular

# Create production environment file
cp .env.example .env
nano .env
```

### Step 3: Update .env for Production

```env
DEBUG=False
SECRET_KEY=generate-a-strong-secret-key-here
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Database
DB_NAME=cruddb_prod
DB_USER=cruduser_prod
DB_PASSWORD=generate-strong-password-here
DB_HOST=db
DB_PORT=5432

# Django
ENVIRONMENT=production
NODE_ENV=production
```

### Step 4: Setup SSL Certificate

```bash
# Generate SSL certificate with Certbot
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Certificate will be at:
# /etc/letsencrypt/live/your-domain.com/fullchain.pem
# /etc/letsencrypt/live/your-domain.com/privkey.pem
```

### Step 5: Update Nginx Config for SSL

```bash
# Copy certificates
sudo mkdir -p /app/crud-angular/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /app/crud-angular/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /app/crud-angular/ssl/
sudo chown -R deploy:deploy /app/crud-angular/ssl
```

### Step 6: Start Production Deployment

```bash
cd /app/crud-angular

# Make scripts executable
chmod +x scripts/*.sh

# Start containers
./scripts/deploy.sh start

# Verify deployment
./scripts/deploy.sh health

# View logs
./scripts/deploy.sh logs
```

### Step 7: Setup Auto-Renewal of SSL Certificate

```bash
# Create renewal script
cat > /usr/local/bin/renew-ssl.sh << 'EOF'
#!/bin/bash
certbot renew --quiet
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /app/crud-angular/ssl/
cp /etc/letsencrypt/live/your-domain.com/privkey.pem /app/crud-angular/ssl/
cd /app/crud-angular
docker-compose restart nginx
EOF

chmod +x /usr/local/bin/renew-ssl.sh

# Add to crontab (runs daily at 1 AM)
(crontab -l 2>/dev/null; echo "0 1 * * * /usr/local/bin/renew-ssl.sh") | sudo crontab -
```

---

## GitHub Actions Configuration

### Step 1: Add Repository Secrets

In GitHub, go to **Settings > Secrets and Variables > Actions** and add:

1. **DEPLOY_HOST**: Your server IP or domain
2. **DEPLOY_USER**: `deploy` (or your SSH user)
3. **DEPLOY_SSH_KEY**: Your SSH private key (without passphrase)

To generate SSH key:
```bash
ssh-keygen -t ed25519 -f deploy_key -N ""
cat deploy_key           # Add this as DEPLOY_SSH_KEY
cat deploy_key.pub       # Add to /home/deploy/.ssh/authorized_keys on server
```

### Step 2: Verify Workflow File

The workflow is at `.github/workflows/deploy.yml` and includes:
- ✅ Backend tests (Django with PostgreSQL)
- ✅ Frontend tests (Angular/TypeScript)
- ✅ Docker image building and pushing to GitHub Container Registry
- ✅ Automatic deployment to your server

### Step 3: Trigger Deployment

The pipeline automatically runs on:
- **Push to `main` branch**: Full CI/CD pipeline with deployment
- **Push to `develop` branch**: Tests only (no deployment)
- **Pull Requests**: Tests only

To manually trigger or deploy specific branch:
```bash
git push origin main
```

### Step 4: Monitor Pipeline

- Go to **Actions** tab in GitHub
- Click on the workflow run
- View logs for each job

---

## Nginx & SSL Setup

### Nginx Configuration Features

✅ **Reverse Proxy**: Routes traffic to backend, frontend, and static files  
✅ **Load Balancing**: Can add multiple backend servers  
✅ **Rate Limiting**: Protects against brute force attacks  
✅ **GZIP Compression**: Reduces bandwidth usage  
✅ **SSL/TLS**: HTTPS support with auto-renewal  
✅ **Security Headers**: CORS, XSS protection  
✅ **Static File Caching**: 30-day cache for assets  

### Traffic Flow

```
Internet (80/443)
    ↓
Nginx (Reverse Proxy)
    ├→ /api/* → Backend (Django)
    ├→ /auth/* → Backend (Django)
    ├→ /admin/* → Backend (Django)
    ├→ /static/* → Static Files
    └→ /* → Frontend (Angular)
```

### Update Nginx Config for Your Domain

Edit `nginx.conf`:

```nginx
# Around line 100, uncomment and update:
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$host$request_uri;  # Redirect HTTP to HTTPS
}

# Around line 135, uncomment and update:
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ...rest of config...
}
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Check all services
./scripts/deploy.sh health

# Check specific service
docker-compose ps backend
docker-compose logs backend -f
```

### View Logs

```bash
# All services
./scripts/deploy.sh logs

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# Follow specific number of lines
docker-compose logs --tail=100 backend
```

### Database Backup

```bash
# Manual backup
docker-compose exec -T db pg_dump -U cruduser cruddb > backup.sql

# Restore backup
docker-compose exec -T db psql -U cruduser cruddb < backup.sql

# Automated backups run daily at 2 AM (configured in setup-server.sh)
ls -la /backups/database/
```

### Monitor Service Health

```bash
# Start monitoring daemon (runs health checks every 5 minutes)
chmod +x scripts/monitor.sh
./scripts/monitor.sh &

# Or create systemd service for automatic startup
sudo systemctl enable crud-monitor
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
./scripts/deploy.sh rebuild

# Or step by step
./scripts/deploy.sh stop
docker-compose build
./scripts/deploy.sh start
```

---

## Troubleshooting

### 1. Containers Not Starting

```bash
# Check error logs
docker-compose logs backend
docker-compose logs frontend

# Verify environment variables
cat .env

# Rebuild from scratch
./scripts/deploy.sh rebuild

# Check disk space
df -h
```

### 2. Database Connection Error

```bash
# Verify database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Verify credentials in .env
grep DB_ .env

# Restart database
./scripts/deploy.sh restart-service db
```

### 3. Frontend Not Loading

```bash
# Check frontend container
docker-compose logs -f frontend

# Verify Nginx is routing correctly
curl http://localhost/

# Check Nginx configuration
docker-compose exec nginx nginx -t

# Restart Nginx
./scripts/deploy.sh restart-service nginx
```

### 4. SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Manual renewal
sudo certbot renew --force-renewal

# Copy to container
sudo cp /etc/letsencrypt/live/your-domain.com/* /app/crud-angular/ssl/

# Restart Nginx
./scripts/deploy.sh restart-service nginx
```

### 5. High Memory Usage

```bash
# Check which container uses most memory
docker stats

# Restart containers to clear cache
./scripts/deploy.sh restart

# Increase Docker memory limit
# Edit docker-compose.yml and add:
# deploy:
#   resources:
#     limits:
#       memory: 2G
```

### 6. Slow API Response

```bash
# Check backend logs
docker-compose logs backend | tail -100

# Check database performance
docker-compose exec -T db psql -U cruduser -d cruddb -c "SELECT COUNT(*) FROM Auth_folder_customuser;"

# Check server CPU/memory
top
free -h
```

### 7. SSH Deployment Issues

```bash
# Test SSH connection
ssh -i deploy_key deploy@your-server-ip "docker-compose ps"

# Check GitHub Actions logs for deployment job

# Manually verify SSH key
cat ~/.ssh/authorized_keys | grep "$(cat deploy_key.pub)"
```

---

## Useful Commands

### Deployment
```bash
./scripts/deploy.sh start              # Start all services
./scripts/deploy.sh stop               # Stop all services
./scripts/deploy.sh restart            # Restart all services
./scripts/deploy.sh rebuild            # Rebuild Docker images
./scripts/deploy.sh logs               # View logs
./scripts/deploy.sh health             # Health check
```

### Database Management
```bash
./scripts/deploy.sh migrate            # Run migrations
./scripts/deploy.sh superuser          # Create Django superuser
./scripts/deploy.sh static             # Collect static files
```

### Container Access
```bash
./scripts/deploy.sh shell-backend      # Access backend shell
./scripts/deploy.sh shell-frontend     # Access frontend shell
docker-compose exec backend bash
docker-compose exec frontend sh
```

### Docker Compose
```bash
docker-compose build                   # Build images
docker-compose up -d                   # Start containers
docker-compose down                    # Stop and remove containers
docker-compose ps                      # List containers
docker-compose restart backend         # Restart specific container
docker-compose logs -f nginx           # Follow logs
```

---

## Performance Optimization

### 1. Enable Caching
- Static assets cached for 30 days in Nginx
- Configure Redis for session caching (optional)

### 2. Database Optimization
```bash
# Run migrations for proper indexing
docker-compose exec backend python manage.py migrate

# Monitor slow queries
docker-compose exec -T db psql -U cruduser -d cruddb -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"
```

### 3. Nginx Tuning
- Gzip compression enabled (reduces bandwidth ~70%)
- Worker connections optimized
- Connection keep-alive enabled

### 4. Frontend Optimization
- Angular build production artifacts
- Lazy loading of routes
- Service worker caching (if PWA enabled)

---

## Security Best Practices

✅ Use strong passwords for database and Django admin  
✅ Rotate SECRET_KEY periodically  
✅ Keep packages updated: `pip install -U -r requirements.txt`  
✅ Use SSH keys instead of passwords for deployment  
✅ Enable firewall rules (setup script does this)  
✅ Use HTTPS/SSL certificates (required for production)  
✅ Keep secrets in `.env`, never commit to Git  
✅ Regularly backup database  
✅ Monitor logs for suspicious activity  
✅ Use strong CSRF tokens in forms  

---

## Support

For issues or questions:
1. Check logs: `./scripts/deploy.sh logs`
2. Review troubleshooting section
3. Check GitHub Issues
4. Contact development team

---

**Last Updated**: March 31, 2026
