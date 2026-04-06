import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { config } from "../../core/config/config.js";
import {
  createEmailTransporter,
  sendWithRetry,
} from "../../core/config/emailConfig.js";
import * as queries from "./queries.js";
import {
  validateRegistrationData,
  validateStrongPassword,
} from "./validations.js";
import logger from "../../core/utils/logger.js";

const transporter = createEmailTransporter();

/**
 * Envia un email de verificación robusto con lógica retry-on-fail.
 *
 * @param {string} correo_usuario - Destinatario.
 * @param {string} nombre_usuario - Nombre saludo.
 * @param {string} codigo - Código de 6 dígitos.
 */
const sendVerificationEmail = async (
  correo_usuario,
  nombre_usuario,
  codigo,
) => {
  if (!config.email.user || !config.email.password) {
    throw new Error("Configuración de email no encontrada");
  }

  const mailOptions = {
    to: correo_usuario,
    subject: "Verifica tu cuenta - Sabor",
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #eaeaea;">
          <div style="background-color: #ff6f00; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">SABOR</h1>
          </div>
          <div style="padding: 40px 30px; color: #333333;">
              <h2 style="color: #1a1a1a; margin-top: 0; font-size: 22px;">¡Hola, ${nombre_usuario}!</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #555555;">Gracias por elegir <strong>Sabor</strong>. Para completar tu registro y asegurar tu cuenta, por favor utiliza el siguiente código de verificación:</p>
              
              <div style="background-color: #fef4eb; padding: 40px 20px; border-radius: 12px; text-align: center; margin: 30px 0; border: 1px dashed #ffb37e;">
                  <span style="display: block; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #ff6f00; font-weight: 700; margin-bottom: 15px;">Código de Verificación</span>
                  <div style="font-size: 48px; font-weight: 800; color: #ff6f00; letter-spacing: 8px; margin: 0;">
                      ${codigo}
                  </div>
                  <p style="color: #888888; font-size: 13px; margin-top: 15px; margin-bottom: 0;">Este código será válido por los próximos 15 minutos.</p>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #555555;">Si no has solicitado esta cuenta, puedes ignorar este correo de forma segura.</p>
              
              <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 30px 0;" />
              
              <div style="text-align: center;">
                  <p style="color: #999999; font-size: 13px; margin: 0;">Saludos,<br><strong style="color: #1a1a1a;">El equipo de Sabor</strong></p>
              </div>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; text-align: center; color: #aaaaaa; font-size: 12px;">
              &copy; ${new Date().getFullYear()} Sabor Software. Todos los derechos reservados.
          </div>
      </div>`,
  };

  await sendWithRetry(transporter, mailOptions, 5);
};

/**
 * Registra un usuario procesando contraseñas seguras y generando tokens MFA.
 *
 * @param {Object} userData - Nombre, correo, tel, contraseña.
 * @returns {Promise<number>} ID de usuario recién creado.
 */
export const registerUserService = async (userData) => {
  validateRegistrationData(userData);

  const existingEmail = await queries.getUserByEmailIncludingUnverified(
    userData.correo_usuario,
  );
  if (existingEmail) {
    const error = new Error("El correo electrónico ya está registrado");
    error.code = "ER_DUP_ENTRY";
    throw error;
  }

  const existingPhone = await queries.getUserByPhone(userData.telefono_usuario);
  if (existingPhone) {
    const error = new Error("El teléfono ya está registrado");
    error.code = "ER_DUP_ENTRY";
    throw error;
  }

  const hashedPassword = await bcrypt.hash(userData.contraseña_usuario, 10);
  const userId = await queries.insertUser({
    ...userData,
    contraseña_usuario: hashedPassword,
  });

  const codigo = Math.floor(100000 + Math.random() * 900000).toString();
  const fechaExpiracion = new Date(Date.now() + 15 * 60 * 1000);

  await queries.setVerificationCode(userId, codigo, fechaExpiracion);

  try {
    await sendVerificationEmail(
      userData.correo_usuario,
      userData.nombre_usuario,
      codigo,
    );
  } catch (err) {
    logger.error(
      "El usuario fue registrado pero el email de validacion fallo",
      err,
    );
  }

  return userId;
};

/**
 * Reenvía un nuevo código SMS/Email a una cuenta no validada.
 *
 * @param {string} correo - Correo del usuario.
 */
export const resendVerificationService = async (correo) => {
  const user = await queries.getUserByEmailIncludingUnverified(correo);
  if (!user) throw new Error("usuario no encontrado");
  if (user.email_verificado) throw new Error("El email ya está verificado");

  const codigo = Math.floor(100000 + Math.random() * 900000).toString();
  const fechaExpiracion = new Date(Date.now() + 15 * 60 * 1000);

  await queries.setVerificationCode(user.id_usuario, codigo, fechaExpiracion);
  await sendVerificationEmail(user.correo_usuario, user.nombre_usuario, codigo);
};

/**
 * Confirma el MFA vía código de usuario para activación definitiva.
 */
export const verifyEmailCodeService = async (correo, codigo) => {
  const user = await queries.getUserByEmailIncludingUnverified(correo);
  if (!user) throw new Error("usuario no encontrado");
  if (user.email_verificado) throw new Error("El email ya está verificado");

  const success = await queries.verifyAndActivateUser(user.id_usuario, codigo);
  if (!success) throw new Error("Código inválido o expirado");

  return true;
};

/**
 * Valida credenciales contra la BD.
 *
 * @returns {Promise<Object>} Usuario y JWT.
 */
export const loginUserService = async (correo, contraseña) => {
  const user = await queries.getActiveVerifiedUserByEmail(correo);
  if (!user) {
    throw new Error("usuario no existe o no está verificado");
  }

  const isValid = await bcrypt.compare(contraseña, user.contraseña_usuario);
  if (!isValid) {
    throw new Error("Contraseña incorrecta");
  }

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

  const { contraseña_usuario: _, ...safeUser } = user;
  return { user: safeUser, token };
};

/**
 * Orquesta proceso de olvido de password y despacha un link de re-cuadre.
 */
export const forgotPasswordService = async (correo) => {
  const user = await queries.getActiveVerifiedUserByEmail(correo);
  if (!user) {
    // Retornamos exito aparente por prevencion de escaneo de correos
    return true;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hr

  await queries.setPasswordResetToken(
    user.id_usuario,
    resetToken,
    resetTokenExpiry,
  );

  const resetUrl = `${config.frontendUrl}/reset-password/${resetToken}`;

  const mailOptions = {
    to: user.correo_usuario,
    subject: "Recuperación de Contraseña - Sabor",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff6f00;">Recuperación de Contraseña</h2>
          <p>Hola <strong>${user.nombre_usuario}</strong>,</p>
          <p>Has solicitado recuperar tu contraseña. Haz clic en el siguiente enlace para restablecerla:</p>
          <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #ff6f00; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer Contraseña</a>
          </div>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este email de forma segura.</p>
          <p style="color: #666; font-size: 14px;">Saludos,<br>El equipo de Sabor</p>
      </div>`,
  };

  await sendWithRetry(transporter, mailOptions, 3);
  return true;
};

/**
 * Cambia la contraseña por una nueva previamente valorando el reset token temporal.
 */
export const resetPasswordService = async (token, nuevaContrasena) => {
  validateStrongPassword(nuevaContrasena);

  const user = await queries.getUserByResetToken(token);
  if (!user) throw new Error("Token inválido o expirado");

  const hashed = await bcrypt.hash(nuevaContrasena, 10);
  await queries.updatePassword(user.id_usuario, hashed);
  return true;
};

/**
 * Recupera el perfil del usuario actual sin inyectar datos sensibles en la salida final.
 */
export const getUserProfileService = async (correo) => {
  const user = await queries.getActiveVerifiedUserByEmail(correo);
  if (!user) throw new Error("usuario no encontrado");

  const { contraseña_usuario: _, ...safeUser } = user;
  return safeUser;
};
