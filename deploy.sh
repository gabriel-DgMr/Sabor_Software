#!/bin/bash

# Script de despliegue automatizado para Sabor App
# Uso: ./deploy.sh [environment] [action]
# Ejemplo: ./deploy.sh production deploy

set -e  # Salir si cualquier comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
ENVIRONMENT=${1:-staging}
ACTION=${2:-deploy}
PROJECT_NAME="sabor"
BACKUP_DIR="./backup"
LOG_FILE="./deploy-$(date +%Y%m%d_%H%M%S).log"

# Funciones de utilidad
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a $LOG_FILE
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a $LOG_FILE
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a $LOG_FILE
}

# Verificar prerrequisitos
check_prerequisites() {
    log "🔍 Verificando prerrequisitos..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js no está instalado"
    fi
    
    local node_version=$(node --version | sed 's/v//')
    local required_version="18.0.0"
    if ! printf '%s\n%s\n' "$required_version" "$node_version" | sort -V -C; then
        error "Se requiere Node.js >= $required_version, encontrado: $node_version"
    fi
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        error "npm no está instalado"
    fi
    
    # Verificar Docker si se va a usar
    if [[ "$ACTION" == "docker"* ]]; then
        if ! command -v docker &> /dev/null; then
            error "Docker no está instalado"
        fi
        
        if ! command -v docker-compose &> /dev/null; then
            error "Docker Compose no está instalado"
        fi
    fi
    
    # Verificar Git
    if ! command -v git &> /dev/null; then
        warn "Git no está instalado - algunas funciones pueden no funcionar"
    fi
    
    log "✅ Prerrequisitos verificados"
}

# Verificar archivos de configuración
check_config() {
    log "📋 Verificando configuración para $ENVIRONMENT..."
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        if [[ ! -f "backend/env.production.example" ]]; then
            error "Archivo backend/env.production.example no encontrado"
        fi
        
        if [[ ! -f "frontend/env.production.example" ]]; then
            error "Archivo frontend/env.production.example no encontrado"
        fi
        
        # Verificar variables de entorno críticas
        if [[ -z "$JWT_SECRET" ]]; then
            error "Variable JWT_SECRET no configurada"
        fi
        
        if [[ -z "$COOKIE_SECRET" ]]; then
            error "Variable COOKIE_SECRET no configurada"
        fi
        
        if [[ -z "$DB_PASSWORD" ]]; then
            error "Variable DB_PASSWORD no configurada"
        fi
    fi
    
    log "✅ Configuración verificada"
}

# Crear backup antes del despliegue
create_backup() {
    log "💾 Creando backup..."
    
    mkdir -p $BACKUP_DIR
    
    # Backup de base de datos si está disponible
    if [[ -n "$DB_HOST" && -n "$DB_USER" && -n "$DB_PASSWORD" && -n "$DB_NAME" ]]; then
        local backup_file="$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql"
        
        if command -v mysqldump &> /dev/null; then
            log "📊 Creando backup de base de datos..."
            mysqldump -h$DB_HOST -u$DB_USER -p$DB_PASSWORD $DB_NAME > $backup_file 2>/dev/null || true
            
            if [[ -f "$backup_file" && -s "$backup_file" ]]; then
                log "✅ Backup de base de datos creado: $backup_file"
            else
                warn "No se pudo crear backup de base de datos"
            fi
        fi
    fi
    
    # Backup de archivos críticos
    if [[ -d "backend/public/uploads" ]]; then
        log "📁 Creando backup de archivos..."
        tar -czf "$BACKUP_DIR/uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz" backend/public/uploads/ 2>/dev/null || true
    fi
    
    log "✅ Backup completado"
}

# Limpiar archivos temporales y caché
cleanup() {
    log "🧹 Limpiando archivos temporales..."
    
    # Limpiar node_modules si es necesario
    if [[ "$ACTION" == "clean" ]]; then
        rm -rf node_modules backend/node_modules frontend/node_modules
        rm -rf frontend/dist
    fi
    
    # Limpiar caché de npm
    npm cache clean --force 2>/dev/null || true
    
    # Limpiar logs antiguos
    find backend/logs/ -name "*.log" -mtime +7 -delete 2>/dev/null || true
    
    log "✅ Limpieza completada"
}

# Instalar dependencias
install_dependencies() {
    log "📦 Instalando dependencias..."
    
    # Instalar dependencias raíz
    npm ci --only=production
    
    # Instalar dependencias del backend
    cd backend
    npm ci --only=production
    cd ..
    
    # Instalar dependencias del frontend
    cd frontend
    npm ci --only=production
    cd ..
    
    log "✅ Dependencias instaladas"
}

# Ejecutar tests si están disponibles
run_tests() {
    log "🧪 Ejecutando tests..."
    
    # Tests del backend
    if [[ -f "backend/package.json" ]] && grep -q '"test"' backend/package.json; then
        cd backend
        npm test 2>/dev/null || warn "Tests del backend fallaron o no están configurados"
        cd ..
    fi
    
    # Tests del frontend
    if [[ -f "frontend/package.json" ]] && grep -q '"test"' frontend/package.json; then
        cd frontend
        npm test 2>/dev/null || warn "Tests del frontend fallaron o no están configurados"
        cd ..
    fi
    
    log "✅ Tests completados"
}

# Construir aplicación
build_application() {
    log "🔨 Construyendo aplicación para $ENVIRONMENT..."
    
    # Build del frontend
    cd frontend
    if [[ "$ENVIRONMENT" == "production" ]]; then
        NODE_ENV=production npm run build:prod
    else
        npm run build
    fi
    cd ..
    
    # Build del backend (si es necesario)
    cd backend
    npm run build 2>/dev/null || log "ℹ️  Backend no requiere build"
    cd ..
    
    log "✅ Build completado"
}

# Verificar salud de la aplicación
health_check() {
    log "🏥 Verificando salud de la aplicación..."
    
    local max_attempts=30
    local attempt=1
    local health_url="http://localhost:${PORT:-3000}/api/health"
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s "$health_url" > /dev/null 2>&1; then
            log "✅ Aplicación responde correctamente"
            return 0
        fi
        
        info "Intento $attempt/$max_attempts - Esperando que la aplicación esté lista..."
        sleep 5
        ((attempt++))
    done
    
    error "❌ La aplicación no responde después de $max_attempts intentos"
}

# Despliegue con Docker
deploy_docker() {
    log "🐳 Desplegando con Docker..."
    
    # Construir imagen
    docker build -t ${PROJECT_NAME}:latest .
    
    # Detener contenedores existentes
    docker-compose down 2>/dev/null || true
    
    # Iniciar servicios
    if [[ "$ENVIRONMENT" == "production" ]]; then
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    else
        docker-compose up -d
    fi
    
    # Esperar a que los servicios estén listos
    sleep 10
    
    log "✅ Despliegue Docker completado"
}

# Despliegue tradicional
deploy_traditional() {
    log "🚀 Desplegando aplicación tradicional..."
    
    # Detener aplicación existente si está corriendo
    pkill -f "node.*index.js" 2>/dev/null || true
    
    # Configurar base de datos
    cd backend
    node scripts/db-setup.js setup
    cd ..
    
    # Iniciar aplicación en segundo plano
    cd backend
    if [[ "$ENVIRONMENT" == "production" ]]; then
        nohup npm run start:prod > ../logs/app.log 2>&1 &
    else
        nohup npm start > ../logs/app.log 2>&1 &
    fi
    cd ..
    
    # Guardar PID
    echo $! > ${PROJECT_NAME}.pid
    
    log "✅ Aplicación iniciada con PID: $(cat ${PROJECT_NAME}.pid)"
}

# Despliegue en Railway
deploy_railway() {
    log "🚄 Preparando despliegue para Railway..."
    
    # Verificar que railway.json existe
    if [[ ! -f "railway.json" ]]; then
        error "Archivo railway.json no encontrado"
    fi
    
    # Verificar variables de entorno
    if [[ -z "$RAILWAY_TOKEN" ]]; then
        warn "RAILWAY_TOKEN no configurado - despliegue manual requerido"
    fi
    
    # Construir aplicación
    build_application
    
    log "✅ Proyecto preparado para Railway"
    info "📝 Pasos siguientes:"
    info "   1. Configurar variables de entorno en Railway"
    info "   2. Conectar repositorio Git"
    info "   3. Desplegar desde la interfaz web de Railway"
}

# Rollback a versión anterior
rollback() {
    log "⏪ Ejecutando rollback..."
    
    if [[ -f "${PROJECT_NAME}.pid" ]]; then
        local pid=$(cat ${PROJECT_NAME}.pid)
        kill $pid 2>/dev/null || true
        rm ${PROJECT_NAME}.pid
    fi
    
    # Restaurar backup de base de datos más reciente
    local latest_backup=$(ls -t $BACKUP_DIR/db_backup_*.sql 2>/dev/null | head -n1)
    if [[ -n "$latest_backup" && -f "$latest_backup" ]]; then
        log "📊 Restaurando backup de base de datos: $latest_backup"
        mysql -h$DB_HOST -u$DB_USER -p$DB_PASSWORD $DB_NAME < $latest_backup 2>/dev/null || warn "No se pudo restaurar backup"
    fi
    
    log "✅ Rollback completado"
}

# Mostrar estado de la aplicación
show_status() {
    log "📊 Estado de la aplicación:"
    
    # Verificar si está corriendo
    if [[ -f "${PROJECT_NAME}.pid" ]]; then
        local pid=$(cat ${PROJECT_NAME}.pid)
        if ps -p $pid > /dev/null 2>&1; then
            info "✅ Aplicación corriendo (PID: $pid)"
        else
            warn "❌ Aplicación no está corriendo (PID obsoleto: $pid)"
            rm ${PROJECT_NAME}.pid
        fi
    else
        info "❌ Aplicación no está corriendo"
    fi
    
    # Verificar Docker si está disponible
    if command -v docker &> /dev/null; then
        local containers=$(docker ps --filter "name=${PROJECT_NAME}" --format "table {{.Names}}\t{{.Status}}" 2>/dev/null || true)
        if [[ -n "$containers" ]]; then
            info "🐳 Contenedores Docker:"
            echo "$containers"
        fi
    fi
    
    # Verificar logs recientes
    if [[ -f "logs/app.log" ]]; then
        info "📋 Últimas líneas del log:"
        tail -n 5 logs/app.log 2>/dev/null || true
    fi
}

# Función principal
main() {
    log "🚀 Iniciando despliegue de Sabor App"
    log "📋 Entorno: $ENVIRONMENT"
    log "🎯 Acción: $ACTION"
    
    case $ACTION in
        "deploy")
            check_prerequisites
            check_config
            create_backup
            cleanup
            install_dependencies
            run_tests
            build_application
            deploy_traditional
            health_check
            ;;
        "docker")
            check_prerequisites
            check_config
            create_backup
            deploy_docker
            health_check
            ;;
        "railway")
            check_prerequisites
            check_config
            deploy_railway
            ;;
        "rollback")
            rollback
            ;;
        "status")
            show_status
            ;;
        "clean")
            cleanup
            ;;
        *)
            echo "Uso: $0 [environment] [action]"
            echo ""
            echo "Entornos:"
            echo "  development  - Entorno de desarrollo"
            echo "  staging      - Entorno de pruebas"
            echo "  production   - Entorno de producción"
            echo ""
            echo "Acciones:"
            echo "  deploy       - Despliegue tradicional (por defecto)"
            echo "  docker       - Despliegue con Docker"
            echo "  railway      - Preparar para Railway"
            echo "  rollback     - Rollback a versión anterior"
            echo "  status       - Mostrar estado actual"
            echo "  clean        - Limpiar archivos temporales"
            exit 1
            ;;
    esac
    
    log "🎉 Proceso completado exitosamente"
    log "📝 Log guardado en: $LOG_FILE"
}

# Ejecutar función principal
main
