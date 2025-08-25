import * as authModel from "../models/authModel.js";
import jwt from "jsonwebtoken";
import validator from "validator";
import { config } from "../config/config.js";
import nodemailer from "nodemailer";

// Configurar el transporter de nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

// Función para enviar email de verificación
const sendVerificationEmail = async (
  correo_usuario,
  nombre_usuario,
  codigo,
) => {
  const mailOptions = {
    from: config.email.user,
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
  };

  await transporter.sendMail(mailOptions);
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
    await sendVerificationEmail(correo_usuario, nombre_usuario, codigo);

    res.status(201).json({
      message:
        "usuario registrado exitosamente. Por favor, verifica tu email para activar tu cuenta.",
      userId,
      requiresVerification: true,
    });
  } catch (error) {
    console.error("Error en registro:", error);
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
        rol: user.rol || "user",
        nombre: user.nombre_usuario,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn },
    );

    // Configurar cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    });

    res.json({
      message: "Login exitoso",
      user,
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
    const user = await authModel.getUserByEmail(req.user.email);

    if (!user) {
      return res.status(404).json({
        message: "usuario no encontrado",
      });
    }

    res.json({ user });
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
