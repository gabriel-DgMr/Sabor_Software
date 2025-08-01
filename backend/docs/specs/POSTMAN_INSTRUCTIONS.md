# 📮 Guía de Uso de las Colecciones de Postman - Sabor API

## 🚀 Introducción

Esta guía te ayudará a importar y usar las colecciones de Postman para interactuar con la API de Sabor de manera eficiente y organizada.

## 📁 Archivos Incluidos

- `Sabor-API-Collection.postman_collection.json` - Colección principal con todos los endpoints
- `Sabor-API-Environment.postman_environment.json` - Entorno de desarrollo
- `Sabor-API-Production.postman_environment.json` - Entorno de producción

## 🔧 Instalación y Configuración

### 1. Importar la Colección

1. Abre Postman
2. Haz clic en "Import" en la esquina superior izquierda
3. Arrastra y suelta el archivo `Sabor-API-Collection.postman_collection.json`
4. Haz clic en "Import"

### 2. Importar los Entornos

1. En Postman, haz clic en "Import" nuevamente
2. Importa los archivos de entorno:
   - `Sabor-API-Environment.postman_environment.json` (Desarrollo)
   - `Sabor-API-Production.postman_environment.json` (Producción)

### 3. Seleccionar el Entorno

1. En la esquina superior derecha, selecciona el entorno deseado:
   - "Sabor API - Development" para desarrollo local
   - "Sabor API - Production" para producción

## 📂 Estructura de Carpetas

La colección está organizada en las siguientes carpetas:

### 🔐 Auth

- **Register User**: Registro de nuevos usuarios
- **Login User**: Autenticación (auto-guarda el token)
- **Verify Email**: Verificación de email
- **Forgot Password**: Solicitud de restablecimiento
- **Reset Password**: Restablecimiento de contraseña
- **Logout**: Cierre de sesión

### 🍽️ Products

- **Get All Products**: Lista de productos con filtros
- **Get Product by ID**: Producto específico
- **Create Product**: Crear nuevo producto (admin)
- **Update Product**: Actualizar producto existente
- **Delete Product**: Eliminar producto (admin)

### 📁 Categories

- **Get All Categories**: Lista de categorías
- **Get Category by ID**: Categoría específica
- **Get Products by Category**: Productos de una categoría

### 🛒 Orders & Cart

- **Create Order**: Crear nuevo pedido
- **Get Order by ID**: Pedido específico
- **Update Order Status**: Actualizar estado
- **Get User Orders**: Historial de pedidos
- **Add to Cart**: Agregar al carrito
- **Get Cart**: Contenido del carrito
- **Update Cart Item**: Actualizar cantidad
- **Remove from Cart**: Eliminar del carrito

### 📅 Reservations

- **Check Availability**: Verificar disponibilidad
- **Create Reservation**: Crear reserva
- **Get Reservation by ID**: Reserva específica
- **Update Reservation**: Actualizar reserva
- **Cancel Reservation**: Cancelar reserva
- **Get User Reservations**: Historial de reservas

### 👥 Users

- **Get User Profile**: Perfil del usuario actual
- **Update User Profile**: Actualizar perfil
- **Change Password**: Cambiar contraseña
- **Get All Users**: Lista de usuarios (admin)
- **Get User by ID**: Usuario específico (admin)
- **Update User Role**: Cambiar rol (admin)
- **Delete User**: Eliminar usuario (admin)

### 📞 Contact

- **Send Contact Message**: Enviar mensaje
- **Get Contact Messages**: Lista de mensajes (admin)
- **Mark Message as Read**: Marcar como leído (admin)

### 🕒 Schedules

- **Get Restaurant Hours**: Horarios del restaurante
- **Update Restaurant Hours**: Actualizar horarios (admin)

## 🔐 Autenticación Automática

### Login y Token Management

1. **Hacer Login**:
   - Usa el endpoint "Login User" en la carpeta Auth
   - El token JWT se guardará automáticamente en las variables de entorno
   - El userId también se guardará automáticamente

2. **Autenticación Automática**:
   - Los endpoints protegidos usan automáticamente el token guardado
   - Si el token expira, deberás hacer login nuevamente

### Script de Test Integrado

El endpoint de login incluye un script que:

- Guarda el token JWT en `{{authToken}}`
- Guarda el userId en `{{userId}}`
- Calcula la fecha de expiración del token
- Muestra mensajes de confirmación en la consola

## 🛠️ Variables de Entorno

### Variables Principales

| Variable        | Descripción                  | Ejemplo                                   |
| --------------- | ---------------------------- | ----------------------------------------- |
| `baseUrl`       | URL base del servidor        | `http://localhost:3001`                   |
| `authToken`     | Token JWT (auto-generado)    | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `userId`        | ID del usuario actual        | `123`                                     |
| `productId`     | ID de producto para testing  | `1`                                       |
| `categoryId`    | ID de categoría para testing | `1`                                       |
| `orderId`       | ID de pedido para testing    | `456`                                     |
| `reservationId` | ID de reserva para testing   | `789`                                     |

### Variables de Testing

| Variable           | Descripción                     | Valor por Defecto  |
| ------------------ | ------------------------------- | ------------------ |
| `adminEmail`       | Email del administrador         | `admin@sabor.com`  |
| `adminPassword`    | Contraseña del administrador    | `Admin123!`        |
| `testUserEmail`    | Email de usuario de prueba      | `test@example.com` |
| `testUserPassword` | Contraseña de usuario de prueba | `Test123!`         |

## 📝 Flujo de Trabajo Recomendado

### 1. Configuración Inicial

```bash
# Configurar entorno de desarrollo
baseUrl: http://localhost:3001

# Configurar entorno de producción
baseUrl: https://api.sabor.com
```

### 2. Autenticación

1. **Registrar Usuario** (si es necesario):

   ```json
   {
     "nombre": "Juan",
     "apellido": "Pérez",
     "email": "juan@example.com",
     "telefono": "1234567890",
     "contraseña": "Password123!"
   }
   ```

2. **Hacer Login**:
   ```json
   {
     "email": "juan@example.com",
     "contraseña": "Password123!"
   }
   ```

### 3. Operaciones Comunes

1. **Explorar Productos**:
   - `GET /api/productos` - Lista todos los productos
   - `GET /api/categorias` - Lista todas las categorías
   - `GET /api/categorias/{id}/productos` - Productos por categoría

2. **Gestionar Carrito**:
   - `POST /api/carrito` - Agregar producto
   - `GET /api/carrito` - Ver carrito
   - `PUT /api/carrito/{producto_id}` - Actualizar cantidad
   - `DELETE /api/carrito/{producto_id}` - Eliminar producto

3. **Crear Pedido**:
   - `POST /api/pedidos` - Crear pedido desde carrito
   - `GET /api/pedidos/{id}` - Ver estado del pedido

4. **Gestionar Reservas**:
   - `GET /api/reservas/disponibilidad` - Verificar disponibilidad
   - `POST /api/reservas` - Crear reserva
   - `GET /api/reservas/{id}` - Ver reserva

### 4. Funciones Administrativas

1. **Gestión de Productos**:
   - `POST /api/productos` - Crear producto
   - `PUT /api/productos/{id}` - Actualizar producto
   - `DELETE /api/productos/{id}` - Eliminar producto

2. **Gestión de Usuarios**:
   - `GET /api/usuarios` - Lista usuarios
   - `PUT /api/usuarios/{id}/rol` - Cambiar rol
   - `DELETE /api/usuarios/{id}` - Eliminar usuario

3. **Gestión de Pedidos**:
   - `PUT /api/pedidos/{id}` - Actualizar estado
   - `GET /api/pedidos` - Lista todos los pedidos

## 🔍 Testing y Debugging

### 1. Usar la Consola de Postman

- Ve a View → Show Postman Console
- Observa los logs de autenticación automática
- Verifica que las variables se están guardando correctamente

### 2. Verificar Variables

- Haz clic en el ícono del ojo 👁️ en la esquina superior derecha
- Verifica que `authToken` y `userId` tengan valores después del login

### 3. Respuestas de Error

Los endpoints devuelven errores en formato estándar:

```json
{
  "error": "Token no válido",
  "codigo": "AUTH_ERROR",
  "timestamp": "2024-12-27T00:00:00.000Z"
}
```

### 4. Códigos de Estado HTTP

| Código | Descripción                                |
| ------ | ------------------------------------------ |
| 200    | OK - Éxito                                 |
| 201    | Created - Recurso creado                   |
| 400    | Bad Request - Datos inválidos              |
| 401    | Unauthorized - Token inválido/expirado     |
| 403    | Forbidden - Sin permisos                   |
| 404    | Not Found - Recurso no encontrado          |
| 500    | Internal Server Error - Error del servidor |

## 🎯 Tips y Mejores Prácticas

### 1. Organización

- Usa carpetas para organizar requests relacionados
- Nombra los requests de manera descriptiva
- Agrega descripciones a los requests importantes

### 2. Reutilización

- Usa variables de entorno para valores que cambien entre ambientes
- Guarda IDs importantes en variables para reutilización
- Usa pre-request scripts para configuración automática

### 3. Colaboración

- Comparte la colección con tu equipo
- Mantén los entornos actualizados
- Documenta requests especiales o complejos

### 4. Seguridad

- No guardes credenciales reales en el entorno de desarrollo
- Usa variables de tipo "secret" para contraseñas
- Rotea tokens regularmente en producción

### 5. Testing

- Usa scripts de test para validar respuestas
- Implementa assertions para verificar estructura de datos
- Configura tests para verificar códigos de estado

## 🆘 Solución de Problemas

### Problema: Token Expirado

**Síntomas**: Error 401 "Token no válido"

**Solución**:

1. Ejecuta el endpoint "Login User" nuevamente
2. Verifica que el token se guardó en `{{authToken}}`
3. Intenta el request nuevamente

### Problema: Variables No Se Guardan

**Síntomas**: Variables vacías después del login

**Solución**:

1. Verifica que el entorno esté seleccionado
2. Revisa la respuesta del login en la consola
3. Ejecuta el script de test manualmente

### Problema: Servidor No Responde

**Síntomas**: Error de conexión o timeout

**Solución**:

1. Verifica que el servidor esté corriendo
2. Confirma la URL base en el entorno
3. Revisa la configuración de red/firewall

### Problema: Permisos Insuficientes

**Síntomas**: Error 403 "Sin permisos"

**Solución**:

1. Verifica que el usuario tenga el rol correcto
2. Usa credenciales de administrador para endpoints admin
3. Revisa la configuración de roles en el servidor

## 🔄 Actualización de la Colección

Cuando se actualice la API:

1. **Backup**: Exporta tu colección actual
2. **Import**: Importa la nueva versión
3. **Merge**: Combina configuraciones personalizadas
4. **Test**: Verifica que todo funcione correctamente

## 📚 Recursos Adicionales

- [Documentación de Postman](https://learning.postman.com/docs/)
- [OpenAPI Specification](./openapi.yml)
- [Ejemplos de cURL](./curl-examples.md)
- [README del proyecto](./README.md)

## 💬 Soporte

Para soporte técnico:

- **Email**: dev@sabor.com
- **Issues**: Reporta problemas en el repositorio
- **Wiki**: Consulta la documentación completa

---

¡Listo para usar! 🚀 Con estas colecciones tendrás todo lo necesario para interactuar con la API de Sabor de manera eficiente y organizada.
