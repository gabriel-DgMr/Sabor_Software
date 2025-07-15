# Configuración de Variables de Entorno - MySQL

## Problema Resuelto

**Antes**: Las contraseñas estaban hardcodeadas en archivos SQL, causando inconsistencias con las variables de entorno.

**Ahora**: Se usan variables de entorno dinámicamente para configurar usuarios y contraseñas.

## Cómo Funciona

### 1. Variables de Entorno (docker-compose.yml)
```yaml
environment:
  MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-rootpassword}
  MYSQL_DATABASE: ${MYSQL_DATABASE:-sabor_db}
  MYSQL_USER: ${MYSQL_USER:-sabor_user}
  MYSQL_PASSWORD: ${MYSQL_PASSWORD:-sabor_password}
```

### 2. Archivo .env (opcional)
Crea un archivo `.env` basado en `docker.env.example`:
```bash
# Configuración de MySQL
MYSQL_ROOT_PASSWORD=mi_contraseña_root_segura
MYSQL_DATABASE=sabor_db
MYSQL_USER=sabor_user
MYSQL_PASSWORD=mi_contraseña_usuario_segura
MYSQL_PORT=3306
```

### 3. Inicialización Automática
- **000_docker_init.sql**: Crea la base de datos y estructura básica
- **001_setup_users.sh**: Configura usuarios usando variables de entorno
- **002_create_base_tables.sql**: Crea las tablas de la aplicación

## Orden de Ejecución

MySQL ejecuta los archivos en `/docker-entrypoint-initdb.d/` en orden alfabético:

1. `000_docker_init.sql` - Inicialización básica
2. `001_setup_users.sh` - Configuración de usuarios con variables de entorno
3. `002_create_base_tables.sql` - Creación de tablas
4. `003_insert_initial_data.sql` - Datos iniciales
5. `004_create_triggers.sql` - Triggers
6. `005_create_indexes.sql` - Índices

## Personalización de Contraseñas

### Opción 1: Archivo .env (Recomendado)
```bash
# Crear archivo .env
cp docker.env.example .env

# Editar contraseñas
nano .env
```

### Opción 2: Variables de Entorno del Sistema
```bash
export MYSQL_ROOT_PASSWORD="mi_contraseña_root"
export MYSQL_PASSWORD="mi_contraseña_usuario"
docker-compose up --build
```

### Opción 3: Inline en docker-compose
```bash
MYSQL_ROOT_PASSWORD=mi_contraseña docker-compose up --build
```

## Conexión desde DBeaver

### Con Variables por Defecto:
- **Host**: `localhost`
- **Puerto**: `3306`
- **Database**: `sabor_db`
- **Usuario**: `sabor_user`
- **Contraseña**: `sabor_password`

### Con Variables Personalizadas:
- **Host**: `localhost`
- **Puerto**: `3306`
- **Database**: Tu valor de `MYSQL_DATABASE`
- **Usuario**: Tu valor de `MYSQL_USER`
- **Contraseña**: Tu valor de `MYSQL_PASSWORD`

## Verificación de Configuración

### Ver Variables Actuales:
```bash
# Usar el script de debug
./debug-mysql.sh variables

# O manualmente
docker exec sabor-mysql mysql -u root -p -e "SELECT User, Host FROM mysql.user;"
```

### Ver Logs de Configuración:
```bash
# Ver logs de inicialización
docker logs sabor-mysql

# Ver logs específicos del script de usuarios
docker logs sabor-mysql | grep "Configurando usuarios"
```

## Seguridad

### Para Desarrollo:
- Usa contraseñas simples para facilitar desarrollo
- Los usuarios tienen permisos amplios (`%` host)
- SSL está desactivado

### Para Producción:
- Cambia todas las contraseñas por defecto
- Usa contraseñas fuertes y únicas
- Restringe hosts de conexión
- Activa SSL/TLS
- Revisa permisos de usuarios

## Resolución de Problemas

### Error "Access denied":
1. Verificar que las variables de entorno estén definidas
2. Comprobar que el script `001_setup_users.sh` se ejecutó correctamente
3. Verificar logs: `docker logs sabor-mysql`

### Contraseñas no coinciden:
1. Eliminar volúmenes: `docker volume rm sabor_mysql_data`
2. Reconstruir: `docker-compose up --build`
3. Verificar variables: `docker exec sabor-mysql env | grep MYSQL`

### Script no se ejecuta:
1. Verificar permisos: `ls -la migrations/`
2. Verificar sintaxis: `bash -n migrations/001_setup_users.sh`
3. Revisar logs de contenedor

## Ejemplo Completo

### 1. Configurar Variables:
```bash
# Crear archivo .env
cat > .env << EOF
MYSQL_ROOT_PASSWORD=rootpassword123
MYSQL_DATABASE=sabor_db
MYSQL_USER=sabor_user
MYSQL_PASSWORD=sabor_password123
MYSQL_PORT=3306
EOF
```

### 2. Inicializar:
```bash
# Limpiar volúmenes existentes
docker-compose down
docker volume rm sabor_mysql_data sabor_mysql_logs

# Reconstruir
docker-compose up --build
```

### 3. Verificar:
```bash
# Verificar usuarios
./debug-mysql.sh users

# Probar conexión
./debug-mysql.sh connect
```

## Archivos Importantes

- `docker.env.example` - Plantilla de variables de entorno
- `migrations/000_docker_init.sql` - Inicialización básica
- `migrations/001_setup_users.sh` - Configuración de usuarios
- `docker-compose.yml` - Definición de servicios
- `Dockerfile.mysql` - Imagen personalizada de MySQL 