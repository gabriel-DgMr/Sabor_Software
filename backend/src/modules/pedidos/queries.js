import { dbConfig } from "../../core/config/dbconfig.js";
import mysql from "mysql2/promise";

const pool = mysql.createPool(dbConfig);

// =====================
// CONSULTAS DE PEDIDOS
// =====================

/**
 * Obtener pedidos por ID de usuario
 */
export const getPedidosByUserIdQuery = async (userId) => {
  const query = `
    SELECT
      p.id_pedido AS id,
      p.total_pedido AS total,
      p.fecha_pedido AS createdAt,
      p.recomendaciones,
      p.recibido_cliente,
      e.nombre_estado AS estado,
      GROUP_CONCAT(CONCAT(dp.cantidad, ' x ', pr.nombre_producto) SEPARATOR ', ') AS items_str
    FROM pedidos p
    LEFT JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
    LEFT JOIN productos pr ON dp.id_producto = pr.id_producto
    JOIN estados e ON p.id_estado = e.id_estado
    WHERE p.id_usuario = ? AND p.id_estado != 1
    GROUP BY p.id_pedido
    ORDER BY p.fecha_pedido DESC
  `;
  const [rows] = await pool.query(query, [userId]);
  return rows;
};

/**
 * Obtener todos los pedidos (Admin)
 */
export const getAllPedidosQuery = async () => {
  const query = `
    SELECT
      p.id_pedido AS id,
      u.nombre_usuario AS cliente,
      p.total_pedido AS total,
      p.fecha_pedido AS createdAt,
      p.recomendaciones,
      e.nombre_estado AS estado,
      p.tipo_servicio,
      p.direccion_entrega,
      p.detalle_direccion,
      p.id_mesa AS mesa,
      GROUP_CONCAT(CONCAT(dp.cantidad, ' x ', pr.nombre_producto) SEPARATOR ', ') AS items_str
    FROM pedidos p
    JOIN usuarios u ON p.id_usuario = u.id_usuario
    JOIN estados e ON p.id_estado = e.id_estado
    LEFT JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
    LEFT JOIN productos pr ON dp.id_producto = pr.id_producto
    WHERE p.tipo_servicio = 'mesa' AND p.id_estado != 1
    GROUP BY p.id_pedido
    ORDER BY p.fecha_pedido DESC
  `;
  const [rows] = await pool.query(query);
  return rows;
};

/**
 * Obtener pedido por ID (Usuario específico)
 */
export const getPedidoByIdQuery = async (userId, pedidoId) => {
  const query = `
    SELECT 
      p.id_pedido AS id, 
      p.total_pedido AS total, 
      p.fecha_pedido AS createdAt,
      p.recomendaciones, 
      p.recibido_cliente, 
      e.nombre_estado AS estado,
      GROUP_CONCAT(CONCAT(dp.cantidad, ' x ', pr.nombre_producto) SEPARATOR ', ') AS items_str
    FROM pedidos p
    JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
    JOIN productos pr ON dp.id_producto = pr.id_producto
    JOIN estados e ON p.id_estado = e.id_estado
    WHERE p.id_pedido = ? AND p.id_usuario = ?
    GROUP BY p.id_pedido
  `;
  const [rows] = await pool.query(query, [pedidoId, userId]);
  return rows[0] || null;
};

/**
 * Obtener pedidos de tipo domicilio (Todos o por usuario)
 */
export const getDomiciliosQuery = async (userId = null) => {
  let query = `
    SELECT 
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
  `;

  const params = [];
  if (userId) {
    query += " AND p.id_usuario = ?";
    params.push(userId);
  }

  query += " GROUP BY p.id_pedido ORDER BY p.fecha_pedido DESC";

  const [rows] = await pool.query(query, params);
  return rows;
};

// =====================
// CONSULTAS DE CARRITO
// =====================

/**
 * Obtener carrito activo de un usuario
 */
export const getCarritoQuery = async (userId) => {
  const [rows] = await pool.query(
    "SELECT * FROM pedidos WHERE id_usuario = ? AND id_estado = 1 LIMIT 1",
    [userId],
  );
  if (rows.length === 0) return null;

  const pedido = rows[0];
  const [items] = await pool.query(
    `SELECT dp.id_detalle, dp.id_producto, p.nombre_producto, dp.cantidad, dp.precio_unitario, (dp.cantidad * dp.precio_unitario) as subtotal, p.imagen_producto, dp.mensaje
     FROM detalle_pedidos dp
     JOIN productos p ON dp.id_producto = p.id_producto
     WHERE dp.id_pedido = ?`,
    [pedido.id_pedido],
  );

  return { ...pedido, items };
};

/**
 * Crear un nuevo carrito
 */
export const createCarritoQuery = async (userId) => {
  const [result] = await pool.query(
    "INSERT INTO pedidos (id_usuario, id_estado, total_pedido, metodo_pago) VALUES (?, 1, 0, 'efectivo')",
    [userId],
  );
  return result.insertId;
};

/**
 * Buscar detalle de un producto en un pedido
 */
export const getDetallePedidoQuery = async (pedidoId, productoId) => {
  const [rows] = await pool.query(
    "SELECT * FROM detalle_pedidos WHERE id_pedido = ? AND id_producto = ?",
    [pedidoId, productoId],
  );
  return rows[0] || null;
};

// =====================
// MUTACIONES (INSERT/UPDATE/DELETE)
// =====================

export const insertDetallePedidoQuery = async (
  pedidoId,
  productoId,
  cantidad,
  precio = null,
  mensaje = null,
  conn = pool,
) => {
  if (precio !== null) {
    await conn.query(
      "INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario, mensaje) VALUES (?, ?, ?, ?, ?)",
      [pedidoId, productoId, cantidad, precio, mensaje],
    );
  } else {
    // Si no se pasa precio, el trigger before_detalle_pedido_insert en la BD se encargará de buscarlo.
    // Evitamos la subconsulta directa para prevenir errores de bloqueo de tabla en triggers (Error 1442).
    await conn.query(
      "INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, mensaje) VALUES (?, ?, ?, ?)",
      [pedidoId, productoId, cantidad, mensaje],
    );
  }
};

export const updateDetallePedidoCantidadQuery = async (
  pedidoId,
  productoId,
  cantidad,
  isRelative = true,
  conn = pool,
) => {
  const sql = isRelative
    ? "UPDATE detalle_pedidos SET cantidad = cantidad + ? WHERE id_pedido = ? AND id_producto = ?"
    : "UPDATE detalle_pedidos SET cantidad = ? WHERE id_pedido = ? AND id_producto = ?";
  await conn.query(sql, [cantidad, pedidoId, productoId]);
};

/**
 * Actualizar el mensaje/nota de un producto en el carrito
 */
export const updateDetallePedidoMensajeQuery = async (
  pedidoId,
  productoId,
  mensaje,
  conn = pool,
) => {
  await conn.query(
    "UPDATE detalle_pedidos SET mensaje = ? WHERE id_pedido = ? AND id_producto = ?",
    [mensaje, pedidoId, productoId],
  );
};

export const deleteDetallePedidoQuery = async (
  pedidoId,
  productoId = null,
  conn = pool,
) => {
  if (productoId) {
    await conn.query(
      "DELETE FROM detalle_pedidos WHERE id_pedido = ? AND id_producto = ?",
      [pedidoId, productoId],
    );
  } else {
    await conn.query("DELETE FROM detalle_pedidos WHERE id_pedido = ?", [
      pedidoId,
    ]);
  }
};

export const updatePedidoEstadoQuery = async (
  pedidoId,
  nuevoEstado,
  conn = pool,
) => {
  const [result] = await conn.query(
    "UPDATE pedidos SET id_estado = ? WHERE id_pedido = ?",
    [nuevoEstado, pedidoId],
  );
  return result.affectedRows > 0;
};

/**
 * Actualiza el estado de un pedido usando su referencia de pago (PayU)
 */
export const updatePedidoEstadoPorReferenciaQuery = async (
  referencia,
  nuevoEstado,
  conn = pool,
) => {
  const [result] = await conn.query(
    "UPDATE pedidos SET id_estado = ? WHERE referencia_pago = ?",
    [nuevoEstado, referencia],
  );
  return result.affectedRows > 0;
};

export const updatePedidoRecibidoQuery = async (
  pedidoId,
  userId,
  conn = pool,
) => {
  const [result] = await conn.query(
    "UPDATE pedidos SET recibido_cliente = 1 WHERE id_pedido = ? AND id_usuario = ?",
    [pedidoId, userId],
  );
  return result.affectedRows > 0;
};

export const deletePedidoQuery = async (pedidoId, conn = pool) => {
  const [result] = await conn.query("DELETE FROM pedidos WHERE id_pedido = ?", [
    pedidoId,
  ]);
  return result.affectedRows > 0;
};

export const confirmarPedidoQuery = async (pedidoId, data, conn = pool) => {
  const {
    metodo_pago,
    tipo_servicio,
    direccion_entrega,
    detalle_direccion,
    referencia_pago,
    recomendaciones,
    id_estado,
    id_mesa,
  } = data;

  const [result] = await conn.query(
    `UPDATE pedidos 
     SET metodo_pago = ?, tipo_servicio = ?, direccion_entrega = ?, detalle_direccion = ?, 
         referencia_pago = ?, recomendaciones = ?, id_estado = ?, id_mesa = ?
     WHERE id_pedido = ?`,
    [
      metodo_pago,
      tipo_servicio,
      direccion_entrega,
      detalle_direccion,
      referencia_pago,
      recomendaciones,
      id_estado,
      id_mesa,
      pedidoId,
    ],
  );
  return result.affectedRows > 0;
};

/**
 * Obtener items de un pedido para validación (con bloqueo)
 */
export const getItemsForUpdateQuery = async (pedidoId, conn = pool) => {
  const [rows] = await conn.query(
    "SELECT id_producto, cantidad FROM detalle_pedidos WHERE id_pedido = ?",
    [pedidoId],
  );
  return rows;
};

/**
 * Validar stock de un producto (con bloqueo)
 */
export const validateStockQuery = async (productoId, conn = pool) => {
  const [rows] = await conn.query(
    "SELECT stock, precio_producto FROM productos WHERE id_producto = ? FOR UPDATE",
    [productoId],
  );
  return rows[0] || null;
};
