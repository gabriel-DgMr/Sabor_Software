import { dbConfig } from '../config/dbconfig.js';
import mysql from 'mysql2/promise';

const pool = mysql.createPool(dbConfig);

export const crearMensajeContacto = async ({ id_cliente = null, nombre, email, mensaje }) => {
  const [result] = await pool.query(
    `INSERT INTO mensajes_contacto (id_cliente, nombre, email, mensaje) VALUES (?, ?, ?, ?)`,
    [id_cliente, nombre, email, mensaje]
  );
  return result.insertId;
};