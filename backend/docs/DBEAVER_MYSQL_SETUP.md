# Configuración de DBeaver para MySQL 8.0

## Problema: "Public Key retrieval is not allowed"

Este error es común cuando se conecta a MySQL 8.0 desde DBeaver debido a los cambios en el método de autenticación predeterminado de MySQL.

## Soluciones Implementadas

### 1. Configuración del Servidor MySQL

Se han realizado los siguientes cambios en la configuración del contenedor MySQL:

- **Dockerfile.mysql**: Configuración base del contenedor
- **mysql/conf.d/mysql.cnf**: Configuración detallada de MySQL
- **docker-compose.yml**: Parámetros de ejecución específicos

### 2. Configuración de DBeaver

#### Opción A: Configuración Básica (Recomendada)

1. Crear nueva conexión MySQL
2. Configurar los datos de conexión:
   - **Server Host**: `localhost`
   - **Port**: `3306`
   - **Database**: `sabor_db`
   - **Username**: `sabor_user`
   - **Password**: `sabor_password`

3. En la pestaña **Driver Properties**:
   - **allowPublicKeyRetrieval**: `true`
   - **useSSL**: `false` (para desarrollo)
   - **serverTimezone**: `America/Bogota`

#### Opción B: Configuración Avanzada

En la pestaña **Driver Properties**, también puedes configurar:

- **useServerPrepStmts**: `true`
- **cachePrepStmts**: `true`
- **rewriteBatchedStatements**: `true`
- **useLocalSessionState**: `true`
- **useLocalTransactionState**: `true`

### 3. Configuración de URL de Conexión Manual

Si prefieres usar una URL de conexión manual:

```
jdbc:mysql://localhost:3306/sabor_db?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=America/Bogota
```

## Usuarios Disponibles

### Usuario Root

- **Username**: `root`
- **Password**: `rootpassword`

### Usuario de Aplicación

- **Username**: `sabor_user`
- **Password**: `sabor_password`
- **Database**: `sabor_db`

## Verificación de la Conexión

### Desde Terminal

```bash
# Conectar al contenedor MySQL
docker exec -it sabor-mysql mysql -u root -p

# Verificar usuarios
SELECT User, Host, plugin FROM mysql.user;

# Verificar bases de datos
SHOW DATABASES;
```

### Desde DBeaver

1. Hacer clic en **Test Connection**
2. Verificar que aparezca "Connected"
3. Si hay problemas, revisar los logs del contenedor:
   ```bash
   docker logs sabor-mysql
   ```

## Resolución de Problemas Comunes

### Error: Access denied for user

- Verificar que el usuario y contraseña sean correctos
- Asegurar que el usuario tenga permisos en la base de datos

### Error: Connection timeout

- Verificar que el puerto 3306 esté disponible
- Revisar que no haya firewall bloqueando la conexión

### Error: SSL connection

- Configurar `useSSL=false` en las propiedades del driver
- Alternativamente, configurar SSL correctamente

## Archivos de Configuración Modificados

1. **docker-compose.yml**: Configuración del contenedor
2. **Dockerfile.mysql**: Definición de la imagen personalizada
3. **mysql/conf.d/mysql.cnf**: Configuración detallada de MySQL
4. **docker.env.example**: Variables de entorno de ejemplo

## Reiniciar los Servicios

Después de hacer cambios en la configuración:

```bash
# Parar y eliminar contenedores
docker-compose down

# Reconstruir e iniciar
docker-compose up --build
```

## Notas Adicionales

- La configuración actual está optimizada para desarrollo
- Para producción, revisar la configuración de seguridad
- Los volúmenes persistentes mantienen los datos entre reinicios
- Las migraciones se ejecutan automáticamente al iniciar el contenedor
