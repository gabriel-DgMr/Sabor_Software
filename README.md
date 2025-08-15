# SABOR - Sistema de Gestión de Restaurantes

wompi, mercado pago Posibles opciones para la pasarela de pagos

## Descripción

SABOR es un sistema de gestión de restaurantes que permite administrar pedidos, clientes y autenticación de clientes. El sistema está construido con una arquitectura moderna y escalable.

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
DB_USER=tu_cliente
DB_PASSWORD=tu_contraseña
DB_NAME=sabor_db
JWT_SECRET=tu_secreto_jwt
SESSION_SECRET=secret_key
```

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
- `POST /api/auth/register` - Registro de clientes
- `POST /api/auth/logout` - Cierre de sesión

### clientes

- `GET /api/clientes` - Obtener lista de clientes
- `POST /api/clientes` - Crear nuevo cliente
- `GET /api/clientes/:id` - Obtener cliente específico
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente

## Scripts Disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo con nodemon
- `npm test`: Ejecuta las pruebas (pendiente de implementar)

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
