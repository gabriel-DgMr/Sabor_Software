import * as userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import validator from "validator";
import { passwordStrength } from "check-password-strength";
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
const sendVerificationEmail = async (email, nombre, codigo) => {
  const mailOptions = {
    from: config.email.user,
    to: email,
    subject: "Verifica tu cuenta - Sabor",
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ff6f00;">¡Bienvenido a Sabor!</h2>
                <p>Hola <strong>${nombre}</strong>,</p>
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

// Función helper para validar fortaleza de contraseña
const validatePasswordStrength = (password) => {
  const result = passwordStrength(password);

  // Configuración mínima requerida
  const minRequiredStrength = 2; // 0: Too weak, 1: Weak, 2: Medium, 3: Strong

  if (result.id < minRequiredStrength) {
    const suggestions = [];

    if (password.length < 8) {
      suggestions.push("debe tener al menos 8 caracteres");
    }
    if (!/[a-z]/.test(password)) {
      suggestions.push("debe incluir al menos una letra minúscula");
    }
    if (!/[A-Z]/.test(password)) {
      suggestions.push("debe incluir al menos una letra mayúscula");
    }
    if (!/\d/.test(password)) {
      suggestions.push("debe incluir al menos un número");
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      suggestions.push("debe incluir al menos un carácter especial");
    }

    return {
      isValid: false,
      message: `La contraseña es demasiado débil. ${suggestions.join(", ")}.`,
      strength: result.value,
      suggestions: suggestions,
    };
  }

  return {
    isValid: true,
    strength: result.value,
    score: result.id,
  };
};

// Controlador para registrar un nuevo usuario
export const registerUser = async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, contraseña, tipo_usuario } =
      req.body;

    // Validar campos requeridos
    if (!nombre || !email || !contraseña) {
      return res.status(400).json({
        message: "Nombre, email y contraseña son obligatorios",
      });
    }

    // Validar correo
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Correo no válido",
      });
    }

    // Validar teléfono (10 dígitos, opcional)
    if (telefono && !validator.matches(telefono, /^\d{10}$/)) {
      return res.status(400).json({
        message: "El teléfono debe tener 10 dígitos",
      });
    }

    // Validar contraseña
    const passwordValidation = validatePasswordStrength(contraseña);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        message: passwordValidation.message,
      });
    }

    // Crear usuario (por defecto como cliente)
    const userId = await userModel.createUser({
      email,
      password: contraseña,
      nombre,
      apellido,
      telefono,
      tipo_usuario: tipo_usuario || "cliente",
    });

    // Generar código de verificación para clientes
    if (tipo_usuario === "cliente" || !tipo_usuario) {
      const codigo = await userModel.generateVerificationCode(userId);
      await sendVerificationEmail(email, nombre, codigo);
    }

    res.status(201).json({
      message:
        tipo_usuario === "cliente" || !tipo_usuario
          ? "Usuario registrado exitosamente. Por favor, verifica tu email para activar tu cuenta."
          : "Usuario registrado exitosamente.",
      userId,
      requiresVerification: tipo_usuario === "cliente" || !tipo_usuario,
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
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        message: "Email válido requerido",
      });
    }

    // Buscar usuario
    const user = await userModel.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    if (user.email_verificado) {
      return res.status(400).json({
        message: "El email ya está verificado",
      });
    }

    // Generar nuevo código
    const codigo = await userModel.generateVerificationCode(user.id_user);

    // Enviar email
    await sendVerificationEmail(user.email, user.nombre, codigo);

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
    const { email, codigo } = req.body;

    if (!email || !codigo) {
      return res.status(400).json({
        message: "Email y código son requeridos",
      });
    }

    // Buscar usuario
    const user = await userModel.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    if (user.email_verificado) {
      return res.status(400).json({
        message: "El email ya está verificado",
      });
    }

    // Verificar código
    const isValid = await userModel.verifyCode(user.id_user, codigo);

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

// Controlador para login
export const loginUser = async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
      return res.status(400).json({
        message: "Email y contraseña son requeridos",
      });
    }

    // Intentar login
    const user = await userModel.loginUser(email, contraseña);

    // Verificar si está activo y verificado
    if (!user.activo || !user.email_verificado) {
      return res.status(401).json({
        message: "Usuario no activo o email no verificado",
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.id_user,
        email: user.email,
        tipo_usuario: user.tipo_usuario,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn },
    );

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id_user,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        tipo_usuario: user.tipo_usuario,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(401).json({
      message: error.message || "Error en autenticación",
    });
  }
};

// Controlador para logout
export const logoutUser = (req, res) => {
  res.json({
    message: "Logout exitoso",
  });
};

// Controlador para obtener perfil del usuario
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.getUserCompleto(userId);

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    // Crear objeto userProfile excluyendo información sensible
    const userProfile = {
      id_user: user.id_user,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      telefono: user.telefono,
      direccion: user.direccion,
      tipo_usuario: user.tipo_usuario,
      activo: user.activo,
      email_verificado: user.email_verificado,
      fecha_creacion: user.fecha_creacion,
      fecha_actualizacion: user.fecha_actualizacion,
    };

    res.json(userProfile);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({
      message: "Error al obtener perfil de usuario",
    });
  }
};

// Controlador para verificar token
export const verifyToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    res.json({
      valid: true,
      user: {
        id: user.id_user,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        tipo_usuario: user.tipo_usuario,
      },
    });
  } catch (error) {
    console.error("Error al verificar token:", error);
    res.status(500).json({
      message: "Error al verificar token",
    });
  }
};

// Controlador para recuperar contraseña
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        message: "Email válido requerido",
      });
    }

    // Generar token de recuperación
    const { resetToken, user } =
      await userModel.generatePasswordResetToken(email);

    // Enviar email de recuperación
    const mailOptions = {
      from: config.email.user,
      to: email,
      subject: "Recuperación de contraseña - Sabor",
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #ff6f00;">Recuperación de contraseña</h2>
                    <p>Hola <strong>${user.nombre}</strong>,</p>
                    <p>Has solicitado restablecer tu contraseña. Usa el siguiente enlace para crear una nueva contraseña:</p>
                    
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${config.frontend.url}/reset-password/${resetToken}" 
                           style="background-color: #ff6f00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                            Restablecer contraseña
                        </a>
                    </div>
                    
                    <p>Este enlace expira en 1 hora.</p>
                    <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
                    
                    <p style="color: #666; font-size: 14px;">
                        Saludos,<br>
                        El equipo de Sabor
                    </p>
                </div>
            `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      message: "Email de recuperación enviado exitosamente",
    });
  } catch (error) {
    console.error("Error en recuperación de contraseña:", error);
    res.status(500).json({
      message: error.message || "Error al procesar solicitud de recuperación",
    });
  }
};

// Controlador para verificar token de recuperación
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await userModel.verifyResetToken(token);

    if (!user) {
      return res.status(400).json({
        message: "Token inválido o expirado",
      });
    }

    res.json({
      message: "Token válido",
      email: user.email,
    });
  } catch (error) {
    console.error("Error al verificar token de recuperación:", error);
    res.status(500).json({
      message: "Error al verificar token",
    });
  }
};

// Controlador para resetear contraseña
export const resetPassword = async (req, res) => {
  try {
    const { token, nuevaContraseña } = req.body;

    if (!token || !nuevaContraseña) {
      return res.status(400).json({
        message: "Token y nueva contraseña son requeridos",
      });
    }

    // Validar nueva contraseña
    const passwordValidation = validatePasswordStrength(nuevaContraseña);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        message: passwordValidation.message,
      });
    }

    // Resetear contraseña
    await userModel.resetPasswordWithToken(token, nuevaContraseña);

    res.json({
      message: "Contraseña restablecida exitosamente",
    });
  } catch (error) {
    console.error("Error al resetear contraseña:", error);
    res.status(500).json({
      message: error.message || "Error al resetear contraseña",
    });
  }
};

// Controlador para actualizar perfil
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nombre, apellido, telefono, direccion } = req.body;

    // Validar teléfono si se proporciona
    if (telefono && !validator.matches(telefono, /^\d{10}$/)) {
      return res.status(400).json({
        message: "El teléfono debe tener 10 dígitos",
      });
    }

    // Obtener usuario actual para mantener el email
    const currentUser = await userModel.getUserById(userId);
    if (!currentUser) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    // Actualizar usuario
    const success = await userModel.updateUser(userId, {
      email: currentUser.email,
      nombre,
      apellido,
      telefono,
      direccion,
    });

    if (!success) {
      return res.status(400).json({
        message: "Error al actualizar perfil",
      });
    }

    res.json({
      message: "Perfil actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({
      message: error.message || "Error al actualizar perfil",
    });
  }
};

// Controlador para cambiar contraseña
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contraseñaActual, nuevaContraseña } = req.body;

    if (!contraseñaActual || !nuevaContraseña) {
      return res.status(400).json({
        message: "Contraseña actual y nueva contraseña son requeridas",
      });
    }

    // Validar nueva contraseña
    const passwordValidation = validatePasswordStrength(nuevaContraseña);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        message: passwordValidation.message,
      });
    }

    // Verificar contraseña actual
    const user = await userModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    // Verificar contraseña actual usando login
    try {
      await userModel.loginUser(user.email, contraseñaActual);
    } catch (error) {
      return res.status(400).json({
        message: "Contraseña actual incorrecta",
      });
    }

    // Actualizar contraseña
    await userModel.updatePassword(userId, nuevaContraseña);

    res.json({
      message: "Contraseña cambiada exitosamente",
    });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({
      message: "Error al cambiar contraseña",
    });
  }
};
