import { dbConfig } from '../config/dbconfig.js';
import mysql from 'mysql2/promise';

const pool = mysql.createPool(dbConfig);

export const getPedidos = async (userId) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.id_pedido AS _id,
        p.total_pedido AS total,
        p.fecha_pedido AS createdAt,
        p.notas,
        GROUP_CONCAT(CONCAT(dp.cantidad, ' x ', pr.nombre_producto) SEPARATOR ', ') AS items_str
      FROM pedidos p
      JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
      JOIN productos pr ON dp.id_producto = pr.id_producto
      WHERE p.id_cliente = ?
      GROUP BY p.id_pedido
      ORDER BY p.fecha_pedido DESC
    `, [userId]);

    const pedidos = rows.map(row => ({
      _id: row._id,
      total: row.total,
      createdAt: row.createdAt,
      recomendaciones: row.notas,
      items: row.items_str ? row.items_str.split(', ') : []
    }));

    return pedidos;
  } catch (error) {
    console.error('Error al obtener pedidos de MySQL:', error);
    throw error;
  }
};

export const deletePedido = async (id) => {
  console.log('Implementar deletePedido para MySQL', id);
  throw new Error('deletePedido no implementado para MySQL');
};

export const createPedido = async ({ userId, items, total, recomendaciones }) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [pedidoResult] = await connection.query(
      'INSERT INTO pedidos (id_cliente, total_pedido, recomendaciones) VALUES (?, ?, ?)',
      [userId, total, recomendaciones]
    );

    const pedidoId = pedidoResult.insertId;

    for (const item of items) {
      await connection.query(
        'INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [pedidoId, item.id_producto, item.cantidad, item.precio_unitario]
      );
    }

    await connection.commit();
    console.log(`Pedido creado con ID: ${pedidoId}`);

    return { id_pedido: pedidoId, userId, items, total, recomendaciones };

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error al crear pedido en MySQL:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

export const updatePedido = async (id, pedidoData) => {
  console.log('Implementar updatePedido para MySQL', id, pedidoData);
  throw new Error('updatePedido no implementado para MySQL');
};

export const getCarritoByUser = async (userId) => {
  try {
    const [carrito] = await pool.query(
      'SELECT * FROM pedidos WHERE id_cliente = ? AND id_estado = 1 LIMIT 1',
      [userId]
    );
    if (carrito.length === 0) return null;
    const pedido = carrito[0];
    const [items] = await pool.query(
      `SELECT dp.id_detalle, dp.id_producto, p.nombre_producto, dp.cantidad, dp.precio_unitario, (dp.cantidad * dp.precio_unitario) as subtotal, p.imagen_producto
       FROM detalle_pedidos dp
       JOIN productos p ON dp.id_producto = p.id_producto
       WHERE dp.id_pedido = ?`,
      [pedido.id_pedido]
    );
    return { ...pedido, items };
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    throw error;
  }
};

export const createCarrito = async (userId) => {
  try {
    const [result] = await pool.query(
      'INSERT INTO pedidos (id_cliente, id_estado, total_pedido, metodo_pago) VALUES (?, 1, 0, \'efectivo\')',
      [userId]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error al crear carrito:', error);
    throw error;
  }
};

export const addOrUpdateProductoCarrito = async (userId, id_producto, cantidad) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [carrito] = await connection.query(
      'SELECT * FROM pedidos WHERE id_cliente = ? AND id_estado = 1 LIMIT 1',
      [userId]
    );
    let id_pedido;
    if (carrito.length === 0) {
      const [result] = await connection.query(
        'INSERT INTO pedidos (id_cliente, id_estado, total_pedido, metodo_pago) VALUES (?, 1, 0, \'efectivo\')',
        [userId]
      );
      id_pedido = result.insertId;
    } else {
      id_pedido = carrito[0].id_pedido;
    }
    const [prod] = await connection.query(
      'SELECT precio_producto FROM productos WHERE id_producto = ?',
      [id_producto]
    );
    if (prod.length === 0) throw new Error('Producto no encontrado');
    const precio_unitario = prod[0].precio_producto;
    const [detalle] = await connection.query(
      'SELECT * FROM detalle_pedidos WHERE id_pedido = ? AND id_producto = ?',
      [id_pedido, id_producto]
    );
    if (detalle.length === 0) {
      await connection.query(
        'INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
        [id_pedido, id_producto, cantidad, precio_unitario, cantidad * precio_unitario]
      );
    } else {
      await connection.query(
        'UPDATE detalle_pedidos SET cantidad = cantidad + ?, subtotal = (cantidad + ?) * precio_unitario WHERE id_pedido = ? AND id_producto = ?',
        [cantidad, cantidad, id_pedido, id_producto]
      );
    }
    await connection.commit();
    return id_pedido;
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error al agregar producto al carrito:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const updateCantidadProductoCarrito = async (userId, id_producto, cantidad) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [carrito] = await connection.query(
      'SELECT * FROM pedidos WHERE id_cliente = ? AND id_estado = 1 LIMIT 1',
      [userId]
    );
    if (carrito.length === 0) throw new Error('No hay carrito');
    const id_pedido = carrito[0].id_pedido;
    await connection.query(
      'UPDATE detalle_pedidos SET cantidad = ?, subtotal = ? * precio_unitario WHERE id_pedido = ? AND id_producto = ?',
      [cantidad, cantidad, id_pedido, id_producto]
    );
    await connection.commit();
    return id_pedido;
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error al modificar cantidad en el carrito:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const removeProductoCarrito = async (userId, id_producto) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [carrito] = await connection.query(
      'SELECT * FROM pedidos WHERE id_cliente = ? AND id_estado = 1 LIMIT 1',
      [userId]
    );
    if (carrito.length === 0) throw new Error('No hay carrito');
    const id_pedido = carrito[0].id_pedido;
    await connection.query(
      'DELETE FROM detalle_pedidos WHERE id_pedido = ? AND id_producto = ?',
      [id_pedido, id_producto]
    );
    await connection.commit();
    return id_pedido;
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error al eliminar producto del carrito:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const vaciarCarrito = async (userId) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [carrito] = await connection.query(
      'SELECT * FROM pedidos WHERE id_cliente = ? AND id_estado = 1 LIMIT 1',
      [userId]
    );
    if (carrito.length === 0) throw new Error('No hay carrito');
    const id_pedido = carrito[0].id_pedido;
    await connection.query(
      'DELETE FROM detalle_pedidos WHERE id_pedido = ?',
      [id_pedido]
    );
    await connection.commit();
    return id_pedido;
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error al vaciar el carrito:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const confirmarPedido = async (userId, id_empleado, metodo_pago) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [carrito] = await connection.query(
      'SELECT * FROM pedidos WHERE id_cliente = ? AND id_estado = 1 LIMIT 1',
      [userId]
    );
    if (carrito.length === 0) throw new Error('No hay carrito');
    const id_pedido = carrito[0].id_pedido;
    const [totalRow] = await connection.query(
      'SELECT SUM(subtotal) as total FROM detalle_pedidos WHERE id_pedido = ?',
      [id_pedido]
    );
    const total = totalRow[0].total || 0;
    await connection.query(
      'UPDATE pedidos SET id_estado = 4, id_empleado = ?, total_pedido = ?, metodo_pago = ? WHERE id_pedido = ?',
      [id_empleado, total, metodo_pago, id_pedido]
    );
    await connection.commit();
    return id_pedido;
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error al confirmar el pedido:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}; 