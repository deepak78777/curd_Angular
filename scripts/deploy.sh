#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_PATH="/app/crud-angular"
DOCKER_COMPOSE="docker-compose"
PROJECT_NAME="crud-angular"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking requirements..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "docker-compose is not installed"
        exit 1
    fi
    
    log_info "All requirements are met"
}

setup_env() {
    log_info "Setting up environment..."
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            log_warn ".env file created from .env.example - Please update it with your values"
        else
            log_error ".env.example not found"
            exit 1
        fi
    fi
}

build_images() {
    log_info "Building Docker images..."
    $DOCKER_COMPOSE -p $PROJECT_NAME build --no-cache
    
    if [ $? -eq 0 ]; then
        log_info "Docker images built successfully"
    else
        log_error "Failed to build Docker images"
        exit 1
    fi
}

up_containers() {
    log_info "Starting containers..."
    $DOCKER_COMPOSE -p $PROJECT_NAME up -d
    
    if [ $? -eq 0 ]; then
        log_info "Containers started successfully"
    else
        log_error "Failed to start containers"
        exit 1
    fi
}

down_containers() {
    log_info "Stopping containers..."
    $DOCKER_COMPOSE -p $PROJECT_NAME down
    
    if [ $? -eq 0 ]; then
        log_info "Containers stopped successfully"
    else
        log_error "Failed to stop containers"
        exit 1
    fi
}

run_migrations() {
    log_info "Running Django migrations..."
    $DOCKER_COMPOSE -p $PROJECT_NAME exec -T backend python manage.py migrate
    
    if [ $? -eq 0 ]; then
        log_info "Migrations completed successfully"
    else
        log_error "Failed to run migrations"
        exit 1
    fi
}

collect_static() {
    log_info "Collecting static files..."
    $DOCKER_COMPOSE -p $PROJECT_NAME exec -T backend python manage.py collectstatic --noinput
    
    if [ $? -eq 0 ]; then
        log_info "Static files collected successfully"
    else
        log_error "Failed to collect static files"
        exit 1
    fi
}

create_superuser() {
    log_info "Creating Django superuser..."
    $DOCKER_COMPOSE -p $PROJECT_NAME exec -T backend python manage.py createsuperuser
}

view_logs() {
    log_info "Displaying logs..."
    $DOCKER_COMPOSE -p $PROJECT_NAME logs -f
}

health_check() {
    log_info "Performing health check..."
    
    echo "Checking services:"
    $DOCKER_COMPOSE -p $PROJECT_NAME ps
    
    echo ""
    echo "Testing endpoints:"
    
    if curl -f http://localhost/health &> /dev/null; then
        log_info "Nginx is healthy"
    else
        log_warn "Nginx is not responding"
    fi
    
    if curl -f http://localhost/api/ &> /dev/null; then
        log_info "Backend API is responding"
    else
        log_warn "Backend API is not responding"
    fi
    
    if curl -f http://localhost/ &> /dev/null; then
        log_info "Frontend is responding"
    else
        log_warn "Frontend is not responding"
    fi
}

restart_service() {
    local service=$1
    log_info "Restarting service: $service..."
    $DOCKER_COMPOSE -p $PROJECT_NAME restart $service
    
    if [ $? -eq 0 ]; then
        log_info "Service restarted successfully"
    else
        log_error "Failed to restart service"
        exit 1
    fi
}

# Main script logic
case "${1:-help}" in
    start)
        check_requirements
        setup_env
        build_images
        up_containers
        run_migrations
        collect_static
        health_check
        ;;
    stop)
        down_containers
        ;;
    restart)
        down_containers
        sleep 2
        up_containers
        ;;
    rebuild)
        down_containers
        build_images
        up_containers
        run_migrations
        collect_static
        ;;
    logs)
        view_logs
        ;;
    health)
        health_check
        ;;
    migrate)
        run_migrations
        ;;
    static)
        collect_static
        ;;
    superuser)
        create_superuser
        ;;
    restart-service)
        if [ -z "$2" ]; then
            log_error "Please specify a service name (backend, frontend, db, nginx)"
            exit 1
        fi
        restart_service $2
        ;;
    shell-backend)
        $DOCKER_COMPOSE -p $PROJECT_NAME exec backend sh
        ;;
    shell-frontend)
        $DOCKER_COMPOSE -p $PROJECT_NAME exec frontend sh
        ;;
    *)
        echo "CRUD Angular Deployment Script"
        echo ""
        echo "Usage: ./deploy.sh [command]"
        echo ""
        echo "Commands:"
        echo "  start              - Build and start all containers"
        echo "  stop               - Stop all containers"
        echo "  restart            - Restart all containers"
        echo "  rebuild            - Rebuild images and restart (USE WITH CAUTION)"
        echo "  logs               - View container logs (follow mode)"
        echo "  health             - Check health of all services"
        echo "  migrate            - Run Django migrations"
        echo "  static             - Collect static files"
        echo "  superuser          - Create Django superuser"
        echo "  restart-service    - Restart specific service (backend, frontend, db, nginx)"
        echo "  shell-backend      - Open shell in backend container"
        echo "  shell-frontend     - Open shell in frontend container"
        echo "  help               - Show this help message"
        echo ""
        exit 0
        ;;
esac

log_info "Operation completed successfully"
