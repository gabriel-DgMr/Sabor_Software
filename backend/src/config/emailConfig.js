import nodemailer from "nodemailer";
import { config } from "./config.js";

/**
 * Crea un transporter de nodemailer configurado para producción
 * con configuraciones optimizadas para Railway y Gmail
 */
export const createEmailTransporter = () => {
  return nodemailer.createTransport({
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
      ciphers: "SSLv3",
      secureProtocol: "TLSv1_2_method",
    },
    connectionTimeout: 30000, // 30 segundos (reducido para Railway)
    greetingTimeout: 15000, // 15 segundos (reducido)
    socketTimeout: 30000, // 30 segundos (reducido)
    pool: false, // Desactivar pool para evitar problemas de conexión persistente
    maxConnections: 1, // Una sola conexión
    maxMessages: 1, // Un mensaje por conexión
    rateDelta: 1000, // 1 segundo entre intentos
    rateLimit: 1, // Un email por vez
    // Configuraciones adicionales para Railway
    ignoreTLS: false,
    requireTLS: true,
    debug: process.env.NODE_ENV === "development", // Solo debug en desarrollo
    logger: process.env.NODE_ENV === "development",
  });
};

/**
 * Función para determinar si un error es recuperable
 */
export const shouldRetryError = (error) => {
  const retryableErrors = [
    "ETIMEDOUT", // Timeout de conexión
    "ECONNRESET", // Conexión reseteada
    "ECONNREFUSED", // Conexión rechazada
    "ENOTFOUND", // Host no encontrado
    "EAI_AGAIN", // Error de DNS temporal
    "ESOCKETTIMEDOUT", // Timeout de socket
    "CONN", // Error de conexión SMTP
    "TIMEOUT", // Timeout general
  ];

  const nonRetryableErrors = [
    "EAUTH", // Error de autenticación
    "EMESSAGE", // Error de mensaje
    "EENVELOPE", // Error de envelope
  ];

  // Si es un error de autenticación, no reintentar
  if (
    nonRetryableErrors.some(
      (code) => error.code === code || error.message?.includes(code),
    )
  ) {
    return false;
  }

  // Si es un error de timeout o conexión, reintentar
  if (
    retryableErrors.some(
      (code) => error.code === code || error.message?.includes(code),
    )
  ) {
    return true;
  }

  // Por defecto, reintentar para errores desconocidos
  return true;
};

/**
 * Envía un email con sistema de reintentos inteligente
 */
export const sendWithRetry = async (
  transporter,
  mailOptions,
  maxRetries = 5,
) => {
  console.log(
    `📧 [${new Date().toISOString()}] Iniciando envío de email con ${maxRetries} reintentos`,
  );
  console.log(`📧 Destinatario: ${mailOptions.to}`);
  console.log(`📧 Asunto: ${mailOptions.subject}`);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `📧 [${new Date().toISOString()}] Intento ${attempt}/${maxRetries} - Enviando email...`,
      );

      // Solo verificar conexión en el primer intento para evitar delays adicionales
      if (attempt === 1) {
        console.log(
          `📧 [${new Date().toISOString()}] Verificando conexión SMTP...`,
        );
        try {
          await transporter.verify();
          console.log(
            `✅ [${new Date().toISOString()}] Conexión SMTP verificada exitosamente`,
          );
        } catch (verifyError) {
          console.log(
            `⚠️ [${new Date().toISOString()}] Verificación falló, continuando con envío directo:`,
            verifyError.message,
          );
          // Continuar con el envío aunque la verificación falle
        }
      }

      const result = await transporter.sendMail(mailOptions);
      console.log(
        `✅ [${new Date().toISOString()}] Email enviado exitosamente (intento ${attempt})`,
      );
      console.log(`📧 Message ID: ${result.messageId}`);
      console.log(`📧 Response: ${result.response}`);
      return result;
    } catch (error) {
      console.error(
        `❌ [${new Date().toISOString()}] Error en intento ${attempt}:`,
        {
          message: error.message,
          code: error.code,
          command: error.command,
          response: error.response,
          errno: error.errno,
          syscall: error.syscall,
          hostname: error.hostname,
          port: error.port,
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

      // Calcular delay progresivo más agresivo para Railway
      const baseDelay = error.code === "ETIMEDOUT" ? 5000 : 2000; // Delay más largo para timeouts
      const delay = Math.min(baseDelay * Math.pow(1.5, attempt - 1), 15000); // Max 15 segundos

      console.log(
        `⏳ [${new Date().toISOString()}] Esperando ${delay}ms antes del siguiente intento...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

/**
 * Crea opciones de email estándar para la aplicación
 */
export const createMailOptions = (to, subject, html, from = null) => {
  return {
    from: from || `"Sabor App" <${config.email.user}>`,
    to,
    subject,
    html,
    headers: {
      "X-Mailer": "Sabor App",
      "X-Priority": "3",
      "X-MSMail-Priority": "Normal",
    },
  };
};
