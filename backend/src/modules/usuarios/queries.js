import { dbConfig } from "../../core/config/dbconfig.js";
import mysql from "mysql2/promise";

const pool = mysql.createPool(dbConfig);

/**
 * Obtiene el listado completo de usuarios activos con su rol pre-cargado.
 * @returns {Promise<Array>} Lista de usuarios.
 */
export const getAllUsers = async () => {
  const [rows] = await pool.query(
    `SELECT u.id_usuario, u.nombre_usuario, u.correo_usuario, u.telefono_usuario, 
            u.fecha_registro, u.fecha_modificacion, u.id_rol, r.nombre_rol
     FROM usuarios u 
     JOIN roles r ON u.id_rol = r.id_rol 
     WHERE u.activo = true`,
  );
  return rows;
};

/**
 * Retorna las métricas y datos de un usuario por su PK.
 * @param {number} id - Identificador.
 * @returns {Promise<Object|null>}
 */
export const getUserById = async (id) => {
  const [rows] = await pool.query(
    "SELECT id_usuario, nombre_usuario, correo_usuario, telefono_usuario, imagen_usuario, fecha_registro, fecha_modificacion FROM usuarios WHERE id_usuario = ? AND activo = true",
    [id],
  );
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Actualiza los metadatos de un usuario de forma dinámica.
 * @param {number} id - Usuario a afectar.
 * @param {Object} userData - Datos cambiantes.
 * @returns {Promise<boolean>} TRUE si afectó algún row.
 */
export const updateUser = async (id, userData) => {
  const { nombre_usuario, correo_usuario, telefono_usuario, imagen_usuario } =
    userData;
  let query = "UPDATE usuarios SET ";
  let values = [];
  let setClauses = [];

  if (nombre_usuario !== undefined) {
    setClauses.push("nombre_usuario = ?");
    values.push(nombre_usuario);
  }
  if (correo_usuario !== undefined) {
    setClauses.push("correo_usuario = ?");
    values.push(correo_usuario);
  }
  if (telefono_usuario !== undefined) {
    setClauses.push("telefono_usuario = ?");
    values.push(telefono_usuario);
  }
  if (imagen_usuario !== undefined) {
    setClauses.push("imagen_usuario = ?");
    values.push(imagen_usuario);
  }

  setClauses.push("fecha_modificacion = CURRENT_TIMESTAMP");
  values.push(id);

  query += setClauses.join(", ") + " WHERE id_usuario = ? AND activo = true";

  const [result] = await pool.query(query, values);
  return result.affectedRows > 0;
};

/**
 * Soft delete desactivando el registro completo.
 * @param {number} id - Identificador del usuario.
 */
export const deactivateUser = async (id) => {
  const [result] = await pool.query(
    "UPDATE usuarios SET activo = false WHERE id_usuario = ?",
    [id],
  );
  return result.affectedRows > 0;
};

/**
 * Extrae catalogación completa de roles.
 * @returns {Promise<Array>} Listado de roles del sistema.
 */
export const getAllRoles = async () => {
  const [rows] = await pool.query(
    "SELECT id_rol, nombre_rol FROM roles ORDER BY id_rol",
  );
  return rows;
};

/**
 * Aplica mutación de privilegios sobre la tabla usuarios.
 * @param {number} idUsuario - Target user.
 * @param {number} idRol - Target Rol.
 * @returns {Promise<boolean>}
 */
export const updateUserRole = async (idUsuario, idRol) => {
  const [result] = await pool.query(
    "UPDATE usuarios SET id_rol = ?, fecha_modificacion = CURRENT_TIMESTAMP WHERE id_usuario = ? AND activo = true",
    [idRol, idUsuario],
  );
  return result.affectedRows > 0;
};
/**
 * Busca un usuario por correo exacto, sin importar si está activo o verificado.
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
