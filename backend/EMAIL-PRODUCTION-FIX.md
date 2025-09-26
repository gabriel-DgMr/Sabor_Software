# 🔧 Solución para Problemas de Email en Producción

## 🚨 Problema Identificado

Aunque las variables de entorno están configuradas correctamente en producción, el envío de códigos de verificación presenta demoras o no llega. Esto es común en aplicaciones de producción con Gmail.

## 🔍 Causas Posibles

### 1. **Límites de Gmail en Producción**

- **Límite diario**: 500 emails/día para cuentas personales
- **Límite por minuto**: 100 emails/minuto
- **Límite por hora**: 500 emails/hora
- **Spam detection**: Gmail puede marcar emails como spam en producción

### 2. **Configuración SMTP Incompleta**

- Falta configuración de TLS/SSL
- Timeout muy bajo
- Sin configuración de retry

### 3. **Problemas de Red en Railway**

- Firewall bloqueando puertos SMTP
- Latencia de red alta
- Timeouts de conexión

## ✅ Soluciones Implementadas

### 1. **Mejorar Configuración de Nodemailer**

```javascript
// Configuración mejorada para producción
const transporter = nodemailer.createTransporter({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 60000, // 60 segundos
  greetingTimeout: 30000, // 30 segundos
  socketTimeout: 60000, // 60 segundos
  pool: true, // Usar pool de conexiones
  maxConnections: 5, // Máximo 5 conexiones
  maxMessages: 100, // Máximo 100 mensajes por conexión
  rateDelta: 20000, // 20 segundos entre lotes
  rateLimit: 5, // Máximo 5 emails por lote
});
```

### 2. **Implementar Sistema de Reintentos**

```javascript
const sendWithRetry = async (mailOptions, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Email enviado exitosamente (intento ${attempt})`);
      return result;
    } catch (error) {
      console.error(`❌ Error en intento ${attempt}:`, error.message);

      if (attempt === maxRetries) {
        throw error;
      }

      // Esperar antes del siguiente intento
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
};
```

### 3. **Agregar Logging Detallado**

```javascript
const sendVerificationEmail = async (
  correo_usuario,
  nombre_usuario,
  codigo,
) => {
  try {
    console.log(
      `📧 [${new Date().toISOString()}] Iniciando envío a: ${correo_usuario}`,
    );

    const mailOptions = {
      from: `"Sabor App" <${config.email.user}>`,
      to: correo_usuario,
      subject: "Verifica tu cuenta - Sabor",
      html: `...`,
      // Agregar headers para evitar spam
      headers: {
        "X-Mailer": "Sabor App",
        "X-Priority": "3",
        "X-MSMail-Priority": "Normal",
      },
    };

    const result = await sendWithRetry(mailOptions);

    console.log(
      `✅ [${new Date().toISOString()}] Email enviado exitosamente:`,
      {
        to: correo_usuario,
        messageId: result.messageId,
        response: result.response,
      },
    );

    return result;
  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] Error enviando email:`, {
      to: correo_usuario,
      error: error.message,
      code: error.code,
      response: error.response,
    });
    throw error;
  }
};
```

## 🚀 Alternativas Recomendadas

### 1. **SendGrid (Recomendado para Producción)**

```javascript
// Instalar: npm install @sendgrid/mail
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmailWithSendGrid = async (to, subject, html) => {
  const msg = {
    to,
    from: "noreply@sabor.com", // Debe estar verificado en SendGrid
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log("✅ Email enviado con SendGrid");
  } catch (error) {
    console.error("❌ Error SendGrid:", error);
    throw error;
  }
};
```

### 2. **Mailgun**

```javascript
// Instalar: npm install mailgun-js
import mailgun from "mailgun-js";

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

const sendEmailWithMailgun = async (to, subject, html) => {
  const data = {
    from: "Sabor App <noreply@sabor.com>",
    to,
    subject,
    html,
  };

  try {
    const result = await mg.messages().send(data);
    console.log("✅ Email enviado con Mailgun:", result);
    return result;
  } catch (error) {
    console.error("❌ Error Mailgun:", error);
    throw error;
  }
};
```

## 🔧 Implementación Inmediata

### Paso 1: Actualizar Configuración de Email

```javascript
// backend/src/config/emailConfig.js
import nodemailer from "nodemailer";
import { config } from "./config.js";

export const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 20000,
    rateLimit: 5,
  });
};

export const sendWithRetry = async (
  transporter,
  mailOptions,
  maxRetries = 3,
) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Email enviado exitosamente (intento ${attempt})`);
      return result;
    } catch (error) {
      console.error(`❌ Error en intento ${attempt}:`, error.message);

      if (attempt === maxRetries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
};
```

### Paso 2: Actualizar Controlador de Autenticación

```javascript
// backend/src/controllers/authController.js
import {
  createEmailTransporter,
  sendWithRetry,
} from "../config/emailConfig.js";

const transporter = createEmailTransporter();

const sendVerificationEmail = async (
  correo_usuario,
  nombre_usuario,
  codigo,
) => {
  try {
    console.log(
      `📧 [${new Date().toISOString()}] Iniciando envío a: ${correo_usuario}`,
    );

    const mailOptions = {
      from: `"Sabor App" <${config.email.user}>`,
      to: correo_usuario,
      subject: "Verifica tu cuenta - Sabor",
      html: `...`, // Tu HTML actual
      headers: {
        "X-Mailer": "Sabor App",
        "X-Priority": "3",
        "X-MSMail-Priority": "Normal",
      },
    };

    const result = await sendWithRetry(transporter, mailOptions);

    console.log(
      `✅ [${new Date().toISOString()}] Email enviado exitosamente:`,
      {
        to: correo_usuario,
        messageId: result.messageId,
      },
    );

    return result;
  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] Error enviando email:`, {
      to: correo_usuario,
      error: error.message,
      code: error.code,
    });
    throw error;
  }
};
```

## 📊 Monitoreo y Diagnóstico

### 1. **Endpoint de Diagnóstico de Email**

```javascript
// backend/src/routes/healthRoutes.js
export const testEmail = async (req, res) => {
  try {
    const testTransporter = createEmailTransporter();

    // Verificar conexión
    await testTransporter.verify();

    // Enviar email de prueba
    const result = await testTransporter.sendMail({
      from: config.email.user,
      to: config.email.user, // Enviar a ti mismo
      subject: "Test Email - Sabor App",
      html: "<h1>Test de Email</h1><p>Si recibes este email, el sistema funciona correctamente.</p>",
    });

    res.json({
      status: "success",
      message: "Email de prueba enviado exitosamente",
      messageId: result.messageId,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error en el sistema de email",
      error: error.message,
    });
  }
};
```

### 2. **Variables de Entorno Adicionales**

```env
# Configuración de email mejorada
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password
EMAIL_FROM_NAME=Sabor App
EMAIL_RETRY_ATTEMPTS=3
EMAIL_RETRY_DELAY=1000
EMAIL_TIMEOUT=60000

# Para SendGrid (alternativa)
SENDGRID_API_KEY=tu_api_key_sendgrid
SENDGRID_FROM_EMAIL=noreply@sabor.com

# Para Mailgun (alternativa)
MAILGUN_API_KEY=tu_api_key_mailgun
MAILGUN_DOMAIN=tu_dominio_mailgun
```

## 🎯 Próximos Pasos

1. **Implementar la configuración mejorada** de Nodemailer
2. **Agregar sistema de reintentos** y logging detallado
3. **Probar el endpoint de diagnóstico** de email
4. **Considerar migrar a SendGrid** para producción
5. **Monitorear logs** para identificar patrones de error

## 📞 Soporte

Si el problema persiste:

1. Revisa los logs de Railway para errores específicos
2. Prueba el endpoint de diagnóstico de email
3. Considera migrar a un servicio profesional como SendGrid
4. Verifica que las credenciales de Gmail sean válidas

---

**Nota**: Gmail está diseñado para uso personal, no para aplicaciones de producción de alto volumen. Para aplicaciones comerciales, se recomienda usar servicios especializados como SendGrid, Mailgun o Amazon SES.
