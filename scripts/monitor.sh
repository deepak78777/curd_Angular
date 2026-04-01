#!/bin/bash

# Monitor script to check application health and restart if needed

PROJECT_NAME="crud-angular"
DOCKER_COMPOSE="docker-compose"
ALERT_EMAIL="your-email@example.com"
LOG_FILE="/var/log/crud-angular-monitor.log"

log_event() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

check_service() {
    local service=$1
    if ! docker inspect ${PROJECT_NAME}_${service}_1 &> /dev/null; then
        log_event "ERROR: $service container is not running"
        cd /app/crud-angular
        $DOCKER_COMPOSE -p $PROJECT_NAME restart $service
        log_event "WARN: Restarted $service"
        return 1
    fi
    return 0
}

check_disk_space() {
    local usage=$(df /app | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $usage -gt 90 ]; then
        log_event "ERROR: Disk usage is $usage%"
        # Optional: send alert
        # echo "Disk usage alert: $usage%" | mail -s "Disk Space Alert" $ALERT_EMAIL
        return 1
    fi
    return 0
}

check_memory() {
    local usage=$(free | awk 'NR==2 {printf("%.0f\n", $3/$2 * 100)}')
    if [ $usage -gt 85 ]; then
        log_event "WARN: Memory usage is $usage%"
    fi
}

check_api_health() {
    if ! curl -f http://localhost/api/ &> /dev/null; then
        log_event "ERROR: Backend API is not responding"
        cd /app/crud-angular
        $DOCKER_COMPOSE -p $PROJECT_NAME restart backend
        log_event "WARN: Restarted backend"
        return 1
    fi
    return 0
}

# Main monitoring loop
log_event "Monitor started"

while true; do
    check_service "backend"
    check_service "frontend"
    check_service "db"
    check_service "nginx"
    check_disk_space
    check_memory
    check_api_health
    
    # Run every 5 minutes
    sleep 300
done
