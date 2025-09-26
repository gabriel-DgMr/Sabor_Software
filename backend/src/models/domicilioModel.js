import { dbConfig } from "../config/dbconfig.js";
import mysql from "mysql2/promise";
const pool = mysql.createPool(dbConfig);

export const getDomiciliosByUserId = async (id_usuario) => {
  const [rows] = await pool.query(
    `SELECT p.*, e.nombre_estado, e.id_estado
     FROM pedidos p
     JOIN estados e ON p.id_estado = e.id_estado
     WHERE p.id_usuario = ? AND p.tipo_servicio = 'domicilio'
     ORDER BY p.fecha_pedido DESC`,
    [id_usuario],
  );
  return rows;
};

export const getDomicilios = async () => {
  const [rows] = await pool.query(
    `SELECT p.*, e.nombre_estado, e.id_estado, u.nombre_usuario, u.telefono_usuario
     FROM pedidos p
     JOIN estados e ON p.id_estado = e.id_estado
     JOIN usuarios u ON p.id_usuario = u.id_usuario
     WHERE p.tipo_servicio = 'domicilio'
     ORDER BY p.fecha_pedido DESC`,
  );
  return rows;
};

export const marcarDomicilioComoRecibido = async (id_pedido, id_usuario) => {
  try {
    // Verificar que el pedido pertenece al usuario y es un domicilio
    const [pedido] = await pool.query(
      `SELECT id_pedido, id_estado, tipo_servicio 
       FROM pedidos 
       WHERE id_pedido = ? AND id_usuario = ? AND tipo_servicio = 'domicilio'`,
      [id_pedido, id_usuario],
    );

    if (pedido.length === 0) {
      throw new Error("Pedido no encontrado o no autorizado");
    }

    // Verificar que el pedido está en estado "completado" (ID 3)
    if (pedido[0].id_estado !== 3) {
      throw new Error(
        "Solo se pueden marcar como recibidos los pedidos completados",
      );
    }

    // Actualizar el estado a "recibido" (ID 6)
    const [result] = await pool.query(
      `UPDATE pedidos 
       SET id_estado = 6 
       WHERE id_pedido = ? AND id_usuario = ?`,
      [id_pedido, id_usuario],
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error al marcar domicilio como recibido:", error);
    throw error;
  }
};
