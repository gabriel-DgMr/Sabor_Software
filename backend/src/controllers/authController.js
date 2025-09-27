import * as authModel from "../models/authModel.js";
import jwt from "jsonwebtoken";
import validator from "validator";
import { config } from "../config/config.js";
import {
  createEmailTransporter,
  sendWithRetry,
  createMailOptions,
  shouldRetryError,
} from "../config/emailConfig.js";

// Usar la configuración centralizada de email optimizada para Railway
const transporter = createEmailTransporter();

// Las funciones sendWithRetry y shouldRetryError se importan desde emailConfig.js

// Función para enviar email de verificación
const sendVerificationEmail = async (
  correo_usuario,
  nombre_usuario,
  codigo,
) => {
  try {
    console.log(
      `📧 [${new Date().toISOString()}] ===== INICIANDO ENVÍO DE EMAIL DE VERIFICACIÓN =====`,
    );
    console.log(`📧 Destinatario: ${correo_usuario}`);
    console.log(`📧 Nombre usuario: ${nombre_usuario}`);
    console.log(`📧 Código de verificación: ${codigo}`);
    console.log(`📧 Configuración email user: ${config.email.user}`);
    console.log(
      `📧 Configuración email password: ${config.email.password ? "***CONFIGURADO***" : "NO CONFIGURADO"}`,
    );
    console.log(`📧 NODE_ENV: ${process.env.NODE_ENV}`);

    // Validar configuración de email
    if (!config.email.user || !config.email.password) {
      console.error(
        `❌ [${new Date().toISOString()}] ERROR: Configuración de email incompleta`,
      );
      console.error(`❌ EMAIL_USER: ${config.email.user || "NO CONFIGURADO"}`);
      console.error(
        `❌ EMAIL_PASSWORD: ${config.email.password ? "CONFIGURADO" : "NO CONFIGURADO"}`,
      );
      throw new Error("Configuración de email no encontrada");
    }

    // Validar formato de email
    if (!correo_usuario || typeof correo_usuario !== "string") {
      console.error(
        `❌ [${new Date().toISOString()}] ERROR: Email destinatario inválido:`,
        correo_usuario,
      );
      throw new Error("Email destinatario inválido");
    }

    console.log(
      `✅ [${new Date().toISOString()}] Validaciones de configuración exitosas`,
    );

    const mailOptions = {
      from: `"Sabor App" <${config.email.user}>`,
      to: correo_usuario,
      subject: "Verifica tu cuenta - Sabor",
      html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #ff6f00;">¡Bienvenido a Sabor!</h2>
                  <p>Hola <strong>${nombre_usuario}</strong>,</p>
                  <p>Gracias por registrarte en Sabor. Para activar tu cuenta, necesitas verificar tu dirección de email.</p>
                  
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                      <h3 style="color: #333; margin: 0;">Tu código de verificación es:</h3>
                      <div style="font-size: 32px; font-weight: bold; color: #ff6f00; letter-spacing: 5px; margin: 15px 0;">
                          ${codigo}
                      </div>
                      <p style="color: #666; margin: 0;">Este código expira en 15 minutos</p>
                  </div>
                  
                  <p>Si no solicitaste este registro, puedes ignorar este email.</p>
                  
                  <p style="color: #666; font-size: 14px;">
                      Saludos,<br>
                      El equipo de Sabor
                  </p>
              </div>
          `,
      headers: {
        "X-Mailer": "Sabor App",
        "X-Priority": "3",
        "X-MSMail-Priority": "Normal",
      },
    };

    console.log(
      `📧 [${new Date().toISOString()}] Preparando envío con sendWithRetry...`,
    );
    const result = await sendWithRetry(transporter, mailOptions, 5);

    console.log(
      `✅ [${new Date().toISOString()}] ===== EMAIL ENVIADO EXITOSAMENTE =====`,
    );
    console.log(`📧 Destinatario: ${correo_usuario}`);
    console.log(`📧 Message ID: ${result.messageId}`);
    console.log(`📧 Response: ${result.response}`);
    console.log(`📧 Accepted: ${result.accepted}`);
    console.log(`📧 Rejected: ${result.rejected}`);
    console.log(`📧 Pending: ${result.pending}`);

    return result;
  } catch (error) {
    console.error(
      `❌ [${new Date().toISOString()}] ===== ERROR ENVIANDO EMAIL =====`,
    );
    console.error(`❌ Destinatario: ${correo_usuario}`);
    console.error(`❌ Error message: ${error.message}`);
    console.error(`❌ Error code: ${error.code}`);
    console.error(`❌ Error command: ${error.command}`);
    console.error(`❌ Error response: ${error.response}`);
    console.error(`❌ Error errno: ${error.errno}`);
    console.error(`❌ Error syscall: ${error.syscall}`);
    console.error(`❌ Error hostname: ${error.hostname}`);
    console.error(`❌ Error port: ${error.port}`);
    console.error(`❌ Stack trace:`, error.stack);

    // Información adicional para diagnóstico
    console.error(`❌ [${new Date().toISOString()}] Información del entorno:`);
    console.error(`❌ NODE_ENV: ${process.env.NODE_ENV}`);
    console.error(`❌ EMAIL_USER configurado: ${!!config.email.user}`);
    console.error(`❌ EMAIL_PASSWORD configurado: ${!!config.email.password}`);
    console.error(`❌ Transporter configurado: ${!!transporter}`);

    throw error;
  }
};

// controlador para registrar un nuevo usuario
export const registerUser = async (req, res) => {
  try {
    const {
      nombre_usuario,
      correo_usuario,
      telefono_usuario,
      contraseña_usuario,
    } = req.body;

    // Validar campos requeridos
    if (
      !nombre_usuario ||
      !correo_usuario ||
      !telefono_usuario ||
      !contraseña_usuario
    ) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios",
      });
    }

    // Validar correo
    if (!validator.isEmail(correo_usuario)) {
      return res.status(400).json({
        message: "Correo no válido",
      });
    }

    // Validar teléfono (10 dígitos)
    if (!validator.matches(telefono_usuario, /^\d{10}$/)) {
      return res.status(400).json({
        message: "El teléfono debe tener 10 dígitos",
      });
    }

    // Validar contraseña
    if (
      !validator.isStrongPassword(contraseña_usuario, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      return res.status(400).json({
        message:
          "La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos",
      });
    }

    // Registrar usuario (ahora con activo = false)
    const userId = await authModel.registerUser({
      nombre_usuario,
      correo_usuario,
      telefono_usuario,
      contraseña_usuario,
    });

    // Generar código de verificación
    const codigo = await authModel.generateVerificationCode(userId);

    // Enviar email de verificación
    console.log(
      `📧 [${new Date().toISOString()}] ===== INICIANDO ENVÍO DE EMAIL DESPUÉS DEL REGISTRO =====`,
    );
    console.log(`📧 Usuario ID: ${userId}`);
    console.log(`📧 Código generado: ${codigo}`);

    try {
      await sendVerificationEmail(correo_usuario, nombre_usuario, codigo);
      console.log(
        `✅ [${new Date().toISOString()}] Usuario ${nombre_usuario} registrado exitosamente y email enviado`,
      );
    } catch (emailError) {
      console.error(
        `❌ [${new Date().toISOString()}] ERROR ENVIANDO EMAIL DE VERIFICACIÓN:`,
        {
          usuario: nombre_usuario,
          email: correo_usuario,
          userId: userId,
          codigo: codigo,
          error: emailError.message,
          stack: emailError.stack,
        },
      );

      // No fallar el registro si el email falla, pero logear el error detallado
      // El usuario puede solicitar reenvío de código después
      console.log(
        `⚠️ [${new Date().toISOString()}] El usuario fue registrado pero el email no se pudo enviar`,
      );
    }

    res.status(201).json({
      message:
        "usuario registrado exitosamente. Por favor, verifica tu email para activar tu cuenta.",
      userId,
      requiresVerification: true,
    });
  } catch (error) {
    console.error("Error en registro:", error);

    // Manejar errores específicos
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "El correo electrónico ya está registrado",
      });
    }

    if (error.message.includes("email")) {
      return res.status(500).json({
        message: "Error en el servicio de email. Por favor, intenta más tarde.",
      });
    }

    res.status(400).json({
      message: error.message || "Error al registrar usuario",
    });
  }
};

// Controlador para reenviar código de verificación
export const resendVerificationCode = async (req, res) => {
  try {
    const { correo_usuario } = req.body;

    if (!correo_usuario || !validator.isEmail(correo_usuario)) {
      return res.status(400).json({
        message: "Email válido requerido",
      });
    }

    // Buscar usuario (incluyendo no verificados)
    const user =
      await authModel.getUserByEmailIncludingUnverified(correo_usuario);

    if (!user) {
      return res.status(404).json({
        message: "usuario no encontrado",
      });
    }

    if (user.email_verificado) {
      return res.status(400).json({
        message: "El email ya está verificado",
      });
    }

    // Generar nuevo código
    const codigo = await authModel.generateVerificationCode(user.id_usuario);

    // Enviar email
    await sendVerificationEmail(
      user.correo_usuario,
      user.nombre_usuario,
      codigo,
    );

    res.json({
      message: "Código de verificación reenviado exitosamente",
    });
  } catch (error) {
    console.error("Error al reenviar código:", error);
    res.status(500).json({
      message: "Error al reenviar código de verificación",
    });
  }
};

// Controlador para verificar código
export const verifyEmailCode = async (req, res) => {
  try {
    const { correo_usuario, codigo } = req.body;

    if (!correo_usuario || !codigo) {
      return res.status(400).json({
        message: "El código es requerido",
      });
    }

    // Buscar usuario
    const user =
      await authModel.getUserByEmailIncludingUnverified(correo_usuario);

    if (!user) {
      return res.status(404).json({
        message: "usuario no encontrado",
      });
    }

    if (user.email_verificado) {
      return res.status(400).json({
        message: "El email ya está verificado",
      });
    }

    // Verificar código
    const isValid = await authModel.verifyCode(user.id_usuario, codigo);

    if (!isValid) {
      return res.status(400).json({
        message: "Código inválido o expirado",
      });
    }

    res.json({
      message: "Email verificado exitosamente. Tu cuenta ha sido activada.",
      success: true,
    });
  } catch (error) {
    console.error("Error al verificar código:", error);
    res.status(500).json({
      message: "Error al verificar código",
    });
  }
};

// Inicio de sesion
export const loginUser = async (req, res) => {
  try {
    const { correo_usuario, contraseña_usuario } = req.body;

    // Validar campos requeridos
    if (!correo_usuario || !contraseña_usuario) {
      return res.status(400).json({
        message: "Email y contraseña son requeridos",
      });
    }

    // Validar correo
    if (!validator.isEmail(correo_usuario)) {
      return res.status(400).json({
        message: "Correo no válido",
      });
    }

    // Autenticar usuario
    const user = await authModel.loginUser(correo_usuario, contraseña_usuario);

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.id_usuario,
        email: user.correo_usuario,
        rol: user.nombre_rol || "Usuario",
        nombre: user.nombre_usuario,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn },
    );

    // Construir URL completa de la imagen si existe
    let imagenUrl = null;
    if (user.imagen_usuario) {
      const baseUrl =
        process.env.NODE_ENV === "production"
          ? "https://sabor-production.up.railway.app"
          : "http://localhost:3000";
      imagenUrl = `${baseUrl}/api/auth/imagen-perfil/${user.imagen_usuario}`;
    }

    const userWithImageUrl = {
      ...user,
      imagen_usuario: imagenUrl,
    };

    // Configurar cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    });

    res.json({
      message: "Login exitoso",
      user: userWithImageUrl,
      token,
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(401).json({
      message: error.message || "Error al iniciar sesión",
    });
  }
};

// Controlador para cerrar sesión
export const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Sesión cerrada exitosamente" });
};

// Controlador para obtener perfil de usuario
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Corregido: usar 'id' en vez de 'userId'
    console.log("🔍 Obteniendo perfil para usuario:", req.user.email);

    const user = await authModel.getUserByEmail(req.user.email);

    if (!user) {
      console.log("❌ Usuario no encontrado:", req.user.email);
      return res.status(404).json({
        message: "usuario no encontrado",
      });
    }

    // Construir URL completa de la imagen si existe
    let imagenUrl = null;
    if (user.imagen_usuario) {
      const baseUrl =
        process.env.NODE_ENV === "production"
          ? "https://sabor-production.up.railway.app"
          : "http://localhost:3000";
      imagenUrl = `${baseUrl}/api/auth/imagen-perfil/${user.imagen_usuario}`;
    }

    const userWithImageUrl = {
      ...user,
      imagen_usuario: imagenUrl,
    };

    console.log("✅ Usuario encontrado:", {
      id: user.id_usuario,
      nombre: user.nombre_usuario,
      imagen: user.imagen_usuario || "sin imagen",
      imagenUrl: imagenUrl || "sin URL",
    });

    res.json({ user: userWithImageUrl });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({
      message: "Error al obtener perfil de usuario",
    });
  }
};

// Verificar token y obtener perfil
export const verifyToken = async (req, res) => {
  try {
    const user = await authModel.getUserByEmail(req.user.email);

    if (!user) {
      return res.status(404).json({
        message: "usuario no encontrado",
      });
    }

    // No devolver la contraseña
    const { contraseña_usuario, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Error al verificar token:", error);
    res.status(500).json({
      message: "Error al verificar la sesión",
    });
  }
};

// Solicitar recuperación de contraseña
export const forgotPassword = async (req, res) => {
  try {
    const { correo_usuario } = req.body;

    // Validar correo
    if (!correo_usuario || !validator.isEmail(correo_usuario)) {
      return res.status(400).json({
        message: "Correo electrónico no válido",
      });
    }

    // Generar token de recuperación
    const { resetToken, user } =
      await authModel.generatePasswordResetToken(correo_usuario);

    // Crear URL de recuperación
    const resetUrl = `${config.frontendUrl}/reset-password/${resetToken}`;

    // Enviar correo electrónico
    const mailOptions = {
      from: config.email.user,
      to: user.correo_usuario,
      subject: "Recuperación de Contraseña - Sabor",
      html: `
                <h1>Recuperación de Contraseña</h1>
                <p>Hola ${user.nombre_usuario},</p>
                <p>Has solicitado recuperar tu contraseña. Haz clic en el siguiente enlace para restablecerla:</p>
                <a href="${resetUrl}">Restablecer Contraseña</a>
                <p>Este enlace expirará en 1 hora.</p>
                <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
                <p>Saludos,<br>El equipo de SABOR</p>
            `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      message:
        "Se ha enviado un correo con las instrucciones para recuperar tu contraseña",
    });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    // No revelar si el correo existe o no por seguridad
    res.json({
      message:
        "Si el correo existe en nuestra base de datos, recibirás las instrucciones para recuperar tu contraseña",
    });
  }
};

// Verificar token de recuperación
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await authModel.verifyResetToken(token);

    if (!user) {
      return res.status(400).json({
        message: "Token inválido o expirado",
      });
    }

    res.json({
      message: "Token válido",
      email: user.correo_usuario,
    });
  } catch (error) {
    console.error("Error en verifyResetToken:", error);
    res.status(500).json({
      message: "Error al verificar el token",
    });
  }
};

// Restablecer contraseña
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { contraseña_usuario } = req.body;

    // Validar contraseña
    if (
      !validator.isStrongPassword(contraseña_usuario, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      return res.status(400).json({
        message:
          "La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos",
      });
    }

    // Verificar token
    const user = await authModel.verifyResetToken(token);
    if (!user) {
      return res.status(400).json({
        message: "Token inválido o expirado",
      });
    }

    // Actualizar contraseña
    const success = await authModel.updatePassword(
      user.id_usuario,
      contraseña_usuario,
    );
    if (!success) {
      throw new Error("Error al actualizar la contraseña");
    }

    res.json({
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error en resetPassword:", error);
    res.status(500).json({
      message: "Error al restablecer la contraseña",
    });
  }
};
