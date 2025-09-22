# Solución para Error CSP con PayU

## Problema

```
Refused to send form data to 'https://checkout.payulatam.com/ppp-web-gateway-payu/' because it violates the following Content Security Policy directive: "form-action 'self'".
```

## Causa

La política de seguridad de contenido (CSP) estaba bloqueando el envío de formularios a PayU porque la directiva `form-action` solo permitía envíos a `'self'` (el mismo dominio).

## Solución Implementada

### 1. Archivos Modificados

#### `backend/index.js`

- Agregada directiva `formAction` en la configuración de Helmet
- Permite envíos a PayU sandbox y producción

#### `backend/src/config/security.js`

- Actualizada la política CSP en los headers de seguridad
- Incluye URLs de PayU en `form-action`

#### `backend/src/middleware/security.js`

- Actualizada configuración de Helmet en middleware
- Agregada directiva `formAction` para PayU

#### `nginx.conf`

- Actualizada política CSP en nginx
- Permite formularios a PayU

### 2. URLs Permitidas

- `https://checkout.payulatam.com` (Producción)
- `https://sandbox.checkout.payulatam.com` (Sandbox)

### 3. Configuración CSP Final

```javascript
formAction: [
  "'self'",
  "https://checkout.payulatam.com",
  "https://sandbox.checkout.payulatam.com",
];
```

## Verificación

### Script de Prueba

Ejecutar el script de verificación:

```bash
cd backend
node scripts/test-csp.js
```

### Pruebas Manuales

1. Agregar productos al carrito
2. Proceder al pago con PayU
3. Verificar que el formulario se envía correctamente
4. Confirmar redirección a PayU

## Consideraciones de Seguridad

### ✅ Seguro

- Solo permite formularios a dominios específicos de PayU
- Mantiene todas las demás políticas de seguridad
- No compromete la seguridad general de la aplicación

### ⚠️ Importante

- Verificar que las URLs de PayU sean correctas
- Mantener actualizada la configuración si PayU cambia sus URLs
- Monitorear logs de seguridad para detectar intentos de abuso

## Archivos de Configuración PayU

### Variables de Entorno Requeridas

```env
PAYU_API_LOGIN=tu_api_login
PAYU_API_KEY=tu_api_key
PAYU_MERCHANT_ID=tu_merchant_id
PAYU_ACCOUNT_ID=tu_account_id
PAYU_TEST_MODE=true  # o false para producción
FRONTEND_URL=http://localhost:5173
```

### URLs de PayU

- **Sandbox**: `https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/`
- **Producción**: `https://checkout.payulatam.com/ppp-web-gateway-payu/`

## Troubleshooting

### Si el error persiste:

1. Verificar que el servidor se reinició después de los cambios
2. Limpiar caché del navegador
3. Verificar headers CSP en DevTools del navegador
4. Revisar logs del servidor para errores de configuración

### Comandos útiles:

```bash
# Reiniciar servidor backend
npm run dev

# Verificar headers CSP
curl -I http://localhost:3000/api/health

# Probar formulario PayU
curl -X POST http://localhost:3000/api/payu/formulario \
  -H "Content-Type: application/json" \
  -d '{"items":[{"nombre_producto":"Test","precio_unitario":10000,"cantidad":1}]}'
```
