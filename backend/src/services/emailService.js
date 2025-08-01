import nodemailer from "nodemailer";
import { createSecureLogger } from "../utils/logger.js";
import { secureConfig } from "../config/secureConfig.js";

const logger = createSecureLogger("emailService");

// ✅ MEJORADO: Servicio de email seguro
class EmailService {
  constructor() {
    this.transporter = null;
    this.isInitialized = false;
    this.initialize();
  }

  // ✅ MEJORADO: Inicializar transporter con validación
  async initialize() {
    try {
      this.transporter = nodemailer.createTransport({
        service: secureConfig.email.service,
        auth: {
          user: secureConfig.email.user,
          pass: secureConfig.email.password,
        },
        timeout: secureConfig.email.timeout,
        secure: secureConfig.email.secure,
        requireTLS: secureConfig.email.requireTLS,
      });

      // Verificar configuración
      await this.transporter.verify();
      this.isInitialized = true;

      logger.info("Servicio de email inicializado correctamente");
    } catch (error) {
      logger.error("Error inicializando servicio de email", {
        error: error.message,
      });
      logger.warn(
        "Servicio de email deshabilitado - la aplicación continuará funcionando",
      );
      this.isInitialized = false;
      // No lanzar error, permitir que la aplicación continúe
    }
  }

  // ✅ MEJORADO: Enviar email de contraseña temporal
  async sendTemporaryPasswordEmail(emailData) {
    try {
      if (!this.isInitialized) {
        throw new Error("Servicio de email no inicializado");
      }

      const {
        email,
        nombre,
        password,
        expiresIn = "24 horas",
        reason = "reserva",
      } = emailData;

      const subject = "Cuenta temporal creada - Restaurante Sabor";
      const html = this.generateTempPasswordTemplate({
        nombre,
        password,
        expiresIn,
        reason,
        email,
      });

      const mailOptions = {
        from: `"${process.env.APP_NAME || "Restaurante Sabor"}" <${secureConfig.email.from}>`,
        to: email,
        subject: subject,
        html: html,
        // ✅ MEJORADO: Headers adicionales de seguridad
        headers: {
          "X-Priority": "1",
          "X-MSMail-Priority": "High",
          Importance: "high",
          "X-Mailer": "Sabor-Auth-System",
        },
      };

      const result = await this.transporter.sendMail(mailOptions);

      logger.info("Email de contraseña temporal enviado exitosamente", {
        messageId: result.messageId,
        email: email.replace(/(.{3}).+(.{3}@.+)/, "$1***$2"), // Ocultar parte del email
        reason: reason,
      });

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      logger.error("Error enviando email de contraseña temporal", {
        error: error.message,
        email: emailData.email?.replace(/(.{3}).+(.{3}@.+)/, "$1***$2"),
      });

      throw new Error("Error al enviar notificación por email");
    }
  }

  // ✅ MEJORADO: Template HTML para contraseña temporal
  generateTempPasswordTemplate({ nombre, password, expiresIn, reason, email }) {
    const loginUrl = `${secureConfig.urls.frontend}/login`;
    const supportEmail = secureConfig.email.from;

    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cuenta Temporal - Restaurante Sabor</title>
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    background-color: #f4f4f4; 
                    margin: 0; 
                    padding: 20px; 
                }
                .container { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    background: white; 
                    border-radius: 10px; 
                    box-shadow: 0 0 20px rgba(0,0,0,0.1); 
                    overflow: hidden; 
                }
                .header { 
                    background: linear-gradient(135deg, #ff6f00, #ff8f00); 
                    color: white; 
                    padding: 30px; 
                    text-align: center; 
                }
                .header h1 { 
                    margin: 0; 
                    font-size: 28px; 
                    font-weight: 300; 
                }
                .content { 
                    padding: 30px; 
                }
                .alert { 
                    background-color: #fff3cd; 
                    border: 1px solid #ffeaa7; 
                    color: #856404; 
                    padding: 15px; 
                    border-radius: 5px; 
                    margin: 20px 0; 
                }
                .alert.critical {
                    background-color: #f8d7da;
                    border-color: #f5c6cb;
                    color: #721c24;
                }
                .password-box { 
                    background-color: #f8f9fa; 
                    border: 2px solid #ff6f00; 
                    border-radius: 10px; 
                    padding: 20px; 
                    text-align: center; 
                    margin: 25px 0; 
                }
                .password { 
                    font-family: 'Courier New', monospace; 
                    font-size: 18px; 
                    font-weight: bold; 
                    color: #ff6f00; 
                    letter-spacing: 2px; 
                    margin: 10px 0; 
                    padding: 10px; 
                    background: white; 
                    border-radius: 5px; 
                    border: 1px solid #ddd;
                    word-break: break-all;
                }
                .button { 
                    display: inline-block; 
                    background: linear-gradient(135deg, #ff6f00, #ff8f00); 
                    color: white; 
                    padding: 12px 30px; 
                    text-decoration: none; 
                    border-radius: 25px; 
                    margin: 20px 0; 
                    font-weight: bold; 
                    text-align: center;
                }
                .footer { 
                    background-color: #f8f9fa; 
                    padding: 20px; 
                    text-align: center; 
                    font-size: 12px; 
                    color: #6c757d; 
                }
                .security-tips {
                    background-color: #e7f3ff;
                    border-left: 4px solid #2196F3;
                    padding: 15px;
                    margin: 20px 0;
                }
                .security-tips h4 {
                    margin-top: 0;
                    color: #1976D2;
                }
                .steps {
                    background-color: #f8f9fa;
                    padding: 20px;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .steps ol {
                    margin: 0;
                    padding-left: 20px;
                }
                .steps li {
                    margin: 10px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🍽️ Restaurante Sabor</h1>
                    <p>Cuenta temporal creada</p>
                </div>
                
                <div class="content">
                    <h2>¡Hola ${nombre}!</h2>
                    <p>Hemos creado una cuenta temporal para ti debido a tu ${reason === "reserva" ? "reservación" : "solicitud"}.</p>
                    
                    <div class="alert critical">
                        <strong>⚠️ IMPORTANTE:</strong> Esta es una contraseña temporal que debes cambiar en tu primer inicio de sesión.
                    </div>
                    
                    <div class="password-box">
                        <h3 style="margin-top: 0; color: #333;">Tu contraseña temporal es:</h3>
                        <div class="password">${password}</div>
                        <p style="margin-bottom: 0; font-size: 14px; color: #666;">
                            ⏰ Expira en: <strong>${expiresIn}</strong>
                        </p>
                    </div>
                    
                    <div class="steps">
                        <h4>📝 Pasos para activar tu cuenta:</h4>
                        <ol>
                            <li><strong>Inicia sesión</strong> con tu email y esta contraseña temporal</li>
                            <li><strong>Verifica tu email</strong> con el código que recibirás</li>
                            <li><strong>Cambia tu contraseña</strong> por una personal y segura</li>
                            <li><strong>¡Disfruta</strong> de todos nuestros servicios!</li>
                        </ol>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="${loginUrl}" class="button">🔐 Iniciar Sesión Ahora</a>
                    </div>
                    
                    <div class="security-tips">
                        <h4>🔒 Consejos de Seguridad</h4>
                        <ul>
                            <li>No compartas esta contraseña con nadie</li>
                            <li>Cámbiala inmediatamente al iniciar sesión</li>
                            <li>Usa una contraseña fuerte y única</li>
                            <li>Si no solicitaste esta cuenta, contacta con nosotros</li>
                        </ul>
                    </div>
                    
                    <div class="alert">
                        <strong>📧 Tu email:</strong> ${email}<br>
                        <strong>🕒 Creada:</strong> ${new Date().toLocaleString("es-ES")}<br>
                        <strong>📱 Motivo:</strong> ${reason === "reserva" ? "Reservación de mesa" : "Registro de usuario"}
                    </div>
                </div>
                
                <div class="footer">
                    <p><strong>Restaurante Sabor</strong></p>
                    <p>Si tienes problemas o preguntas, contacta con nosotros en:</p>
                    <p>📧 ${supportEmail} | 📞 +57 (1) 234-5678</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
                    <p style="font-size: 11px;">
                        Este email fue enviado automáticamente. No respondas a este mensaje.<br>
                        Por tu seguridad, este email se autodestruirá en 48 horas.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
  }

  // ✅ MEJORADO: Enviar email de verificación mejorado
  async sendVerificationEmail(emailData) {
    try {
      if (!this.isInitialized) {
        throw new Error("Servicio de email no inicializado");
      }

      const { email, nombre, codigo } = emailData;

      const subject = "Verifica tu cuenta - Restaurante Sabor";
      const html = this.generateVerificationTemplate({ nombre, codigo });

      const mailOptions = {
        from: `"${process.env.APP_NAME || "Restaurante Sabor"}" <${secureConfig.email.from}>`,
        to: email,
        subject: subject,
        html: html,
        headers: {
          "X-Priority": "1",
          "X-MSMail-Priority": "High",
          Importance: "high",
          "X-Mailer": "Sabor-Auth-System",
        },
      };

      const result = await this.transporter.sendMail(mailOptions);

      logger.info("Email de verificación enviado exitosamente", {
        messageId: result.messageId,
        email: email.replace(/(.{3}).+(.{3}@.+)/, "$1***$2"),
      });

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      logger.error("Error enviando email de verificación", {
        error: error.message,
        email: emailData.email?.replace(/(.{3}).+(.{3}@.+)/, "$1***$2"),
      });

      throw new Error("Error al enviar email de verificación");
    }
  }

  // ✅ MEJORADO: Template de verificación mejorado
  generateVerificationTemplate({ nombre, codigo }) {
    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verificar Cuenta - Restaurante Sabor</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 0 15px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #ff6f00, #ff8f00); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { padding: 30px; }
                .code-box { background-color: #f8f9fa; border: 2px solid #ff6f00; border-radius: 10px; padding: 20px; text-align: center; margin: 25px 0; }
                .code { font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; color: #ff6f00; letter-spacing: 8px; margin: 15px 0; }
                .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🍽️ Restaurante Sabor</h1>
                    <p>Verificación de Cuenta</p>
                </div>
                <div class="content">
                    <h2>¡Hola ${nombre}!</h2>
                    <p>Gracias por registrarte en Sabor. Para completar la verificación de tu cuenta, usa el siguiente código:</p>
                    <div class="code-box">
                        <h3 style="margin-top: 0;">Tu código de verificación es:</h3>
                        <div class="code">${codigo}</div>
                        <p style="margin-bottom: 0; color: #666;">Este código expira en 15 minutos</p>
                    </div>
                    <p>Si no solicitaste este registro, puedes ignorar este email.</p>
                </div>
                <div class="footer">
                    <p><strong>Restaurante Sabor</strong></p>
                    <p>El equipo de Sabor</p>
                </div>
            </div>
        </body>
        </html>
        `;
  }

  // ✅ MEJORADO: Verificar estado del servicio
  async healthCheck() {
    try {
      if (!this.isInitialized) {
        return { status: "error", message: "Servicio no inicializado" };
      }

      await this.transporter.verify();
      return {
        status: "ok",
        message: "Servicio de email funcionando correctamente",
      };
    } catch (error) {
      logger.error("Health check falló", { error: error.message });
      return { status: "error", message: "Error en el servicio de email" };
    }
  }
}

// ✅ MEJORADO: Instancia singleton
const emailService = new EmailService();

export default emailService;

// ✅ MEJORADO: Funciones de conveniencia
export const sendTemporaryPasswordEmail = (emailData) => {
  return emailService.sendTemporaryPasswordEmail(emailData);
};

export const sendVerificationEmail = (emailData) => {
  return emailService.sendVerificationEmail(emailData);
};

export const checkEmailServiceHealth = () => {
  return emailService.healthCheck();
};
