import { dbConfig } from "../../core/config/dbconfig.js";
import mysql from "mysql2/promise";

const pool = mysql.createPool(dbConfig);

/**
 * Busca un usuario por correo exacto, sin importar si está activo o verificado.
 * Utilizado para control de duplicados y reenvío de correos de verificación.
 *
 * @param {string} correo - Correo del usuario.
 * @returns {Promise<Object|null>} Datos del usuario o null si no se encuentra.
 */
export const getUserByEmailIncludingUnverified = async (correo) => {
  const [rows] = await pool.query(
    "SELECT * FROM usuarios WHERE correo_usuario = ?",
    [correo],
  );
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Busca un usuario por teléfono exacto en el sistema.
 *
 * @param {string} telefono - Teléfono del usuario.
 * @returns {Promise<Object|null>} Datos del usuario.
 */
export const getUserByPhone = async (telefono) => {
  const [rows] = await pool.query(
    "SELECT * FROM usuarios WHERE telefono_usuario = ?",
    [telefono],
  );
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Busca un usuario activo y verificado por email, útil para login.
 * Incluye el rol del usuario mediante un JOIN con la tabla roles.
 *
 * @param {string} correo - Correo del usuario a loguear.
 * @returns {Promise<Object|null>} Objeto de usuario con su respectivo rol de BD.
 */
export const getActiveVerifiedUserByEmail = async (correo) => {
  const [rows] = await pool.query(
    `SELECT u.*, r.nombre_rol 
     FROM usuarios u 
     JOIN roles r ON u.id_rol = r.id_rol 
     WHERE u.correo_usuario = ? AND u.activo = true AND u.email_verificado = true`,
    [correo],
  );
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Inserta un nuevo usuario inactivo y no verificado al sistema.
 *
 * @param {Object} data - Datos del usuario con la contraseña ya cifrada.
 * @returns {Promise<number>} ID del usuario insertado.
 */
export const insertUser = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO usuarios (
        nombre_usuario, correo_usuario, telefono_usuario, contraseña_usuario,
        activo, email_verificado, id_rol
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.nombre_usuario,
      data.correo_usuario,
      data.telefono_usuario,
      data.contraseña_usuario,
      false,
      false,
      1,
    ],
  );
  return result.insertId;
};

/**
 * Borra cualquier código de verificación previo y guarda uno nuevo.
 *
 * @param {number} userId - Identificador primario del usuario.
 * @param {string} codigo - Código MFA de verificación de 6 dígitos.
 * @param {Date} expiration - Fecha futura de expiración del código.
 */
export const setVerificationCode = async (userId, codigo, expiration) => {
  await pool.query(
    "DELETE FROM codigos_verificacion WHERE id_usuario = ? AND usado = false",
    [userId],
  );
  await pool.query(
    "INSERT INTO codigos_verificacion (id_usuario, codigo, fecha_expiracion) VALUES (?, ?, ?)",
    [userId, codigo, expiration],
  );
};

/**
 * Verifica si un código de email es válido, no expirado y no usado; acto seguido habilita al usuario.
 *
 * @param {number} userId - ID de usuario.
 * @param {string} codigo - Código ingresado en aplicación frontend.
 * @returns {Promise<boolean>} Devuelve TRUE si la verificación y activación tuvo éxito.
 */
export const verifyAndActivateUser = async (userId, codigo) => {
  const [rows] = await pool.query(
    `SELECT id_codigo FROM codigos_verificacion 
     WHERE id_usuario = ? AND codigo = ? AND usado = false AND fecha_expiracion > NOW()`,
    [userId, codigo],
  );

  if (rows.length === 0) return false;

  await pool.query(
    "UPDATE codigos_verificacion SET usado = true WHERE id_codigo = ?",
    [rows[0].id_codigo],
  );
  await pool.query(
    "UPDATE usuarios SET activo = true, email_verificado = true WHERE id_usuario = ?",
    [userId],
  );
  return true;
};

/**
 * Establece en la tabla usuarios el token de recuperación de contraseña temporal.
 *
 * @param {number} userId - ID secundable.
 * @param {string} token - Cadena larga aleatoria.
 * @param {Date} expiry - Marca temporal de expedición de máximo 1 hora usualmente.
 */
export const setPasswordResetToken = async (userId, token, expiry) => {
  await pool.query(
    "UPDATE usuarios SET reset_token = ?, reset_token_expiry = ? WHERE id_usuario = ?",
    [token, expiry, userId],
  );
};

/**
 * Retorna un usuario dependiendo del token de reset y comprueba vigencia en el acto.
 *
 * @param {string} token - Token URL-safe.
 * @returns {Promise<Object|null>} Devuelve la row usuario o null de estar vencido/inválido.
 */
export const getUserByResetToken = async (token) => {
  const [rows] = await pool.query(
    "SELECT * FROM usuarios WHERE reset_token = ? AND reset_token_expiry > NOW() AND activo = true",
    [token],
  );
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Asigna una nueva contraseña definitiva y descarta tokens de re-seteo para sanear a un usuario.
 *
 * @param {number} userId - Usuario a reponer.
 * @param {string} hashedPassword - Hashing en bcrypt de grado 10 o equiparable.
 * @returns {Promise<boolean>} TRUE si afectó algún row.
 */
export const updatePassword = async (userId, hashedPassword) => {
  const [result] = await pool.query(
    `UPDATE usuarios 
     SET contraseña_usuario = ?, reset_token = NULL, reset_token_expiry = NULL, fecha_modificacion = CURRENT_TIMESTAMP
     WHERE id_usuario = ? AND activo = true`,
    [hashedPassword, userId],
  );
  return result.affectedRows > 0;
};
