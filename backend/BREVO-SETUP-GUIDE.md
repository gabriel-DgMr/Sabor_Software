# 🚀 Guía de Configuración de Brevo para Sabor App

## ✅ ¡Brevo Implementado!

He actualizado tu aplicación para usar **Brevo** en lugar de Gmail SMTP. Brevo es mucho más confiable y fácil de configurar.

## 📋 Pasos para Configurar Brevo

### 1. **Crear Cuenta en Brevo**

1. Ve a [brevo.com](https://brevo.com)
2. Haz clic en "Sign up" (Registrarse)
3. Completa el registro con tu email
4. Verifica tu cuenta de email

### 2. **Obtener tu API Key**

1. Una vez logueado, ve a **Settings** → **API Keys**
2. Haz clic en **"Create a new API key"**
3. Dale un nombre como "Sabor App"
4. Selecciona permisos: **"Send emails"**
5. Copia la API key generada (empieza con `xkeys-`)

### 3. **Configurar Variables de Entorno**

#### Para Desarrollo Local:

Edita el archivo `backend/.env`:

```env
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=xkeys-tu_api_key_de_brevo_aqui
```

#### Para Producción en Railway:

1. Ve a Railway Dashboard → Tu Proyecto → Variables
2. Actualiza estas variables:
   - `EMAIL_USER`: tu_email@gmail.com
   - `EMAIL_PASSWORD`: xkeys-tu_api_key_de_brevo_aqui

### 4. **Reiniciar la Aplicación**

```bash
# Para desarrollo
cd backend
npm run dev

# Para producción (Railway se reinicia automáticamente)
```

## 🎯 Ventajas de Brevo

- ✅ **300 emails/día gratis** (9,000/mes)
- ✅ **Sin configuración SMTP compleja**
- ✅ **API moderna y confiable**
- ✅ **Funciona perfectamente con Railway**
- ✅ **Sin problemas de autenticación**
- ✅ **Logs detallados**

## 🔍 Verificar que Funciona

### 1. **Probar Registro de Usuario**

Intenta registrarte con un email real. Deberías recibir el código de verificación inmediatamente.

### 2. **Revisar Logs**

Los logs ahora mostrarán:

```
📧 ===== INICIANDO ENVÍO DE EMAIL CON BREVO =====
📧 Destinatario: usuario@email.com
📧 Asunto: Código de Verificación - Sabor App
✅ Email enviado exitosamente con Brevo (intento 1)
📧 Message ID: [message-id]
```

### 3. **Diagnóstico**

Si necesitas diagnosticar problemas:

```bash
cd backend
npm run email:diagnostic
```

## 🚨 Solución de Problemas

### Error: "Invalid API Key"

- Verifica que copiaste la API key completa
- Asegúrate de que empiece con `xkeys-`
- Verifica que la API key tiene permisos de "Send emails"

### Error: "Unauthorized"

- Verifica que `EMAIL_USER` sea un email válido
- Asegúrate de que `EMAIL_PASSWORD` sea la API key de Brevo

### No Recibes Emails

- Revisa la carpeta de spam
- Verifica que el email de destino es válido
- Revisa los logs del servidor

## 📊 Límites de Brevo Gratuito

- **300 emails por día**
- **9,000 emails por mes**
- **Sin límite de destinatarios**
- **Soporte por email**

## 🔄 Migración Completada

### ✅ **Cambios Realizados:**

- Instalada dependencia `@getbrevo/brevo`
- Actualizada configuración de email (`emailConfig.js`)
- Actualizadas variables de entorno
- Implementado sistema de reintentos para Brevo
- Mantenido logging detallado

### ✅ **Archivos Actualizados:**

- `backend/src/config/emailConfig.js`
- `backend/env.example`
- `backend/railway-production.env`
- `railway-env-vars.txt`

## 🎉 ¡Listo!

Una vez que configures tu API key de Brevo, el sistema de emails funcionará perfectamente. Brevo es mucho más confiable que Gmail SMTP y no tendrás más problemas de conectividad.

**Próximo paso**: Ve a [brevo.com](https://brevo.com), crea tu cuenta, obtén tu API key y actualiza las variables de entorno.

---

**¿Necesitas ayuda?** Revisa los logs del servidor o ejecuta `npm run email:diagnostic` para diagnosticar cualquier problema.
