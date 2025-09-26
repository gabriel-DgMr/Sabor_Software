import nodemailer from "nodemailer";
import { config } from "./config.js";

// Crea un transporter de nodemailer con configuración robusta para producción
export const createEmailTransporter = () => {
  const service = process.env.EMAIL_SERVICE || "gmail";

  const baseOptions = {
    service,
    host: service === "gmail" ? "smtp.gmail.com" : undefined,
    port: service === "gmail" ? 587 : undefined,
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
  };

  return nodemailer.createTransport(baseOptions);
};

// Enviar con reintentos y logs
export const sendWithRetry = async (
  transporter,
  mailOptions,
  maxRetries = 3,
) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Email enviado (intento ${attempt})`, {
        to: mailOptions.to,
        subject: mailOptions.subject,
        messageId: result?.messageId,
      });
      return result;
    } catch (error) {
      console.error(`❌ Error de email (intento ${attempt})`, {
        to: mailOptions.to,
        subject: mailOptions.subject,
        code: error?.code,
        response: error?.response,
        message: error?.message,
      });
      if (attempt === maxRetries) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
};

export const verifyEmailTransport = async () => {
  const transporter = createEmailTransporter();
  if (!config.email.user || !config.email.password) {
    throw new Error(
      "Configuración de email incompleta (EMAIL_USER/EMAIL_PASSWORD)",
    );
  }
  await transporter.verify();
  return true;
};
