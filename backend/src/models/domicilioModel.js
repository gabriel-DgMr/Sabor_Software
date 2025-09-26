import { dbConfig } from "../config/dbconfig.js";
import mysql from "mysql2/promise";
const pool = mysql.createPool(dbConfig);

export const getDomiciliosByUserId = async (id_usuario) => {
  const [rows] = await pool.query(
    `SELECT 
       p.*, 
       e.nombre_estado, 
       e.id_estado,
       GROUP_CONCAT(
         CONCAT(dp.cantidad, ' x ', pr.nombre_producto, ' - $', (dp.cantidad * dp.precio_unitario))
         SEPARATOR ', '
       ) AS productos_str
     FROM pedidos p
     JOIN estados e ON p.id_estado = e.id_estado
     LEFT JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
     LEFT JOIN productos pr ON dp.id_producto = pr.id_producto
     WHERE p.id_usuario = ? AND p.tipo_servicio = 'domicilio'
     GROUP BY p.id_pedido
     ORDER BY p.fecha_pedido DESC`,
    [id_usuario],
  );
  return rows;
};

export const getDomicilios = async () => {
  const [rows] = await pool.query(
    `SELECT 
       p.*, 
       e.nombre_estado, 
       e.id_estado, 
       u.nombre_usuario, 
       u.telefono_usuario,
       GROUP_CONCAT(
         CONCAT(dp.cantidad, ' x ', pr.nombre_producto, ' - $', (dp.cantidad * dp.precio_unitario))
         SEPARATOR ', '
       ) AS productos_str
     FROM pedidos p
     JOIN estados e ON p.id_estado = e.id_estado
     JOIN usuarios u ON p.id_usuario = u.id_usuario
     LEFT JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
     LEFT JOIN productos pr ON dp.id_producto = pr.id_producto
     WHERE p.tipo_servicio = 'domicilio'
     GROUP BY p.id_pedido
     ORDER BY p.fecha_pedido DESC`,
  );
  return rows;
};

export const marcarDomicilioComoRecibido = async (id_pedido, id_usuario) => {
  let connection;

  try {
    connection = await pool.getConnection();

    // Verificar que el pedido pertenece al usuario y es un domicilio
    const [pedido] = await connection.query(
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

    // Asegurar que el estado "Recibido" existe
    await connection.query(
      `INSERT INTO estados (id_estado, nombre_estado, descripcion_estado) 
       VALUES (6, 'Recibido', 'Pedido a domicilio recibido por el cliente')
       ON DUPLICATE KEY UPDATE 
         nombre_estado = VALUES(nombre_estado),
         descripcion_estado = VALUES(descripcion_estado)`,
    );

    // Actualizar el estado a "recibido" (ID 6)
    const [result] = await connection.query(
      `UPDATE pedidos 
       SET id_estado = 6 
       WHERE id_pedido = ? AND id_usuario = ?`,
      [id_pedido, id_usuario],
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error al marcar domicilio como recibido:", error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
