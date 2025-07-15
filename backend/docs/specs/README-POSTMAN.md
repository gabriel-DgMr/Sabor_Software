# 📮 Colecciones de Postman - Sabor API

¡Bienvenido a las colecciones de Postman para la API de Sabor! 🚀

## 📁 Archivos Disponibles

Este directorio contiene todo lo necesario para trabajar con la API de Sabor usando Postman:

### 🔧 Colección Principal
- **`Sabor-API-Collection.postman_collection.json`** - Colección completa con todos los endpoints

### 🌍 Entornos
- **`Sabor-API-Environment.postman_environment.json`** - Entorno de desarrollo (localhost:3001)
- **`Sabor-API-Production.postman_environment.json`** - Entorno de producción (api.sabor.com)

### 📚 Documentación
- **`POSTMAN_INSTRUCTIONS.md`** - Guía completa de uso (¡LÉELO PRIMERO!)
- **`openapi.yml`** - Especificación OpenAPI 3.0.3

## 🚀 Inicio Rápido

### 1. Importar en Postman
```
1. Abre Postman
2. Clic en "Import"
3. Arrastra los archivos JSON
4. Selecciona el entorno "Sabor API - Development"
```

### 2. Hacer Login
```
1. Ve a la carpeta "🔐 Auth"
2. Ejecuta "Login User" con:
   - email: "test@example.com"
   - contraseña: "Test123!"
3. El token se guarda automáticamente
```

### 3. Explorar la API
```
1. Ve a "🍽️ Products" → "Get All Products"
2. Ve a "📁 Categories" → "Get All Categories"
3. Explora las otras carpetas según necesites
```

## 📂 Estructura de Carpetas

| Carpeta | Descripción | Endpoints |
|---------|-------------|-----------|
| 🔐 Auth | Autenticación | Login, Register, Reset Password |
| 🍽️ Products | Gestión de productos | CRUD completo + imágenes |
| 📁 Categories | Categorías | Listar, obtener productos |
| 🛒 Orders & Cart | Pedidos y carrito | Crear pedidos, gestionar carrito |
| 📅 Reservations | Sistema de reservas | Disponibilidad, crear, gestionar |
| 👥 Users | Gestión de usuarios | Perfil, admin functions |
| 📞 Contact | Mensajes de contacto | Enviar, gestionar mensajes |
| 🕒 Schedules | Horarios | Obtener, actualizar horarios |

## ✨ Características Especiales

- **🔐 Autenticación Automática**: El login guarda el token JWT automáticamente
- **🔄 Variables Dinámicas**: URLs y tokens se manejan automáticamente
- **📝 Scripts de Test**: Validación automática de respuestas
- **🎯 Ejemplos Reales**: Datos de ejemplo para cada endpoint
- **🏷️ Documentación**: Cada request incluye descripción detallada

## 🛠️ Variables de Entorno

### Variables Principales
- `baseUrl` - URL base del servidor
- `authToken` - Token JWT (auto-generado)
- `userId` - ID del usuario actual (auto-generado)

### Variables de Testing
- `productId`, `categoryId`, `orderId`, `reservationId` - IDs para testing
- `adminEmail`, `adminPassword` - Credenciales de administrador
- `testUserEmail`, `testUserPassword` - Credenciales de usuario de prueba

## 📖 Documentación Completa

Para instrucciones detalladas, ejemplos y troubleshooting:
👉 **[POSTMAN_INSTRUCTIONS.md](./POSTMAN_INSTRUCTIONS.md)**

## 🔄 Flujo de Trabajo Típico

1. **Importar colección y entorno**
2. **Hacer login** → Token se guarda automáticamente
3. **Explorar productos** → GET /api/productos
4. **Agregar al carrito** → POST /api/carrito
5. **Crear pedido** → POST /api/pedidos
6. **Gestionar reservas** → POST /api/reservas

## 🚨 Problemas Comunes

### Token Expirado
**Error**: 401 "Token no válido"
**Solución**: Ejecutar "Login User" nuevamente

### Variables Vacías
**Error**: Variables no se guardan después del login
**Solución**: Verificar que el entorno esté seleccionado

### Servidor No Responde
**Error**: Connection timeout
**Solución**: Verificar que el servidor esté corriendo en localhost:3001

## 📞 Soporte

- **Documentación completa**: `POSTMAN_INSTRUCTIONS.md`
- **OpenAPI Spec**: `openapi.yml`
- **Email**: dev@sabor.com

---

¡Listo para usar! 🎉 Con estas colecciones podrás probar toda la API de Sabor de manera eficiente y organizada.

**Próximo paso**: Lee [`POSTMAN_INSTRUCTIONS.md`](./POSTMAN_INSTRUCTIONS.md) para instrucciones detalladas. 