#!/bin/bash

# =============================================================================
# SCRIPT DE DEBUG PARA MYSQL - SISTEMA SABOR
# =============================================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

show_help() {
    echo -e "${GREEN}=== DEBUG MYSQL - SISTEMA SABOR ===${NC}"
    echo ""
    echo "Uso: ./debug-mysql.sh [opción]"
    echo ""
    echo "Opciones disponibles:"
    echo "  logs         - Ver logs en tiempo real del contenedor"
    echo "  error        - Ver logs de error de MySQL"
    echo "  general      - Ver logs generales de MySQL"
    echo "  slow         - Ver logs de consultas lentas"
    echo "  status       - Ver estado del contenedor"
    echo "  connect      - Conectar directamente a MySQL"
    echo "  users        - Ver usuarios configurados"
    echo "  variables    - Ver variables de configuración"
    echo "  env          - Ver variables de entorno del contenedor"
    echo "  processes    - Ver procesos activos"
    echo "  help         - Mostrar esta ayuda"
    echo ""
}

case $1 in
    logs)
        echo -e "${YELLOW}=== LOGS EN TIEMPO REAL ===${NC}"
        docker logs -f sabor-mysql
        ;;
    error)
        echo -e "${YELLOW}=== LOGS DE ERROR ===${NC}"
        docker exec sabor-mysql tail -f /var/log/mysql/error.log
        ;;
    general)
        echo -e "${YELLOW}=== LOGS GENERALES ===${NC}"
        docker exec sabor-mysql tail -f /var/log/mysql/general.log
        ;;
    slow)
        echo -e "${YELLOW}=== LOGS DE CONSULTAS LENTAS ===${NC}"
        docker exec sabor-mysql tail -f /var/log/mysql/slow.log
        ;;
    status)
        echo -e "${YELLOW}=== ESTADO DEL CONTENEDOR ===${NC}"
        docker ps -a | grep sabor-mysql
        echo ""
        docker stats sabor-mysql --no-stream
        ;;
    connect)
        echo -e "${YELLOW}=== CONECTANDO A MYSQL ===${NC}"
        echo "Conectando como root..."
        docker exec -it sabor-mysql mysql -u root -p
        ;;
    users)
        echo -e "${YELLOW}=== USUARIOS CONFIGURADOS ===${NC}"
        docker exec sabor-mysql mysql -u root -prootpassword -e "SELECT User, Host, plugin FROM mysql.user WHERE User IN ('root', 'sabor_user');"
        ;;
    variables)
        echo -e "${YELLOW}=== VARIABLES DE CONFIGURACIÓN ===${NC}"
        docker exec sabor-mysql mysql -u root -prootpassword -e "SHOW VARIABLES LIKE '%log%';"
        ;;
    env)
        echo -e "${YELLOW}=== VARIABLES DE ENTORNO ===${NC}"
        echo "Variables de entorno MySQL en el contenedor:"
        docker exec sabor-mysql env | grep MYSQL | sort
        echo ""
        echo "Variables de entorno del sistema docker-compose:"
        echo "MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-'NO DEFINIDA'}"
        echo "MYSQL_DATABASE=${MYSQL_DATABASE:-'NO DEFINIDA'}"
        echo "MYSQL_USER=${MYSQL_USER:-'NO DEFINIDA'}"
        echo "MYSQL_PASSWORD=${MYSQL_PASSWORD:-'NO DEFINIDA'}"
        echo "MYSQL_PORT=${MYSQL_PORT:-'NO DEFINIDA'}"
        ;;
    processes)
        echo -e "${YELLOW}=== PROCESOS ACTIVOS ===${NC}"
        docker exec sabor-mysql mysql -u root -prootpassword -e "SHOW PROCESSLIST;"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        if [ -z "$1" ]; then
            show_help
        else
            echo -e "${RED}Opción desconocida: $1${NC}"
            echo ""
            show_help
        fi
        ;;
esac 