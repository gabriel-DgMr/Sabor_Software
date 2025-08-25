import { dbConfig } from "../config/dbconfig.js";
import mysql from "mysql2/promise";

const pool = mysql.createPool(dbConfig);

export const crearMensajeContacto = async ({
  id_usuario = null,
  nombre,
  email,
  mensaje,
}) => {
  const [result] = await pool.query(
    `INSERT INTO mensajes_contacto (id_usuario, nombre, email, mensaje) VALUES (?, ?, ?, ?)`,
    [id_usuario, nombre, email, mensaje],
  );
  return result.insertId;
};
