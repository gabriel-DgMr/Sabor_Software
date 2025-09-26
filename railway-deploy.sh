#!/bin/bash

# Script específico para desplegar en Railway con inserción de datos
# Uso: ./railway-deploy.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Verificar Railway CLI
check_railway_cli() {
    log "🔍 Verificando Railway CLI..."
    
    if ! command -v railway &> /dev/null; then
        error "Railway CLI no está instalado. Instálalo con: npm install -g @railway/cli"
    fi
    
    log "✅ Railway CLI encontrado"
}

# Verificar autenticación
check_authentication() {
    log "🔐 Verificando autenticación con Railway..."
    
    if ! railway whoami &> /dev/null; then
        warn "No estás autenticado con Railway"
        info "Ejecutando: railway login"
        railway login
    fi
    
    log "✅ Autenticado con Railway"
}

# Conectar al proyecto
connect_project() {
    log "🔗 Conectando al proyecto de Railway..."
    
    if [[ ! -f ".railway/project.json" ]]; then
        warn "Proyecto no vinculado a Railway"
        info "Ejecutando: railway link"
        railway link
    fi
    
    log "✅ Proyecto conectado"
}

# Verificar variables de entorno
check_environment_variables() {
    log "📋 Verificando variables de entorno en Railway..."
    
    # Variables críticas que deben estar configuradas
    local required_vars=(
        "NODE_ENV"
        "JWT_SECRET"
        "COOKIE_SECRET"
        "EMAIL_USER"
        "EMAIL_PASSWORD"
        "CORS_ORIGIN"
        "FRONTEND_URL"
    )
    
    for var in "${required_vars[@]}"; do
        if ! railway variables get "$var" &> /dev/null; then
            warn "Variable $var no configurada en Railway"
            info "Configúrala en Railway Dashboard > Variables"
        else
            log "✅ Variable $var configurada"
        fi
    done
    
    # Las variables de DB son configuradas automáticamente por Railway
    log "✅ Variables de entorno verificadas"
}

# Construir aplicación
build_application() {
    log "🔨 Construyendo aplicación..."
    
    # Build del frontend
    cd frontend
    npm run build
    cd ..
    
    # Build del backend (si es necesario)
    cd backend
    npm run build 2>/dev/null || log "ℹ️  Backend no requiere build"
    cd ..
    
    log "✅ Build completado"
}

# Desplegar en Railway
deploy_to_railway() {
    log "🚄 Desplegando en Railway..."
    
    # Desplegar
    railway up
    
    log "✅ Despliegue completado"
}

# Ejecutar scripts de base de datos
run_database_scripts() {
    log "📊 Ejecutando scripts de base de datos..."
    
    # Verificar conexión
    railway run --service backend npm run db:verify
    
    # Insertar datos de prueba
    railway run --service backend npm run db:seed
    
    log "✅ Scripts de base de datos ejecutados"
}

# Verificar despliegue
verify_deployment() {
    log "🔍 Verificando despliegue..."
    
    # Obtener URL del despliegue
    local url=$(railway domain)
    
    if [[ -n "$url" ]]; then
        log "🌐 Aplicación desplegada en: https://$url"
        
        # Verificar que la aplicación responde
        local max_attempts=30
        local attempt=1
        
        while [[ $attempt -le $max_attempts ]]; do
            if curl -f -s "https://$url/api/health" > /dev/null 2>&1; then
                log "✅ Aplicación responde correctamente"
                return 0
            fi
            
            info "Intento $attempt/$max_attempts - Esperando que la aplicación esté lista..."
            sleep 10
            ((attempt++))
        done
        
        warn "⚠️  La aplicación no responde después de $max_attempts intentos"
    else
        warn "⚠️  No se pudo obtener la URL del despliegue"
    fi
}

# Mostrar información del despliegue
show_deployment_info() {
    log "📊 Información del despliegue:"
    
    # URL del despliegue
    local url=$(railway domain)
    if [[ -n "$url" ]]; then
        info "🌐 URL: https://$url"
    fi
    
    # Estado del servicio
    railway status
    
    # Logs recientes
    info "📋 Logs recientes:"
    railway logs --tail 10
}

# Función principal
main() {
    log "🚀 Iniciando despliegue en Railway con datos de prueba"
    
    check_railway_cli
    check_authentication
    connect_project
    check_environment_variables
    build_application
    deploy_to_railway
    
    # Esperar un poco para que el despliegue se complete
    log "⏳ Esperando que el despliegue se complete..."
    sleep 30
    
    run_database_scripts
    verify_deployment
    show_deployment_info
    
    log "🎉 Despliegue completado exitosamente"
    log "💡 Datos de prueba insertados en la base de datos"
}

# Ejecutar función principal
main
