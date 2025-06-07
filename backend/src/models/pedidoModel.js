import { dbConfig } from '../config/dbconfig.js';
import mysql from 'mysql2/promise';

const pool = mysql.createPool(dbConfig);

export const getPedidos = async (userId) => {
  try {
    // Consulta SQL para obtener pedidos con sus detalles para un cliente específico
    const [rows] = await pool.query(`
      SELECT
        p.id_pedido AS _id,
        p.total_pedido AS total,
        p.fecha_pedido AS createdAt,
        p.recomendaciones,
        GROUP_CONCAT(CONCAT(dp.cantidad, ' x ', pr.nombre_producto) SEPARATOR ', ') AS items_str
      FROM pedidos p
      JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
      JOIN productos pr ON dp.id_producto = pr.id_producto
      WHERE p.id_cliente = ?
      GROUP BY p.id_pedido
      ORDER BY p.fecha_pedido DESC
    `, [userId]); // Pasar el ID del usuario como parámetro de la consulta

    // Mapear los resultados al formato esperado por el frontend
    const pedidos = rows.map(row => ({
      _id: row._id,
      total: row.total,
      createdAt: row.createdAt,
      recomendaciones: row.recomendaciones,
      // Convertir la string de ítems a un array de strings
      items: row.items_str ? row.items_str.split(', ') : []
    }));

    return pedidos;
  } catch (error) {
    console.error('Error al obtener pedidos de MySQL:', error);
    throw error; // Propagar el error para que el controlador lo maneje
  }
};

// TODO: Implementar deletePedido para MySQL
export const deletePedido = async (id) => {
  // Lógica para eliminar de la base de datos MySQL
  console.log('Implementar deletePedido para MySQL', id);
  // Implementar DELETE FROM pedidos WHERE id_pedido = ?
  // Implementar DELETE FROM detalle_pedidos WHERE id_pedido = ?
  // Es crucial manejar transacciones para asegurar que ambas operaciones tengan éxito o fallen juntas
  throw new Error('deletePedido no implementado para MySQL');
};

export const createPedido = async ({ userId, items, total, recomendaciones }) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction(); // Iniciar transacción

    // Insertar en la tabla de pedidos
    const [pedidoResult] = await connection.query(
      'INSERT INTO pedidos (id_cliente, total_pedido, recomendaciones) VALUES (?, ?, ?)',
      [userId, total, recomendaciones]
    );

    const pedidoId = pedidoResult.insertId;

    // Insertar en la tabla de detalle_pedidos
    for (const item of items) {
      await connection.query(
        'INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [pedidoId, item.id_producto, item.cantidad, item.precio_unitario]
      );
    }

    await connection.commit(); // Confirmar transacción
    console.log(`Pedido creado con ID: ${pedidoId}`);

    // Puedes retornar el pedido creado si es necesario, o simplemente un indicador de éxito
    // Para este ejemplo, solo confirmamos la creación
    return { id_pedido: pedidoId, userId, items, total, recomendaciones };

  } catch (error) {
    if (connection) {
      await connection.rollback(); // Revertir transacción en caso de error
    }
    console.error('Error al crear pedido en MySQL:', error);
    throw error; // Propagar el error
  } finally {
    if (connection) {
      connection.release(); // Liberar la conexión
    }
  }
};

// TODO: Implementar updatePedido para MySQL
export const updatePedido = async (id, pedidoData) => {
  // Lógica para actualizar en la base de datos MySQL
   console.log('Implementar updatePedido para MySQL', id, pedidoData);
  throw new Error('updatePedido no implementado para MySQL');
}; 