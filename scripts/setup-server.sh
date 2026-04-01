#!/bin/bash

# Server Setup Script - Run this once on a fresh Linux server

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    log_error "This script must be run as root"
    exit 1
fi

log_info "Starting server setup..."

# Update system packages
log_info "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install Docker
log_info "Installing Docker..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Install Docker Compose V2
log_info "Installing Docker Compose..."
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose

# Start Docker service
log_info "Starting Docker service..."
systemctl enable docker
systemctl start docker

# Install additional utilities
log_info "Installing utilities..."
apt-get install -y \
    git \
    vim \
    curl \
    wget \
    htop \
    net-tools \
    certbot \
    python3-certbot-nginx

# Create deployment directory
log_info "Creating deployment directory..."
mkdir -p /app
cd /app

# Clone repository (you'll need to configure this)
log_info "Cloning repository..."
# git clone https://github.com/yourusername/curd_Angular.git
# OR copy existing repo to /app/crud-angular

# Create deploy user
if ! id -u deploy > /dev/null 2>&1; then
    log_info "Creating deploy user..."
    useradd -m -s /bin/bash deploy
    usermod -aG docker deploy
    
    # Setup SSH key
    mkdir -p /home/deploy/.ssh
    chmod 700 /home/deploy/.ssh
    chown -R deploy:deploy /home/deploy/.ssh
    
    log_warn "Please add your public SSH key to /home/deploy/.ssh/authorized_keys"
fi

# Configure firewall
log_info "Configuring firewall..."
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Create daily backup script
log_info "Creating backup script..."
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/database"
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

docker-compose -f /app/crud-angular/docker-compose.yml exec -T db pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/backup_$BACKUP_DATE.sql

# Keep only last 30 days of backups
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/backup_$BACKUP_DATE.sql"
EOF

chmod +x /usr/local/bin/backup-db.sh

# Create cron job for daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-db.sh") | crontab -

# Create log rotation policy
cat > /etc/logrotate.d/crud-angular << EOF
/app/crud-angular/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 deploy deploy
    sharedscripts
    postrotate
        docker-compose -f /app/crud-angular/docker-compose.yml restart backend frontend nginx > /dev/null
    endscript
}
EOF

# Install monitoring tools
log_info "Installing monitoring tools..."
apt-get install -y prometheus-node-exporter

# Create systemd service for node exporter
systemctl enable prometheus-node-exporter
systemctl start prometheus-node-exporter

# Create swapfile (if system has less than 2GB RAM)
if [ $(free -g | awk '/^Mem:/{print $2}') -lt 2 ]; then
    log_info "Creating swapfile..."
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Summary
log_info "Server setup completed!"
echo ""
echo "==================================="
echo "Next steps:"
echo "==================================="
echo "1. Clone your repository to /app/crud-angular"
echo "2. Copy .env file with your configuration:"
echo "   - Update database credentials"
echo "   - Update SECRET_KEY"
echo "   - Update ALLOWED_HOSTS"
echo "3. Run: cd /app/crud-angular && bash scripts/deploy.sh start"
echo "4. Setup SSL certificate:"
echo "   - certbot certonly --standalone -d your-domain.com"
echo "   - Update nginx.conf with SSL settings"
echo "5. Add GitHub Actions secrets to your repository:"
echo "   - DEPLOY_HOST: your-server-ip"
echo "   - DEPLOY_USER: deploy"
echo "   - DEPLOY_SSH_KEY: your-private-ssh-key"
echo ""
echo "System Information:"
echo "Docker: $(docker --version)"
echo "Docker Compose: $(docker compose version)"
echo "Python: $(python3 --version)"
echo ""
