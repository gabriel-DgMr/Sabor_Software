import { config } from "./config.js";

/**
 * Cliente simple de Brevo usando fetch
 * Más confiable y directo que el SDK
 */
export const createEmailTransporter = () => {
  // Retornar objeto con método sendTransacEmail
  return {
    async sendTransacEmail(emailData) {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "api-key": config.email.password,
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    },
  };
};

/**
 * Función para determinar si un error es recuperable
 * Adaptada para Brevo API
 */
export const shouldRetryError = (error) => {
  const retryableErrors = [
    "TIMEOUT", // Timeout de conexión
    "NETWORK_ERROR", // Error de red
    "RATE_LIMIT", // Límite de velocidad
    "SERVER_ERROR", // Error del servidor
    "SERVICE_UNAVAILABLE", // Servicio no disponible
  ];

  const nonRetryableErrors = [
    "UNAUTHORIZED", // Error de autenticación
    "FORBIDDEN", // Acceso denegado
    "BAD_REQUEST", // Solicitud malformada
    "NOT_API_KEY", // API key inválida
    "INVALID_EMAIL", // Email inválido
  ];

  // Si es un error de autenticación o datos, no reintentar
  if (nonRetryableErrors.some((code) => error.message?.includes(code))) {
    return false;
  }

  // Si es un error de red o servidor, reintentar
  if (retryableErrors.some((code) => error.message?.includes(code))) {
    return true;
  }

  // Para errores HTTP, solo reintentar 5xx
  if (error.status >= 500) {
    return true;
  }

  // Por defecto, no reintentar para errores 4xx
  return false;
};

/**
 * Envía un email con sistema de reintentos inteligente usando Brevo
 */
export const sendWithRetry = async (
  transporter,
  mailOptions,
  maxRetries = 3,
) => {
  console.log(
    `📧 [${new Date().toISOString()}] ===== INICIANDO ENVÍO DE EMAIL CON BREVO =====`,
  );
  console.log(`📧 Destinatario: ${mailOptions.to}`);
  console.log(`📧 Asunto: ${mailOptions.subject}`);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `📧 [${new Date().toISOString()}] Intento ${attempt}/${maxRetries} - Enviando email con Brevo...`,
      );

      // Crear el objeto de email para Brevo
      const emailData = {
        subject: mailOptions.subject,
        htmlContent: mailOptions.html,
        sender: { email: config.email.user },
        to: [{ email: mailOptions.to }],
      };

      // Enviar email usando Brevo API
      const result = await transporter.sendTransacEmail(emailData);

      console.log(
        `✅ [${new Date().toISOString()}] Email enviado exitosamente con Brevo (intento ${attempt})`,
      );
      console.log(`📧 Message ID: ${result.messageId || "N/A"}`);
      return result;
    } catch (error) {
      console.error(
        `❌ [${new Date().toISOString()}] Error en intento ${attempt}:`,
        {
          message: error.message,
          status: error.status,
          stack: error.stack,
        },
      );

      // Si es el último intento, lanzar error
      if (attempt === maxRetries) {
        console.error(
          `❌ [${new Date().toISOString()}] Todos los intentos fallaron. Error final:`,
          error.message,
        );
        throw error;
      }

      // Determinar si vale la pena reintentar basado en el tipo de error
      if (!shouldRetryError(error)) {
        console.error(
          `❌ [${new Date().toISOString()}] Error no recuperable, no reintentando:`,
          error.message,
        );
        throw error;
      }

      // Calcular delay progresivo
      const baseDelay = 2000; // 2 segundos base
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 10000); // Max 10 segundos

      console.log(
        `⏳ [${new Date().toISOString()}] Esperando ${delay}ms antes del siguiente intento...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

/**
 * Crea opciones de email estándar para la aplicación
 * Adaptado para Brevo
 */
export const createMailOptions = (to, subject, html, from = null) => {
  return {
    from: from || config.email.user,
    to,
    subject,
    html,
  };
};
