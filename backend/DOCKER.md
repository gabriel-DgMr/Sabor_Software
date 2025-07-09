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
docker exec -it sabor-mysql mysql -u sabor_user -p sabor_db_1

# Conectar desde herramienta gráfica
Host: localhost
Port: 3306
User: sabor_user
Password: sabor_password
Database: sabor_db_1
```

## 🔧 Configuración Detallada

### Variables de Entorno

```env
# MySQL Principal
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=sabor_db_1
MYSQL_USER=sabor_user
MYSQL_PASSWORD=sabor_password
MYSQL_PORT=3306

# Aplicación
DB_HOST=localhost
DB_USER=sabor_user
DB_PASSWORD=sabor_password
DB_NAME=sabor_db_1
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
- Los archivos con prefijo numérico (000_, 001_, etc.) se ejecutan en orden
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
docker exec -it sabor-mysql mysql -u root -p -e "USE sabor_db_1; SELECT * FROM migration_history;"

# Backup de base de datos
docker exec sabor-mysql mysqldump -u root -p sabor_db_1 > backup.sql

# Restaurar backup
docker exec -i sabor-mysql mysql -u root -p sabor_db_1 < backup.sql
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
docker exec -it sabor-mysql mysql -u root -p -e "USE sabor_db_1; SELECT * FROM migration_history;"
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
2. Incluir `USE sabor_db_1;` al inicio
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
docker exec sabor-mysql mysqldump -u root -p sabor_db_1 > backup_pre_update.sql
```

## 📞 Soporte

Para problemas con Docker:
1. Revisar logs: `docker-compose logs mysql-sabor`
2. Verificar configuración: `docker-compose config`
3. Consultar documentation: `docker-compose --help`
4. Verificar recursos: `docker system df` 