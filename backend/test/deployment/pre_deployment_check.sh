#!/bin/bash

# 🔍 SCRIPT DE VERIFICACIÓN PRE-DEPLOYMENT
# Descripción: Verifica que el sistema esté listo para deployment
# Autor: Sistema Sabor DevOps Team
# Fecha: 2025-07-12

set -e  # Exit on any error

# Configuración
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/../logs/pre_deployment_check_$(date +"%Y%m%d_%H%M%S").log"
CHECKLIST_FILE="${SCRIPT_DIR}/../logs/deployment_checklist_$(date +"%Y%m%d_%H%M%S").md"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

# Función para logging
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    ((CHECKS_FAILED++))
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
    ((CHECKS_PASSED++))
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
    ((CHECKS_WARNING++))
}

# Verificar variables de entorno
check_environment_variables() {
    log "🔧 Verificando variables de entorno..."
    
    required_vars=("DB_HOST" "DB_PORT" "DB_NAME" "DB_USER" "DB_PASSWORD")
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -eq 0 ]]; then
        success "Variables de entorno requeridas están definidas"
    else
        error "Variables de entorno faltantes: ${missing_vars[*]}"
    fi
}

# Verificar conectividad a la base de datos
check_database_connectivity() {
    log "🗄️ Verificando conectividad a la base de datos..."
    
    if mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" -e "SELECT 1;" > /dev/null 2>&1; then
        success "Conectividad a la base de datos verificada"
        
        # Verificar Event Scheduler
        event_scheduler=$(mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" -e "SHOW VARIABLES LIKE 'event_scheduler';" 2>/dev/null | grep -v Variable | awk '{print $2}')
        
        if [[ "$event_scheduler" == "ON" ]]; then
            success "Event Scheduler está habilitado"
        else
            error "Event Scheduler está deshabilitado. Requerido para particionado automático"
        fi
        
    else
        error "No se pudo conectar a la base de datos"
    fi
}

# Verificar permisos de usuario MySQL
check_mysql_permissions() {
    log "🔐 Verificando permisos de usuario MySQL..."
    
    required_permissions=("CREATE" "ALTER" "DROP" "EVENT" "TRIGGER" "INSERT" "UPDATE" "DELETE" "SELECT")
    
    # Obtener permisos del usuario
    user_grants=$(mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" -e "SHOW GRANTS FOR CURRENT_USER();" 2>/dev/null | grep -v "Grants for")
    
    missing_permissions=()
    for perm in "${required_permissions[@]}"; do
        if ! echo "$user_grants" | grep -qi "$perm"; then
            missing_permissions+=("$perm")
        fi
    done
    
    if [[ ${#missing_permissions[@]} -eq 0 ]]; then
        success "Usuario MySQL tiene todos los permisos requeridos"
    else
        error "Permisos faltantes: ${missing_permissions[*]}"
    fi
}

# Verificar estructura actual de la base de datos
check_database_structure() {
    log "📊 Verificando estructura actual de la base de datos..."
    
    # Verificar tablas principales
    required_tables=("users" "clientes" "empleados")
    missing_tables=()
    
    for table in "${required_tables[@]}"; do
        if ! mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" -e "DESCRIBE ${DB_NAME}.${table};" > /dev/null 2>&1; then
            missing_tables+=("$table")
        fi
    done
    
    if [[ ${#missing_tables[@]} -eq 0 ]]; then
        success "Tablas principales existentes"
    else
        error "Tablas faltantes: ${missing_tables[*]}"
    fi
    
    # Verificar si users_audit ya existe
    if mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" -e "DESCRIBE ${DB_NAME}.users_audit;" > /dev/null 2>&1; then
        warning "Tabla users_audit ya existe. Verificar si migración ya fue ejecutada"
    else
        success "Tabla users_audit no existe. Listo para crear"
    fi
}

# Verificar espacio en disco
check_disk_space() {
    log "💾 Verificando espacio en disco..."
    
    # Verificar espacio en directorio de backups
    backup_dir="${SCRIPT_DIR}/../backups"
    if [[ -d "$backup_dir" ]]; then
        available_space=$(df "$backup_dir" | awk 'NR==2 {print $4}')
        available_gb=$((available_space/1024/1024))
        
        if [[ $available_gb -ge 2 ]]; then
            success "Espacio en disco suficiente: ${available_gb}GB disponibles"
        else
            error "Espacio en disco insuficiente: ${available_gb}GB disponibles (mínimo 2GB)"
        fi
    else
        warning "Directorio de backups no existe. Se creará automáticamente"
    fi
}

# Verificar conectividad a servicios externos
check_external_services() {
    log "🌐 Verificando conectividad a servicios externos..."
    
    # Verificar conexión a internet (opcional)
    if ping -c 1 google.com > /dev/null 2>&1; then
        success "Conectividad a internet verificada"
    else
        warning "Sin conectividad a internet. No crítico para deployment"
    fi
}

# Verificar estado de servicios de la aplicación
check_application_services() {
    log "🔧 Verificando estado de servicios de la aplicación..."
    
    # Verificar si PM2 está instalado
    if command -v pm2 > /dev/null 2>&1; then
        success "PM2 está instalado"
        
        # Verificar servicios en ejecución
        running_services=$(pm2 list 2>/dev/null | grep -c "online" || echo "0")
        if [[ $running_services -gt 0 ]]; then
            success "Servicios de aplicación en ejecución: $running_services"
        else
            warning "No hay servicios PM2 en ejecución"
        fi
    else
        warning "PM2 no está instalado. Verificar gestión de procesos"
    fi
}

# Verificar archivos de migración
check_migration_files() {
    log "📁 Verificando archivos de migración..."
    
    migration_files=(
        "migrations/010_implement_audit_partitioning.sql"
        "scripts/create_events.sql"
        "scripts/manage_audit_partitions.js"
    )
    
    missing_files=()
    for file in "${migration_files[@]}"; do
        if [[ ! -f "${SCRIPT_DIR}/../$file" ]]; then
            missing_files+=("$file")
        fi
    done
    
    if [[ ${#missing_files[@]} -eq 0 ]]; then
        success "Archivos de migración están presentes"
    else
        error "Archivos faltantes: ${missing_files[*]}"
    fi
}

# Verificar configuración de Node.js
check_nodejs_environment() {
    log "🟢 Verificando entorno Node.js..."
    
    # Verificar Node.js
    if command -v node > /dev/null 2>&1; then
        node_version=$(node --version)
        success "Node.js instalado: $node_version"
    else
        error "Node.js no está instalado"
    fi
    
    # Verificar NPM
    if command -v npm > /dev/null 2>&1; then
        npm_version=$(npm --version)
        success "NPM instalado: $npm_version"
    else
        error "NPM no está instalado"
    fi
    
    # Verificar dependencias
    if [[ -f "${SCRIPT_DIR}/../package.json" ]]; then
        if [[ -d "${SCRIPT_DIR}/../node_modules" ]]; then
            success "Dependencias Node.js instaladas"
        else
            warning "Dependencias Node.js no instaladas. Ejecutar: npm install"
        fi
    else
        error "package.json no encontrado"
    fi
}

# Verificar logs y directorios
check_logs_and_directories() {
    log "📋 Verificando logs y directorios..."
    
    # Crear directorio de logs si no existe
    logs_dir="${SCRIPT_DIR}/../logs"
    if [[ ! -d "$logs_dir" ]]; then
        mkdir -p "$logs_dir"
        success "Directorio de logs creado"
    else
        success "Directorio de logs existente"
    fi
    
    # Verificar permisos de escritura
    if [[ -w "$logs_dir" ]]; then
        success "Permisos de escritura en directorio de logs"
    else
        error "Sin permisos de escritura en directorio de logs"
    fi
}

# Generar checklist de deployment
generate_deployment_checklist() {
    log "📝 Generando checklist de deployment..."
    
    cat > "$CHECKLIST_FILE" << EOF
# 📋 CHECKLIST DE DEPLOYMENT - $(date)

## ✅ Verificaciones Pre-Deployment

### 🔧 Sistema
- [$(if [[ $CHECKS_FAILED -eq 0 ]]; then echo "x"; else echo " "; fi)] Variables de entorno configuradas
- [$(if [[ $CHECKS_FAILED -eq 0 ]]; then echo "x"; else echo " "; fi)] Conectividad a base de datos verificada
- [$(if [[ $CHECKS_FAILED -eq 0 ]]; then echo "x"; else echo " "; fi)] Permisos MySQL adecuados
- [$(if [[ $CHECKS_FAILED -eq 0 ]]; then echo "x"; else echo " "; fi)] Espacio en disco suficiente
- [$(if [[ $CHECKS_FAILED -eq 0 ]]; then echo "x"; else echo " "; fi)] Event Scheduler habilitado

### 📁 Archivos
- [$(if [[ $CHECKS_FAILED -eq 0 ]]; then echo "x"; else echo " "; fi)] Archivos de migración presentes
- [$(if [[ $CHECKS_FAILED -eq 0 ]]; then echo "x"; else echo " "; fi)] Dependencias Node.js instaladas
- [$(if [[ $CHECKS_FAILED -eq 0 ]]; then echo "x"; else echo " "; fi)] Directorios de logs configurados

### 🗄️ Base de Datos
- [$(if [[ $CHECKS_FAILED -eq 0 ]]; then echo "x"; else echo " "; fi)] Tablas principales existentes
- [$(if [[ $CHECKS_FAILED -eq 0 ]]; then echo "x"; else echo " "; fi)] Estructura de BD documentada

## 📊 Resumen de Verificaciones

**✅ Pasadas:** $CHECKS_PASSED  
**❌ Fallidas:** $CHECKS_FAILED  
**⚠️ Advertencias:** $CHECKS_WARNING  

## 🚀 Estado del Deployment

$(if [[ $CHECKS_FAILED -eq 0 ]]; then
    echo "**✅ SISTEMA LISTO PARA DEPLOYMENT**"
else
    echo "**❌ SISTEMA NO LISTO - RESOLVER ERRORES ANTES DE CONTINUAR**"
fi)

## 📋 Próximos Pasos

$(if [[ $CHECKS_FAILED -eq 0 ]]; then
    echo "1. Crear backup de producción"
    echo "2. Ejecutar migración de particionado"
    echo "3. Verificar deployment"
    echo "4. Ejecutar validaciones post-deployment"
else
    echo "1. Resolver errores identificados"
    echo "2. Volver a ejecutar verificaciones"
    echo "3. Proceder con deployment cuando esté listo"
fi)

---

**Generado:** $(date)  
**Log completo:** \`$(basename "$LOG_FILE")\`
EOF
    
    success "Checklist generado: $CHECKLIST_FILE"
}

# Función principal
main() {
    echo "🔍 INICIANDO VERIFICACIÓN PRE-DEPLOYMENT"
    echo "========================================"
    
    # Crear directorio de logs si no existe
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Ejecutar todas las verificaciones
    check_environment_variables
    check_database_connectivity
    check_mysql_permissions
    check_database_structure
    check_disk_space
    check_external_services
    check_application_services
    check_migration_files
    check_nodejs_environment
    check_logs_and_directories
    
    # Generar checklist
    generate_deployment_checklist
    
    echo
    echo "📊 RESUMEN DE VERIFICACIONES"
    echo "============================"
    echo "✅ Pasadas: $CHECKS_PASSED"
    echo "❌ Fallidas: $CHECKS_FAILED"
    echo "⚠️ Advertencias: $CHECKS_WARNING"
    echo
    
    if [[ $CHECKS_FAILED -eq 0 ]]; then
        success "🎉 SISTEMA LISTO PARA DEPLOYMENT"
        echo "Checklist: $CHECKLIST_FILE"
        echo "Log: $LOG_FILE"
        exit 0
    else
        error "❌ SISTEMA NO LISTO - RESOLVER ERRORES ANTES DE CONTINUAR"
        echo "Checklist: $CHECKLIST_FILE"
        echo "Log: $LOG_FILE"
        exit 1
    fi
}

# Ejecutar función principal
main "$@" 