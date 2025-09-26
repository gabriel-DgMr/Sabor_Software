# Inserción de Datos de Prueba en Producción

Este directorio contiene scripts para insertar datos de prueba en la base de datos de producción.

## ⚠️ IMPORTANTE

**Estos scripts están diseñados para insertar datos de prueba en la base de datos de producción. Úsalos con precaución.**

## Scripts Disponibles

### 1. `verify-production-connection.js`

Verifica la conexión a la base de datos de producción antes de insertar datos.

```bash
npm run db:verify
```

**Funcionalidades:**

- Verifica la conexión a la base de datos
- Muestra información del servidor MySQL
- Lista las tablas existentes
- Verifica datos existentes
- Valida la estructura de tablas críticas

### 2. `insert-test-data.js`

Inserta datos de prueba en la base de datos.

```bash
# Insertar todos los datos (usuarios, productos y pedidos)
npm run db:seed

# Insertar solo usuarios
npm run db:seed:users

# Insertar solo productos
npm run db:seed:products

# Insertar solo pedidos
npm run db:seed:orders
```

**Datos que inserta:**

#### Usuarios de Prueba:

- **Juan Pérez** (juan.perez@test.com) - Usuario normal
- **María García** (maria.garcia@test.com) - Usuario normal
- **Carlos López** (carlos.lopez@test.com) - Usuario normal
- **Ana Martínez** (ana.martinez@test.com) - Usuario normal
- **Luis Rodríguez** (luis.rodriguez@test.com) - Usuario normal
- **Admin Test** (admin@test.com) - Administrador

**Contraseñas por defecto:**

- Usuarios normales: `password123`
- Administrador: `admin123`

#### Productos de Prueba:

- Pizza Margherita ($25,000)
- Pizza Pepperoni ($28,000)
- Hamburguesa Clásica ($18,000)
- Coca Cola 350ml ($3,000)
- Agua 500ml ($2,000)

#### Pedidos de Prueba:

- 5 pedidos con diferentes estados (pendiente, pagado, entregado)
- Incluye pedidos para domicilio y mesa
- Diferentes métodos de pago (efectivo, tarjeta)

## Proceso Recomendado

### 1. Verificar Conexión

```bash
npm run db:verify
```

### 2. Insertar Datos

```bash
npm run db:seed
```

### 3. Verificar Resultados

El script mostrará un resumen de los datos insertados y pedidos recientes.

## Configuración Requerida

### Variables de Entorno

Asegúrate de tener configuradas las siguientes variables:

```env
NODE_ENV=production
DB_HOST=tu_host_de_produccion
DB_USER=tu_usuario_de_produccion
DB_PASSWORD=tu_contraseña_de_produccion
DB_NAME=tu_base_de_datos_de_produccion
DB_PORT=3306
```

### Estructura de Base de Datos

El script asume que las siguientes tablas existen:

- `usuarios`
- `productos`
- `pedidos`
- `detalle_pedidos`
- `categorias`
- `estados`
- `roles`

## Características de Seguridad

### Prevención de Duplicados

- El script verifica si los datos ya existen antes de insertarlos
- No sobrescribe datos existentes
- Muestra advertencias para datos duplicados

### Transacciones

- Los pedidos se crean usando transacciones
- Si hay un error, se hace rollback automáticamente
- Mantiene la integridad de los datos

### Validación de Datos

- Verifica que existan usuarios y productos antes de crear pedidos
- Valida la estructura de la base de datos
- Maneja errores de manera segura

## Solución de Problemas

### Error de Conexión

```bash
# Verificar variables de entorno
npm run db:verify

# Diagnosticar problemas de conexión
npm run db:diagnostic
```

### Error de Permisos

- Verificar que el usuario de base de datos tenga permisos de INSERT
- Verificar que las tablas existan
- Verificar la estructura de la base de datos

### Datos Duplicados

- El script omite datos duplicados automáticamente
- Revisa los logs para ver qué datos se omitieron
- Usa scripts específicos para insertar solo lo que necesites

## Logs y Monitoreo

### Información Mostrada

- Usuarios creados/verificados
- Productos creados/verificados
- Pedidos creados
- Resumen final de datos
- Pedidos recientes

### Manejo de Errores

- Errores específicos por operación
- Rollback automático en caso de fallo
- Logs detallados para debugging

## Comandos Útiles

```bash
# Verificar estado de la base de datos
npm run db:diagnostic

# Verificar conexión
npm run db:verify

# Insertar todos los datos
npm run db:seed

# Insertar solo usuarios
npm run db:seed:users

# Insertar solo productos
npm run db:seed:products

# Insertar solo pedidos
npm run db:seed:orders

# Verificar salud de la base de datos
npm run health-check
```

## Notas Importantes

1. **Backup**: Siempre haz un backup de la base de datos antes de insertar datos
2. **Testing**: Prueba primero en un entorno de desarrollo
3. **Monitoreo**: Supervisa los logs durante la inserción
4. **Limpieza**: Los datos de prueba pueden ser eliminados después si es necesario

## Contacto

Si tienes problemas con estos scripts, revisa los logs de error y verifica la configuración de la base de datos.
