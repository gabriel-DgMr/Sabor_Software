# SABOR - Sistema de Gestión de Restaurantes

wompi, mercado pago Posibles opciones para la pasarela de pagos

## Descripción
SABOR es un sistema de gestión de restaurantes que permite administrar pedidos, clientes y autenticación de usuarios. El sistema está construido con una arquitectura moderna y escalable.

## Estructura del Proyecto
```
backend/
├── src/
│   ├── config/     # Configuraciones de la aplicación
│   ├── controllers/# Controladores de la lógica de negocio
│   ├── models/     # Modelos de datos
│   └── routes/     # Rutas de la API
│       ├── authRoutes.js    # Rutas de autenticación
│       └── clienteRoutes.js # Rutas de gestión de clientes
├── index.js        # Punto de entrada de la aplicación
└── package.json    # Dependencias y scripts
```

## Requisitos Previos
- Node.js (versión recomendada: 18.x o superior)
- MySQL (versión recomendada: 8.x o superior)

## Instalación

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd SABOR
```

2. Instalar dependencias:
```bash
cd backend
npm install
```

3. Configurar variables de entorno:
Crear un archivo `.env` en la raíz del proyecto backend con las siguientes variables:
```
PORT=3000
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=sabor_db
JWT_SECRET=tu_secreto_jwt
SESSION_SECRET=secret_key
```

## Inicio Rápido

Para poner en marcha el proyecto por primera vez:

```bash
# 1. Instalar dependencias
cd backend
npm install

# 2. Configurar variables de entorno (crear archivo .env)
# Asegúrate de configurar las variables DB_* correctamente

# 3. Configurar la base de datos
npm run migrate:run

# 4. Iniciar el servidor
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## Configuración de la Base de Datos

### Sistema de Migrations
El proyecto incluye un sistema completo de migrations que permite crear y configurar la base de datos de forma automatizada.

#### Configuración Inicial
1. Asegúrate de que MySQL esté instalado y ejecutándose
2. Crea un usuario con permisos para crear bases de datos
3. Configura las variables de entorno DB_* en el archivo `.env`

#### Ejecutar Migrations
Para configurar la base de datos por primera vez:

```bash
# Desde el directorio backend
cd backend

# Ver el estado de las migrations
npm run migrate:status

# Ejecutar todas las migrations pendientes
npm run migrate:run

# Ver ayuda del sistema de migrations
npm run migrate:help
```

#### Comandos de Migrations Disponibles
- `npm run migrate:run` - Ejecuta todas las migrations pendientes
- `npm run migrate:status` - Muestra el estado de todas las migrations
- `npm run migrate:help` - Muestra información de ayuda

#### ¿Qué incluyen las Migrations?
- **001_create_database.sql**: Creación de la base de datos `sabor_db`
- **002_create_base_tables.sql**: Creación de todas las tablas del sistema
- **003_insert_initial_data.sql**: Inserción de datos iniciales (categorías, productos, mesas, horarios)
- **004_create_triggers.sql**: Triggers para automatización de operaciones
- **005_create_indexes.sql**: Índices para optimización de consultas

#### Datos Iniciales Incluidos
- 6 categorías de productos
- 30 mesas con diferentes capacidades
- 6 productos del menú con traducciones (español/inglés)
- Estados de pedidos y reservaciones
- Configuración de horarios semanales

#### Resolución de Problemas
Si encuentras errores al ejecutar las migrations:
1. Verifica que MySQL esté ejecutándose
2. Confirma las credenciales en el archivo `.env`
3. Asegúrate de que el usuario tenga permisos para crear bases de datos
4. Revisa los logs detallados que proporciona el sistema

### 📊 Análisis de la Estructura de Base de Datos
Para un análisis detallado de la estructura actual de la base de datos, incluyendo evaluación de normalización, principios SOLID, escalabilidad y recomendaciones de mejora, consulta:

📖 **[Análisis Completo de la Base de Datos](backend/ANALISIS_BD.md)**

Este documento incluye:
- ✅ Evaluación de la estructura actual
- 🔍 Análisis de normalización y principios SOLID
- 📈 Recomendaciones de mejora
- 🚀 Diseño propuesto para mejor escalabilidad
- 📋 Plan de migración detallado

## Ejecución del Proyecto

Para iniciar el servidor en modo desarrollo:
```bash
npm run dev
```

El servidor se ejecutará en `http://localhost:3000`

## Tecnologías Utilizadas

### Backend
- Node.js y Express.js como framework principal
- MySQL como base de datos
- JWT para autenticación
- Express Session para manejo de sesiones
- CORS configurado para desarrollo local (puerto 5173)
- Cookie Parser para manejo de cookies
- Morgan para logging
- Validator para validación de datos

## Endpoints de la API

### Autenticación
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/logout` - Cierre de sesión

### Clientes
- `GET /api/clientes` - Obtener lista de clientes
- `POST /api/clientes` - Crear nuevo cliente
- `GET /api/clientes/:id` - Obtener cliente específico
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente

## Scripts Disponibles

### Desarrollo
- `npm run dev`: Inicia el servidor en modo desarrollo con nodemon
- `npm start`: Inicia el servidor en modo producción
- `npm test`: Ejecuta las pruebas (pendiente de implementar)

### Base de Datos (Migrations)
- `npm run migrate:run`: Ejecuta todas las migrations pendientes
- `npm run migrate:status`: Muestra el estado de todas las migrations
- `npm run migrate:help`: Muestra información de ayuda sobre las migrations

### Otros
- `npm run security-check`: Ejecuta auditoría de seguridad
- `npm run lint`: Ejecuta el linter de código
- `npm run lint:fix`: Ejecuta el linter y corrige errores automáticamente

## Configuración de CORS
El backend está configurado para aceptar peticiones desde `http://localhost:5173` (frontend de desarrollo). Para producción, actualizar la configuración CORS en `index.js`.

## Contribución
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia
Este proyecto está bajo la Licencia ISC.
