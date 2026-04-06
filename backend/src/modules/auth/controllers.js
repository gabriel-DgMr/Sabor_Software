import * as authService from "./services.js";
import * as queries from "./queries.js";
import logger from "../../core/utils/logger.js";

/**
 * Registra un nuevo cliente/usuario inactivo en la plataforma.
 */
export const registerUser = async (req, res) => {
  try {
    const userId = await authService.registerUserService(req.body);
    res.status(201).json({
      message:
        "usuario registrado exitosamente. Por favor, verifica tu email para activar tu cuenta.",
      userId,
      requiresVerification: true,
    });
  } catch (error) {
    logger.error("Error en registro:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: error.message });
    }
    res
      .status(400)
      .json({ message: error.message || "Error al registrar usuario" });
  }
};

/**
 * Reenvía el código de verificación por email.
 */
export const resendVerificationCode = async (req, res) => {
  try {
    const { correo_usuario } = req.body;
    if (!correo_usuario)
      return res.status(400).json({ message: "Email requerido" });

    await authService.resendVerificationService(correo_usuario);
    res.json({ message: "Código de verificación reenviado exitosamente" });
  } catch (error) {
    logger.error("Error al reenviar código:", error);
    res
      .status(500)
      .json({ message: error.message || "Error al reenviar código" });
  }
};

/**
 * Verifica el código OTP de registro.
 */
export const verifyEmailCode = async (req, res) => {
  try {
    const { correo_usuario, codigo } = req.body;
    if (!correo_usuario || !codigo) {
      return res
        .status(400)
        .json({ message: "El código y correo son requeridos" });
    }

    await authService.verifyEmailCodeService(correo_usuario, codigo);
    res.json({
      message: "Email verificado exitosamente. Tu cuenta ha sido activada.",
      success: true,
    });
  } catch (error) {
    logger.error("Error al verificar código:", error);
    res
      .status(400)
      .json({ message: error.message || "Error al verificar código" });
  }
};

/**
 * Inicia sesión y distribuye la cookie JWT al cliente.
 */
export const loginUser = async (req, res) => {
  try {
    const { correo_usuario, contraseña_usuario } = req.body;
    if (!correo_usuario || !contraseña_usuario) {
      return res
        .status(400)
        .json({ message: "Email y contraseña son requeridos" });
    }

    const { user, token } = await authService.loginUserService(
      correo_usuario,
      contraseña_usuario,
    );

    // Adjuntar foto de perfil
    let imagenUrl = null;
    if (user.imagen_usuario) {
      const baseUrl =
        process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
      imagenUrl = `${baseUrl.replace(/\/$/, "")}/api/auth/imagen-perfil/${user.imagen_usuario}`;
    }
    const userWithImageUrl = { ...user, imagen_usuario: imagenUrl };

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Login exitoso", user: userWithImageUrl, token });
  } catch (error) {
    logger.debug("Error en login:", error);
    res
      .status(401)
      .json({ message: error.message || "Error al iniciar sesión" });
  }
};

/**
 * Vacía la cookie del navegador finalizando la sesión.
 */
export const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Sesión cerrada exitosamente" });
};

/**
 * Solicita restablecer la contraseña vía enlace al email.
 */
export const forgotPassword = async (req, res) => {
  try {
    const { correo_usuario } = req.body;
    if (!correo_usuario)
      return res.status(400).json({ message: "Correo es requerido" });

    await authService.forgotPasswordService(correo_usuario);

    res.json({
      message:
        "Si el correo existe en nuestra base de datos, recibirás las instrucciones para recuperar tu contraseña",
    });
  } catch (error) {
    logger.error("Error en forgotPassword:", error);
    res.json({
      message:
        "Si el correo existe en nuestra base de datos, recibirás las instrucciones para recuperar tu contraseña",
    });
  }
};

/**
 * Validar vigencia del token de correo electronico para reestablecer pass.
 */
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await queries.getUserByResetToken(token);

    if (!user)
      return res.status(400).json({ message: "Token inválido o expirado" });

    res.json({ message: "Token válido", email: user.correo_usuario });
  } catch (error) {
    logger.error("Error en verifyResetToken:", error);
    res.status(500).json({ message: "Error al verificar el token" });
  }
};

/**
 * Consuma el token y establece un nuevo password final.
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { contraseña_usuario } = req.body;
    if (!contraseña_usuario)
      return res.status(400).json({ message: "Nueva contraseña requerida" });

    await authService.resetPasswordService(token, contraseña_usuario);
    res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    logger.error("Error en resetPassword:", error);
    res
      .status(400)
      .json({ message: error.message || "Error al restablecer la contraseña" });
  }
};

/**
 * Devuelve información del usuario vinculada al JWT presente en la cookie.
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await authService.getUserProfileService(req.user.email);

    let imagenUrl = null;
    if (user.imagen_usuario) {
      const baseUrl =
        process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
      imagenUrl = `${baseUrl.replace(/\/$/, "")}/api/auth/imagen-perfil/${user.imagen_usuario}`;
    }

    res.json({ user: { ...user, imagen_usuario: imagenUrl } });
  } catch (error) {
    logger.error("Error al obtener perfil:", error);
    res
      .status(500)
      .json({ message: error.message || "Error al obtener perfil de usuario" });
  }
};
