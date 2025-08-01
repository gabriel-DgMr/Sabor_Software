# Docker - Sistema de Base de Datos Sabor

Este documento describe cómo usar Docker para crear un contenedor MySQL con las migrations del sistema Sabor.

## 📋 Archivos Docker

### Estructura

```
backend/
├── Dockerfile.mysql          # Dockerfile para MySQL
├── docker-compose.yml        # Configuración de servicios
├── .dockerignore             # Archivos a ignorar
├── docker.env.example        # Variables de entorno de ejemplo
└── migrations/               # Archivos de migrations
    ├── 000_docker_init.sql   # Inicialización Docker
    ├── 000_migration_control.sql
    ├── 001_create_database.sql
    ├── 002_create_base_tables.sql
    ├── 003_insert_initial_data.sql
    ├── 004_create_triggers.sql
    └── 005_create_indexes.sql
```

## 🚀 Uso Rápido

### 1. Configuración

```bash
# Copiar variables de entorno
cp docker.env.example .env

# Editar variables según tu entorno
nano .env
```

### 2. Ejecutar

```bash
# Construir y ejecutar el contenedor
docker-compose up -d

# Ver logs
docker-compose logs -f mysql-sabor

# Verificar estado
docker-compose ps
```

### 3. Conectar a la base de datos

```bash
# Conectar desde línea de comandos
docker exec -it sabor-mysql mysql -u sabor_user -p sabor_db

# Conectar desde herramienta gráfica
Host: localhost
Port: 3306
User: sabor_user
Password: sabor_password
Database: sabor_db
```

## 🔧 Configuración Detallada

### Variables de Entorno

```env
# MySQL Principal
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=sabor_db
MYSQL_USER=sabor_user
MYSQL_PASSWORD=sabor_password
MYSQL_PORT=3306

# Aplicación
DB_HOST=localhost
DB_USER=sabor_user
DB_PASSWORD=sabor_password
DB_NAME=sabor_db
DB_PORT=3306
```

### Volúmenes Persistentes

- **mysql_data**: Datos de MySQL (`/var/lib/mysql`)
- **mysql_logs**: Logs de MySQL (`/var/log/mysql`)

### Red

- **sabor-network**: Red bridge personalizada para comunicación entre servicios

## 📊 Cómo Funciona

### 1. Inicialización Automática

Los archivos en `migrations/` se ejecutan automáticamente cuando se crea el contenedor:

1. **000_docker_init.sql**: Configuración inicial y tabla de control
2. **000_migration_control.sql**: Registro de migration de control
3. **001_create_database.sql**: Confirmación de base de datos
4. **002_create_base_tables.sql**: Creación de tablas
5. **003_insert_initial_data.sql**: Inserción de datos iniciales
6. **004_create_triggers.sql**: Creación de triggers
7. **005_create_indexes.sql**: Creación de índices

### 2. Orden de Ejecución

MySQL ejecuta los archivos `.sql` en orden alfabético, por lo que:

- Los archivos con prefijo numérico (000*, 001*, etc.) se ejecutan en orden
- Cada archivo registra su ejecución en la tabla `migration_history`
- Se evita la duplicación con `INSERT IGNORE`

### 3. Tabla de Control

```sql
CREATE TABLE migration_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  migration_file VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('success', 'error') DEFAULT 'success',
  error_message TEXT NULL
);
```

## 🔍 Comandos Útiles

### Gestión del Contenedor

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Reconstruir imagen
docker-compose build mysql-sabor

# Ver logs en tiempo real
docker-compose logs -f mysql-sabor

# Acceder al contenedor
docker exec -it sabor-mysql bash
```

### Base de Datos

```bash
# Conectar a MySQL
docker exec -it sabor-mysql mysql -u root -p

# Verificar migrations ejecutadas
docker exec -it sabor-mysql mysql -u root -p -e "USE sabor_db; SELECT * FROM migration_history;"

# Backup de base de datos
docker exec sabor-mysql mysqldump -u root -p sabor_db > backup.sql

# Restaurar backup
docker exec -i sabor-mysql mysql -u root -p sabor_db < backup.sql
```

### Limpieza

```bash
# Eliminar contenedores y volúmenes
docker-compose down -v

# Eliminar imágenes
docker rmi sabor-mysql

# Limpiar sistema Docker
docker system prune -f
```

## 🛡️ Configuración de Seguridad

### Producción

```env
# Cambiar contraseñas por defecto
MYSQL_ROOT_PASSWORD=tu_contraseña_root_segura
MYSQL_PASSWORD=tu_contraseña_usuario_segura

# Configurar acceso restringido
MYSQL_ROOT_HOST=localhost
```

### Firewall

```bash
# Permitir solo conexiones locales
ufw allow from 127.0.0.1 to any port 3306

# Permitir desde red específica
ufw allow from 192.168.1.0/24 to any port 3306
```

## 🔧 Troubleshooting

### Problemas Comunes

#### Puerto ocupado

```bash
# Verificar qué usa el puerto 3306
sudo netstat -tulpn | grep :3306
sudo lsof -i :3306

# Cambiar puerto en docker-compose.yml
ports:
  - "3307:3306"
```

#### Problemas de permisos

```bash
# Verificar permisos de volúmenes
ls -la /var/lib/docker/volumes/

# Resetear volúmenes
docker-compose down -v
docker volume prune
```

#### Migrations no se ejecutan

```bash
# Verificar logs
docker-compose logs mysql-sabor

# Verificar archivos copiados
docker exec -it sabor-mysql ls -la /docker-entrypoint-initdb.d/

# Verificar tabla de control
docker exec -it sabor-mysql mysql -u root -p -e "USE sabor_db; SELECT * FROM migration_history;"
```

#### Problemas de conexión

```bash
# Verificar red
docker network ls
docker inspect sabor-network

# Verificar servicio
docker-compose ps
docker-compose logs mysql-sabor
```

## 📈 Monitoreo

### Health Check

```bash
# Verificar estado de salud
docker-compose ps

# Logs del health check
docker inspect sabor-mysql | grep -A 20 "Health"
```

### Métricas

```bash
# Uso de recursos
docker stats sabor-mysql

# Espacio usado por volúmenes
docker system df
```

## 🔄 Actualización

### Nuevas Migrations

1. Crear archivo numerado (ej: `006_nueva_migration.sql`)
2. Incluir `USE sabor_db;` al inicio
3. Incluir registro al final:
   ```sql
   INSERT IGNORE INTO migration_history (migration_file, status) VALUES
   ('006_nueva_migration.sql', 'success');
   ```
4. Reconstruir contenedor:
   ```bash
   docker-compose down
   docker-compose build mysql-sabor
   docker-compose up -d
   ```

### Backup antes de actualizar

```bash
docker exec sabor-mysql mysqldump -u root -p sabor_db > backup_pre_update.sql
```

## 📞 Soporte

Para problemas con Docker:

1. Revisar logs: `docker-compose logs mysql-sabor`
2. Verificar configuración: `docker-compose config`
3. Consultar documentation: `docker-compose --help`
4. Verificar recursos: `docker system df`

# Configuración Docker - Sistema Sabor

## Modo Debug para MySQL

El contenedor MySQL está configurado con capacidades de debug avanzadas para facilitar el desarrollo y resolución de problemas.

### Configuraciones de Debug Incluidas

#### En docker-compose.yml:

- **Variables de entorno de debug**: `MYSQL_DEBUG=true`, `MYSQL_LOG_CONSOLE=true`
- **Logging detallado**: Logs de error con verbosidad máxima
- **Logs generales**: Todas las consultas SQL se registran
- **Logs de consultas lentas**: Consultas que toman más de 1 segundo
- **Gestión de logs**: Rotación automática de logs

#### En mysql.cnf:

- **Verbosidad de errores**: Nivel 3 (máximo detalle)
- **Log general activado**: Registra todas las consultas
- **Debug de InnoDB**: Información detallada sobre deadlocks y locks
- **Optimizaciones para desarrollo**: Configuraciones específicas para debug

### Cómo Usar el Modo Debug

#### 1. Iniciar en Modo Debug

```bash
# Reconstruir con configuración de debug
docker-compose down
docker-compose up --build

# Ver logs en tiempo real
docker-compose logs -f mysql-sabor
```

#### 2. Script de Debug (debug-mysql.sh)

Primero, hacer el script ejecutable:

```bash
chmod +x debug-mysql.sh
```

Luego usar las opciones disponibles:

```bash
# Ver ayuda
./debug-mysql.sh help

# Ver logs en tiempo real
./debug-mysql.sh logs

# Ver logs de error específicos
./debug-mysql.sh error

# Ver logs generales (todas las consultas)
./debug-mysql.sh general

# Ver consultas lentas
./debug-mysql.sh slow

# Ver estado del contenedor
./debug-mysql.sh status

# Conectar directamente a MySQL
./debug-mysql.sh connect

# Ver usuarios configurados
./debug-mysql.sh users

# Ver variables de configuración
./debug-mysql.sh variables

# Ver procesos activos
./debug-mysql.sh processes
```

#### 3. Comandos Manuales de Debug

**Ver logs del contenedor:**

```bash
docker logs sabor-mysql
docker logs -f sabor-mysql  # Seguir en tiempo real
```

**Conectar directamente a MySQL:**

```bash
docker exec -it sabor-mysql mysql -u root -p
```

**Ver archivos de log específicos:**

```bash
# Logs de error
docker exec sabor-mysql tail -f /var/log/mysql/error.log

# Logs generales
docker exec sabor-mysql tail -f /var/log/mysql/general.log

# Logs de consultas lentas
docker exec sabor-mysql tail -f /var/log/mysql/slow.log
```

### Información de Debug Útil

#### Verificar Usuarios y Permisos:

```sql
-- Conectar a MySQL y ejecutar:
SELECT User, Host, plugin FROM mysql.user;
SHOW GRANTS FOR 'sabor_user'@'%';
SHOW GRANTS FOR 'root'@'%';
```

#### Verificar Variables de Configuración:

```sql
-- Variables de logging
SHOW VARIABLES LIKE '%log%';

-- Variables de SSL
SHOW VARIABLES LIKE '%ssl%';

-- Variables de zona horaria
SELECT @@global.time_zone, @@session.time_zone;
```

#### Verificar Estado del Servidor:

```sql
-- Procesos activos
SHOW PROCESSLIST;

-- Estado del servidor
SHOW STATUS;

-- Variables del sistema
SHOW VARIABLES;
```

### Archivos de Log Disponibles

| Archivo       | Descripción               | Ubicación                    |
| ------------- | ------------------------- | ---------------------------- |
| `error.log`   | Errores y advertencias    | `/var/log/mysql/error.log`   |
| `general.log` | Todas las consultas SQL   | `/var/log/mysql/general.log` |
| `slow.log`    | Consultas lentas (>1 seg) | `/var/log/mysql/slow.log`    |

### Resolución de Problemas Comunes

#### Contenedor no inicia:

```bash
# Ver logs de inicio
docker logs sabor-mysql

# Verificar configuración
docker exec sabor-mysql mysqld --help --verbose
```

#### Problemas de conexión:

```bash
# Verificar puerto
docker port sabor-mysql

# Verificar red
docker network ls
docker network inspect sabor-network
```

#### Problemas de permisos:

```bash
# Verificar usuarios desde el contenedor
./debug-mysql.sh users

# Conectar y verificar permisos
./debug-mysql.sh connect
```

### Desactivar Modo Debug

Para desactivar el modo debug en producción:

1. **En docker-compose.yml**: Remover las variables `MYSQL_DEBUG` y `MYSQL_LOG_CONSOLE`
2. **En mysql.cnf**: Cambiar `general-log=0` y `log-error-verbosity=1`
3. **Reconstruir**: `docker-compose up --build`

### Notas Importantes

- **Rendimiento**: El modo debug puede impactar el rendimiento
- **Espacio en disco**: Los logs pueden crecer rápidamente
- **Producción**: Desactivar el modo debug en producción
- **Seguridad**: Los logs pueden contener información sensible

## Configuración Adicional

Para configuraciones específicas de tu entorno, copia `docker.env.example` a `.env` y personaliza las variables según tus necesidades.
