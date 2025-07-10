# Sistema de Migrations - Restaurante Sabor

Este sistema de migrations permite versionar y ejecutar cambios en la base de datos de forma controlada y ordenada.

## 📁 Estructura de Archivos

```
migrations/
├── 000_migration_control.sql    # Tabla de control de migrations
├── 001_create_database.sql      # Creación de la base de datos
├── 002_create_base_tables.sql   # Creación de todas las tablas
├── 003_insert_initial_data.sql  # Inserción de datos iniciales
├── 004_create_triggers.sql      # Creación de triggers
├── 005_create_indexes.sql       # Creación de índices
├── migrationManager.js          # Clase principal para manejo de migrations
├── runMigrations.js             # CLI para ejecutar migrations
└── README.md                    # Esta documentación
```

## 🚀 Instalación y Configuración

### 1. Instalar dependencias
```bash
npm install mysql2
```

### 2. Configurar variables de entorno
Crear un archivo `.env` en el directorio raíz del backend:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=sabor_db
```

### 3. Dar permisos de ejecución (Linux/Mac)
```bash
chmod +x migrations/runMigrations.js
```

## 📋 Uso del Sistema

### Comandos Disponibles

#### Ejecutar todas las migrations pendientes
```bash
node migrations/runMigrations.js run
```

#### Ver el estado de las migrations
```bash
node migrations/runMigrations.js status
```

#### Mostrar ayuda
```bash
node migrations/runMigrations.js help
```

### Scripts NPM (Opcional)

Agregar estos scripts al `package.json` del backend:
```json
{
  "scripts": {
    "migrate:run": "node migrations/runMigrations.js run",
    "migrate:status": "node migrations/runMigrations.js status",
    "migrate:help": "node migrations/runMigrations.js help"
  }
}
```

Luego ejecutar:
```bash
npm run migrate:run
npm run migrate:status
```

## 📊 Descripción de Migrations

### 000_migration_control.sql
- **Propósito**: Crear la tabla `migration_history` que controla qué migrations se han ejecutado
- **Contenido**: Tabla de control con campos para archivo, fecha de ejecución y estado

### 001_create_database.sql
- **Propósito**: Crear la base de datos `sabor_db`
- **Contenido**: DROP/CREATE de la base de datos con configuración UTF8MB4

### 002_create_base_tables.sql
- **Propósito**: Crear todas las tablas del sistema
- **Contenido**: 
  - `categorias` - Categorías de productos
  - `estados` - Estados de pedidos y reservaciones
  - `mesas` - Mesas del restaurante
  - `roles` - Roles de usuarios
  - `clientes` - Información de clientes
  - `mensajes_contacto` - Mensajes de contacto
  - `codigos_verificacion` - Códigos para verificación de email
  - `empleados` - Información de empleados
  - `productos` - Productos del menú
  - `producto_traducciones` - Traducciones de productos
  - `pedidos` - Pedidos realizados
  - `detalle_pedidos` - Detalles de cada pedido
  - `reservaciones` - Reservaciones de mesas
  - `configuracion_horarios` - Configuración de horarios
  - `excepciones_horarios` - Excepciones en horarios

### 003_insert_initial_data.sql
- **Propósito**: Insertar datos iniciales necesarios para el funcionamiento
- **Contenido**:
  - Categorías de productos
  - Estados de pedidos
  - Mesas del restaurante
  - Productos del menú con traducciones
  - Configuración de horarios semanales

### 004_create_triggers.sql
- **Propósito**: Crear triggers para automatizar operaciones
- **Contenido**:
  - `before_detalle_pedido_insert` - Calcula precio y subtotal
  - `after_detalle_pedido_insert` - Actualiza total del pedido y stock
  - `before_detalle_pedido_delete` - Restaura stock al eliminar

### 005_create_indexes.sql
- **Propósito**: Crear índices para optimizar consultas
- **Contenido**:
  - Índices para búsquedas por categoría, cliente, empleado, estado y fecha

## 🔧 Funcionalidades del Sistema

### Control de Versiones
- Cada migration se ejecuta solo una vez
- Se registra la fecha y hora de ejecución
- Se controla el estado (éxito/error) de cada migration

### Ejecución Secuencial
- Las migrations se ejecutan en orden alfabético
- Si una migration falla, se detiene la ejecución
- Se registran los errores para diagnóstico

### Manejo de Errores
- Captura y registra errores de SQL
- Proporciona información detallada sobre fallos
- Permite reintento después de corregir errores

## 🛠️ Crear Nuevas Migrations

### Convención de Nombres
- Formato: `XXX_descripcion_migration.sql`
- XXX: Número secuencial de 3 dígitos
- descripcion: Breve descripción del cambio

### Ejemplo de nueva migration
```sql
-- Migration: 006_add_user_preferences.sql
-- Descripción: Agregar tabla de preferencias de usuario
-- Fecha: 2024-01-06

CREATE TABLE user_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  preference_key VARCHAR(50) NOT NULL,
  preference_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES clientes(id_cliente)
);
```

### Mejores Prácticas

1. **Una responsabilidad por migration**: Cada migration debe tener un propósito específico
2. **Comentarios descriptivos**: Incluir descripción y fecha
3. **Validar antes de ejecutar**: Probar en entorno de desarrollo
4. **Operaciones reversibles**: Considerar cómo deshacer cambios si es necesario
5. **Backup antes de ejecutar**: Siempre hacer respaldo de la base de datos

## 🔍 Troubleshooting

### Error: "Database doesn't exist"
```bash
# Asegurar que la base de datos se pueda crear
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS sabor_db;"
```

### Error: "Access denied"
```bash
# Verificar credenciales de base de datos
mysql -u root -p -e "SHOW DATABASES;"
```

### Error: "Migration already executed"
```bash
# Revisar estado de migrations
node migrations/runMigrations.js status
```

### Forzar re-ejecución de migration
```sql
-- Conectar a la base de datos y ejecutar:
DELETE FROM migration_history WHERE migration_file = 'nombre_migration.sql';
```

## 📞 Soporte

Para problemas con las migrations:
1. Verificar logs de error en la consola
2. Revisar el estado con `migrate:status`
3. Validar configuración de base de datos
4. Consultar la tabla `migration_history` para detalles

## 📝 Notas Importantes

- **Nunca modificar migrations ya ejecutadas**: Crear nuevas migrations para cambios
- **Backup regular**: Hacer respaldo antes de ejecutar migrations en producción
- **Entorno de pruebas**: Validar siempre en desarrollo antes de producción
- **Rollbacks**: Los rollbacks deben implementarse manualmente según sea necesario 