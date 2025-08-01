#!/bin/bash

# 🗄️ SCRIPT DE BACKUP DE PRODUCCIÓN
# Descripción: Crea backup completo de la base de datos antes del deployment
# Autor: Sistema Sabor DevOps Team
# Fecha: 2025-07-12

set -e  # Exit on any error

# Configuración
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${SCRIPT_DIR}/../backups/production"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/sabor_db_backup_${TIMESTAMP}.sql"
LOG_FILE="${BACKUP_DIR}/backup_log_${TIMESTAMP}.log"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Verificar variables de entorno
check_env() {
    log "Verificando variables de entorno..."
    
    required_vars=("DB_HOST" "DB_PORT" "DB_NAME" "DB_USER" "DB_PASSWORD")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            error "Variable de entorno $var no está definida"
            exit 1
        fi
    done
    
    success "Variables de entorno verificadas"
}

# Crear directorio de backups si no existe
setup_backup_dir() {
    log "Configurando directorio de backups..."
    
    if [[ ! -d "$BACKUP_DIR" ]]; then
        mkdir -p "$BACKUP_DIR"
        log "Directorio de backups creado: $BACKUP_DIR"
    fi
    
    # Verificar espacio disponible (mínimo 2GB)
    available_space=$(df "$BACKUP_DIR" | awk 'NR==2 {print $4}')
    min_space=2097152  # 2GB in KB
    
    if [[ $available_space -lt $min_space ]]; then
        error "Espacio insuficiente en disco. Requerido: 2GB, Disponible: $((available_space/1024/1024))GB"
        exit 1
    fi
    
    success "Directorio de backups configurado. Espacio disponible: $((available_space/1024/1024))GB"
}

# Verificar conectividad a la base de datos
check_db_connection() {
    log "Verificando conectividad a la base de datos..."
    
    mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" -e "SELECT 1;" > /dev/null 2>&1
    
    if [[ $? -eq 0 ]]; then
        success "Conectividad a la base de datos verificada"
    else
        error "No se pudo conectar a la base de datos"
        exit 1
    fi
}

# Obtener información de la base de datos
get_db_info() {
    log "Obteniendo información de la base de datos..."
    
    # Contar tablas
    table_count=$(mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${DB_NAME}';" 2>/dev/null | tail -n1)
    
    # Obtener tamaño de la BD
    db_size=$(mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" -e "SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'DB Size (MB)' FROM information_schema.tables WHERE table_schema='${DB_NAME}';" 2>/dev/null | tail -n1)
    
    log "Información de la base de datos:"
    log "  - Tablas: $table_count"
    log "  - Tamaño: ${db_size}MB"
    
    # Guardar información en archivo
    cat > "${BACKUP_DIR}/db_info_${TIMESTAMP}.txt" << EOF
Información de Backup - $(date)
================================
Host: ${DB_HOST}:${DB_PORT}
Database: ${DB_NAME}
User: ${DB_USER}
Tablas: $table_count
Tamaño: ${db_size}MB
Archivo de Backup: $(basename "$BACKUP_FILE")
EOF
}

# Crear backup completo
create_backup() {
    log "Iniciando backup completo de la base de datos..."
    
    # Opciones de mysqldump para backup completo
    mysqldump_opts=(
        --single-transaction
        --routines
        --triggers
        --events
        --hex-blob
        --complete-insert
        --extended-insert
        --lock-tables=false
        --add-drop-table
        --add-locks
        --create-options
        --disable-keys
        --quick
        --set-charset
        --default-character-set=utf8mb4
    )
    
    # Ejecutar mysqldump
    log "Ejecutando mysqldump..."
    mysqldump "${mysqldump_opts[@]}" \
        -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" \
        "${DB_NAME}" > "$BACKUP_FILE" 2>>"$LOG_FILE"
    
    if [[ $? -eq 0 ]]; then
        success "Backup creado exitosamente: $BACKUP_FILE"
    else
        error "Error al crear backup"
        exit 1
    fi
}

# Verificar integridad del backup
verify_backup() {
    log "Verificando integridad del backup..."
    
    # Verificar que el archivo no esté vacío
    if [[ ! -s "$BACKUP_FILE" ]]; then
        error "El archivo de backup está vacío"
        exit 1
    fi
    
    # Verificar que contenga estructura SQL válida
    if ! grep -q "CREATE TABLE" "$BACKUP_FILE"; then
        error "El backup no contiene estructura SQL válida"
        exit 1
    fi
    
    # Obtener tamaño del archivo
    backup_size=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
    
    # Comprimir backup para ahorrar espacio
    log "Comprimiendo backup..."
    gzip "$BACKUP_FILE"
    
    compressed_size=$(ls -lh "${BACKUP_FILE}.gz" | awk '{print $5}')
    
    success "Backup verificado y comprimido:"
    log "  - Archivo original: ${backup_size}"
    log "  - Archivo comprimido: ${compressed_size}"
    log "  - Ubicación: ${BACKUP_FILE}.gz"
}

# Limpiar backups antiguos (mantener últimos 7 días)
cleanup_old_backups() {
    log "Limpiando backups antiguos..."
    
    # Eliminar backups más antiguos que 7 días
    find "$BACKUP_DIR" -name "sabor_db_backup_*.sql.gz" -mtime +7 -delete
    
    remaining_backups=$(find "$BACKUP_DIR" -name "sabor_db_backup_*.sql.gz" | wc -l)
    log "Backups mantenidos: $remaining_backups"
}

# Generar reporte de backup
generate_report() {
    log "Generando reporte de backup..."
    
    report_file="${BACKUP_DIR}/backup_report_${TIMESTAMP}.md"
    
    cat > "$report_file" << EOF
# 📊 REPORTE DE BACKUP - $(date)

## ✅ Resumen del Backup

**Estado:** Exitoso  
**Timestamp:** ${TIMESTAMP}  
**Archivo:** $(basename "${BACKUP_FILE}.gz")  
**Tamaño:** $(ls -lh "${BACKUP_FILE}.gz" | awk '{print $5}')  

## 📋 Detalles de la Base de Datos

**Host:** ${DB_HOST}:${DB_PORT}  
**Database:** ${DB_NAME}  
**User:** ${DB_USER}  
**Tablas:** $(cat "${BACKUP_DIR}/db_info_${TIMESTAMP}.txt" | grep "Tablas:" | cut -d' ' -f2)  
**Tamaño Original:** $(cat "${BACKUP_DIR}/db_info_${TIMESTAMP}.txt" | grep "Tamaño:" | cut -d' ' -f2)  

## 🔧 Configuración del Backup

**Opciones mysqldump:**
- Single transaction
- Routines y triggers incluidos
- Events incluidos
- Hex-blob activado
- Complete insert activado
- UTF8MB4 charset

## 📁 Ubicación de Archivos

- **Backup:** \`${BACKUP_FILE}.gz\`
- **Log:** \`${LOG_FILE}\`
- **Info:** \`${BACKUP_DIR}/db_info_${TIMESTAMP}.txt\`

## 🔍 Verificación

- [x] Archivo no vacío
- [x] Estructura SQL válida
- [x] Compresión exitosa
- [x] Logs guardados

## 🚀 Siguiente Paso

**Comando para restaurar:**
\`\`\`bash
gunzip -c ${BACKUP_FILE}.gz | mysql -h\${DB_HOST} -P\${DB_PORT} -u\${DB_USER} -p\${DB_PASSWORD} \${DB_NAME}
\`\`\`
EOF
    
    success "Reporte generado: $report_file"
}

# Función principal
main() {
    echo "🗄️ INICIANDO BACKUP DE PRODUCCIÓN"
    echo "=================================="
    
    check_env
    setup_backup_dir
    check_db_connection
    get_db_info
    create_backup
    verify_backup
    cleanup_old_backups
    generate_report
    
    echo
    success "🎉 BACKUP COMPLETADO EXITOSAMENTE"
    echo "=================================="
    echo "Archivo: ${BACKUP_FILE}.gz"
    echo "Log: ${LOG_FILE}"
    echo "Duración: $(date)"
}

# Ejecutar función principal
main "$@" 