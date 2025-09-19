import { dbConfig } from "../config/dbconfig.js";
import mysql from "mysql2/promise";
const pool = mysql.createPool(dbConfig);

export const getDomiciliosByUserId = async (id_usuario) => {
  const [rows] = await pool.query(
    `SELECT *
     FROM pedidos
     WHERE id_usuario = ? AND tipo_servicio = 'domicilio'
     ORDER BY fecha_pedido DESC`,
    [id_usuario],
  );
  return rows;
};
