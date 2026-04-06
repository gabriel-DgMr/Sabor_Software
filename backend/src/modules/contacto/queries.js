import { dbConfig } from "../../core/config/dbconfig.js";
import mysql from "mysql2/promise";

const pool = mysql.createPool(dbConfig);

/**
 * Inserta un nuevo mensaje de contacto en la base de datos.
 * @param {Object} data - Datos del mensaje.
 * @returns {Promise<number>} ID del mensaje insertado.
 */
export const crearMensajeContacto = async (data) => {
  const { id_usuario, nombre, email, mensaje } = data;
  const [result] = await pool.query(
    "INSERT INTO mensajes_contacto (id_usuario, nombre, email, mensaje) VALUES (?, ?, ?, ?)",
    [id_usuario, nombre, email, mensaje],
  );
  return result.insertId;
};
