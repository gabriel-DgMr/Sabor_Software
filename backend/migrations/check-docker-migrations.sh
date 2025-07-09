#!/bin/bash

# =============================================================================
# VERIFICAR MIGRATIONS EN DOCKER - SISTEMA SABOR
# =============================================================================
# Script para verificar el estado de las migrations en el contenedor Docker MySQL

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
CONTAINER_NAME="sabor-mysql"
DB_NAME="sabor_db_1"
DB_USER="sabor_user"

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE}VERIFICADOR DE MIGRATIONS - SISTEMA SABOR${NC}"
echo -e "${BLUE}==============================================================================${NC}"

# Verificar si Docker está ejecutándose
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado o no está en el PATH${NC}"
    exit 1
fi

# Verificar si el contenedor está ejecutándose
if ! docker ps --format "table {{.Names}}" | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}❌ El contenedor $CONTAINER_NAME no está ejecutándose${NC}"
    echo -e "${YELLOW}💡 Ejecutar: docker-compose up -d${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Contenedor $CONTAINER_NAME está ejecutándose${NC}"

# Verificar conexión a la base de datos
echo -e "\n${BLUE}🔍 Verificando conexión a la base de datos...${NC}"
if docker exec -it "$CONTAINER_NAME" mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME; SELECT 1;" &> /dev/null; then
    echo -e "${GREEN}✅ Conexión exitosa a la base de datos${NC}"
else
    echo -e "${RED}❌ No se pudo conectar a la base de datos${NC}"
    echo -e "${YELLOW}💡 Verificar credenciales en docker-compose.yml${NC}"
    exit 1
fi

# Verificar tabla de control
echo -e "\n${BLUE}🔍 Verificando tabla de control...${NC}"
if docker exec -it "$CONTAINER_NAME" mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME; SELECT COUNT(*) FROM migration_history;" &> /dev/null; then
    echo -e "${GREEN}✅ Tabla migration_history existe${NC}"
else
    echo -e "${RED}❌ Tabla migration_history no existe${NC}"
    exit 1
fi

# Mostrar migrations ejecutadas
echo -e "\n${BLUE}📊 MIGRATIONS EJECUTADAS:${NC}"
echo -e "${BLUE}========================${NC}"
docker exec -it "$CONTAINER_NAME" mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "
USE $DB_NAME;
SELECT 
    migration_file,
    status,
    executed_at
FROM migration_history 
ORDER BY executed_at;" 2>/dev/null | grep -v "mysql: [Warning]" || echo -e "${RED}❌ Error al obtener migrations${NC}"

# Contar migrations
echo -e "\n${BLUE}📈 ESTADÍSTICAS:${NC}"
TOTAL_MIGRATIONS=$(docker exec -it "$CONTAINER_NAME" mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME; SELECT COUNT(*) FROM migration_history;" 2>/dev/null | tail -1 | tr -d '\r')
echo -e "${GREEN}✅ Total de migrations ejecutadas: $TOTAL_MIGRATIONS${NC}"

# Verificar archivos de migrations disponibles
echo -e "\n${BLUE}📁 ARCHIVOS DE MIGRATIONS EN CONTENEDOR:${NC}"
docker exec -it "$CONTAINER_NAME" ls -la /docker-entrypoint-initdb.d/ | grep ".sql" | while read line; do
    echo -e "${YELLOW}📄 $line${NC}"
done

# Verificar salud del contenedor
echo -e "\n${BLUE}🏥 SALUD DEL CONTENEDOR:${NC}"
HEALTH=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "no-healthcheck")
if [ "$HEALTH" = "healthy" ]; then
    echo -e "${GREEN}✅ Contenedor saludable${NC}"
elif [ "$HEALTH" = "unhealthy" ]; then
    echo -e "${RED}❌ Contenedor no saludable${NC}"
else
    echo -e "${YELLOW}⚠️  Sin verificación de salud configurada${NC}"
fi

# Mostrar información de volúmenes
echo -e "\n${BLUE}💾 VOLÚMENES:${NC}"
docker volume ls | grep sabor | while read line; do
    echo -e "${YELLOW}📦 $line${NC}"
done

# Información del servicio
echo -e "\n${BLUE}🔧 INFORMACIÓN DEL SERVICIO:${NC}"
docker-compose ps | grep mysql

echo -e "\n${BLUE}==============================================================================${NC}"
echo -e "${GREEN}✅ Verificación completada${NC}"
echo -e "${BLUE}==============================================================================${NC}"

# Comandos útiles
echo -e "\n${BLUE}📚 COMANDOS ÚTILES:${NC}"
echo -e "${YELLOW}• Ver logs: docker-compose logs -f mysql-sabor${NC}"
echo -e "${YELLOW}• Conectar a MySQL: docker exec -it sabor-mysql mysql -u sabor_user -p sabor_db_1${NC}"
echo -e "${YELLOW}• Detener: docker-compose down${NC}"
echo -e "${YELLOW}• Reconstruir: docker-compose build mysql-sabor${NC}" 