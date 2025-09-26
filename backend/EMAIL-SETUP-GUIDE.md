# 🔧 Guía para Configurar el Envío de Códigos de Verificación

## ❌ Problema Identificado

El sistema de envío de códigos de verificación no funciona porque las credenciales de email en el archivo `.env` son valores de ejemplo:

```
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_de_aplicacion
```

## ✅ Solución

### 1. Configurar Gmail con Contraseña de Aplicación

1. **Activar verificación en 2 pasos** en tu cuenta de Gmail
2. **Generar una contraseña de aplicación**:
   - Ve a [myaccount.google.com](https://myaccount.google.com)
   - Seguridad → Verificación en 2 pasos
   - Contraseñas de aplicaciones
   - Genera una nueva contraseña para "Correo"
   - Copia la contraseña generada (16 caracteres)

### 2. Actualizar el archivo .env

Edita el archivo `backend/.env` y reemplaza:

```env
# ANTES (valores de ejemplo)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_de_aplicacion

# DESPUÉS (tus credenciales reales)
EMAIL_USER=tu_email_real@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

### 3. Verificar la Configuración

Después de actualizar las credenciales, reinicia el servidor:

```bash
cd backend
npm start
```

### 4. Probar el Envío

Intenta registrarte nuevamente. El código de verificación debería llegar inmediatamente.

## 🔍 Diagnóstico

Si el problema persiste, verifica:

1. **Credenciales correctas**: Usa tu email real y la contraseña de aplicación
2. **Verificación en 2 pasos activada**: Requerida para contraseñas de aplicación
3. **Sin espacios en la contraseña**: La contraseña de aplicación no debe tener espacios
4. **Logs del servidor**: Revisa `backend/logs/` para errores específicos

## 📧 Alternativas

Si Gmail no funciona, puedes usar otros proveedores:

### SendGrid

```env
EMAIL_SERVICE=sendgrid
EMAIL_USER=apikey
EMAIL_PASSWORD=tu_api_key_sendgrid
```

### Mailgun

```env
EMAIL_SERVICE=mailgun
EMAIL_USER=tu_dominio
EMAIL_PASSWORD=tu_api_key_mailgun
```

## 🚨 Importante

- **Nunca** uses tu contraseña normal de Gmail
- **Siempre** usa contraseñas de aplicación
- **Mantén** las credenciales seguras y no las compartas
- **Actualiza** las credenciales si cambias de cuenta

## 📞 Soporte

Si necesitas ayuda adicional, revisa:

- [Documentación de Nodemailer](https://nodemailer.com/about/)
- [Configuración de Gmail](https://support.google.com/mail/answer/185833)
