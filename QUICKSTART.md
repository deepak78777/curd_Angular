# 🚀 Quick Start Guide - Local Development

## Get Started in 5 Minutes

### 1. Prerequisites
```bash
# Ensure Docker is running
docker --version
docker-compose --version
```

### 2. Clone & Setup
```bash
git clone https://github.com/yourusername/curd_Angular.git
cd curd_Angular
cp .env.example .env
```

### 3. Start Application
```bash
# Make deploy script executable
chmod +x scripts/deploy.sh

# Start all containers
./scripts/deploy.sh start

# Wait for ~30 seconds for containers to be ready
sleep 30

# Verify everything is running
./scripts/deploy.sh health
```

### 4. Access Application
Open your browser and visit:
- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **Django Admin**: http://localhost/admin (username: admin, password: admin)

### 5. Create Test User
```bash
# Option 1: Create superuser
./scripts/deploy.sh superuser

# Option 2: Register via frontend
# Go to http://localhost → Register → Fill in credentials
```

### 6. Test CRUD Operations
- Login to the application
- Navigate to "Home" or "Employee" sections
- Create, Read, Update, Delete records

---

## Useful Commands During Development

```bash
# View logs in real-time
./scripts/deploy.sh logs

# Restart specific service
./scripts/deploy.sh restart-service backend

# Access database shell
docker-compose exec db psql -U cruduser -d cruddb

# Check service health
./scripts/deploy.sh health

# Shell access to containers
./scripts/deploy.sh shell-backend
./scripts/deploy.sh shell-frontend

# Stop all services
./scripts/deploy.sh stop

# Restart everything
./scripts/deploy.sh restart
```

---

## Troubleshooting

**Containers won't start:**
```bash
./scripts/deploy.sh rebuild
```

**Port already in use:**
```bash
# Change ports in docker-compose.yml or:
lsof -i :80 && lsof -i :8000 && lsof -i :4200
```

**Database migration errors:**
```bash
docker-compose exec backend python manage.py migrate --noinput
```

---

## Next Steps

1. **Read DEPLOYMENT.md** for production setup
2. **Configure GitHub Secrets** for CI/CD pipeline
3. **Update .env** with your API keys and settings
4. **Test locally** before pushing to production

---

For detailed information, see [DEPLOYMENT.md](DEPLOYMENT.md)
