import { dbConfig } from "../config/dbconfig.js";
import mysql from "mysql2/promise";

const pool = mysql.createPool(dbConfig);

// =====================
// Helpers de estados
// =====================
let cachedCartEstadoId = null;

const getCartEstadoId = async () => {
  // 1) Priorizar variable de entorno si viene definida y válida
  const envId = parseInt(process.env.CARRITO_ESTADO_ID, 10);
  if (!Number.isNaN(envId) && envId > 0) {
    return envId;
  }

  // 2) Usar caché en memoria para evitar consultas repetidas
  if (cachedCartEstadoId) return cachedCartEstadoId;

  try {
    // 3) Buscar por nombre en la tabla de estados (nombres comunes)
    const [rows] = await pool.query(
      `SELECT id_estado
       FROM estados
       WHERE LOWER(nombre_estado) IN ('carrito', 'carrito_activo', 'carrito de compras')
       ORDER BY id_estado ASC
       LIMIT 1`,
    );
    if (rows && rows.length) {
      cachedCartEstadoId = rows[0].id_estado;
      return cachedCartEstadoId;
    }
  } catch (error) {
    console.error("Error resolviendo ID de estado 'carrito':", error);
  }

  // 4) Fallback: asumir 1 como estado de carrito (convención más común en este proyecto)
  cachedCartEstadoId = 1;
  return cachedCartEstadoId;
};

// =====================
// PEDIDOS
// =====================

// Obtener pedidos de un usuario
export const getPedidos = async (userId) => {
  try {
    const carritoEstadoId = await getCartEstadoId();
    let query = `
      SELECT
        p.id_pedido AS id,
        p.total_pedido AS total,
        p.fecha_pedido AS createdAt,
        p.notas AS recomendaciones,
        p.recibido_cliente,
        e.nombre_estado AS estado,
        GROUP_CONCAT(CONCAT(dp.cantidad, ' x ', pr.nombre_producto) SEPARATOR ', ') AS items_str
      FROM pedidos p
      JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
      JOIN productos pr ON dp.id_producto = pr.id_producto
      JOIN estados e ON p.id_estado = e.id_estado
      WHERE p.id_estado != ?
    `;

    const params = [carritoEstadoId];
    if (userId) {
      query += " AND p.id_usuario = ?";
      params.push(userId);
    }

    query += " GROUP BY p.id_pedido ORDER BY p.fecha_pedido DESC";
    const [rows] = await pool.query(query, params);

    return rows.map((row) => ({
      id: row.id,
      total: row.total,
      createdAt: row.createdAt,
      estado: row.estado,
      recomendaciones: row.recomendaciones,
      recibido_cliente: row.recibido_cliente === 1,
      items: row.items_str ? row.items_str.split(", ") : [],
    }));
  } catch (error) {
    console.error("Error getPedidos:", error);
    throw error;
  }
};

// Obtener todos los pedidos (admin)
export const getAllPedidosForAdmin = async () => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.id_pedido AS id,
        u.nombre_usuario AS cliente,
        p.total_pedido AS total,
        p.fecha_pedido AS createdAt,
        p.notas AS recomendaciones,
        e.nombre_estado AS estado,
        p.tipo_servicio,
        p.direccion_entrega,
        p.detalle_direccion
      FROM pedidos p
      JOIN usuarios u ON p.id_usuario = u.id_usuario
      JOIN estados e ON p.id_estado = e.id_estado
      ORDER BY p.fecha_pedido DESC
    `);
    return rows;
  } catch (error) {
    console.error("Error getAllPedidosForAdmin:", error);
    throw error;
  }
};

// Obtener pedido por ID
export const getPedidoById = async (userId, pedidoId) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id_pedido AS id, p.total_pedido AS total, p.fecha_pedido AS createdAt,
              p.notas AS recomendaciones, p.recibido_cliente, e.nombre_estado AS estado,
              GROUP_CONCAT(CONCAT(dp.cantidad, ' x ', pr.nombre_producto) SEPARATOR ', ') AS items_str
       FROM pedidos p
       JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
       JOIN productos pr ON dp.id_producto = pr.id_producto
       JOIN estados e ON p.id_estado = e.id_estado
       WHERE p.id_pedido = ? AND p.id_usuario = ?
       GROUP BY p.id_pedido`,
      [pedidoId, userId],
    );

    if (!rows.length) return null;

    const row = rows[0];
    return {
      id: row.id,
      total: row.total,
      createdAt: row.createdAt,
      estado: row.estado,
      recomendaciones: row.recomendaciones,
      recibido_cliente: row.recibido_cliente === 1,
      items: row.items_str ? row.items_str.split(", ") : [],
    };
  } catch (error) {
    console.error("Error getPedidoById:", error);
    throw error;
  }
};

// =====================
// ACTUALIZAR ESTADO PEDIDO
// =====================
export const updatePedidoEstado = async (pedidoId, nuevoEstado) => {
  try {
    const [result] = await pool.query(
      "UPDATE pedidos SET id_estado = ? WHERE id_pedido = ?",
      [nuevoEstado, pedidoId],
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updatePedidoEstado:", error);
    throw error;
  }
};

// =====================
// CARRITO
// =====================
export const getCarritoByUser = async (userId) => {
  try {
    const carritoEstadoId = await getCartEstadoId();
    const [rows] = await pool.query(
      "SELECT * FROM pedidos WHERE id_usuario = ? AND id_estado = ? LIMIT 1",
      [userId, carritoEstadoId],
    );
    if (!rows.length) return null;

    const carrito = rows[0];
    const [items] = await pool.query(
      "SELECT * FROM detalle_pedidos WHERE id_pedido = ?",
      [carrito.id_pedido],
    );
    carrito.items = items.map((i) => ({
      id_producto: i.id_producto,
      cantidad: i.cantidad,
      precio_unitario: i.precio_unitario,
    }));
    return carrito;
  } catch (error) {
    console.error("Error getCarritoByUser:", error);
    throw error;
  }
};

export const createCarrito = async (userId) => {
  try {
    const carritoEstadoId = await getCartEstadoId();
    const [result] = await pool.query(
      "INSERT INTO pedidos (id_usuario, id_estado, total_pedido, recibido_cliente) VALUES (?, ?, 0, 0)",
      [userId, carritoEstadoId],
    );
    return result.insertId;
  } catch (error) {
    console.error("Error createCarrito:", error);
    throw error;
  }
};

export const addOrUpdateProducto = async (userId, id_producto, cantidad) => {
  try {
    const carrito = await getCarritoByUser(userId);
    if (!carrito) throw new Error("Carrito no encontrado");

    const [existing] = await pool.query(
      "SELECT * FROM detalle_pedidos WHERE id_pedido = ? AND id_producto = ?",
      [carrito.id_pedido, id_producto],
    );

    if (existing.length) {
      await pool.query(
        "UPDATE detalle_pedidos SET cantidad = cantidad + ? WHERE id_pedido = ? AND id_producto = ?",
        [cantidad, carrito.id_pedido, id_producto],
      );
    } else {
      await pool.query(
        "INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, (SELECT precio_producto FROM productos WHERE id_producto = ?))",
        [carrito.id_pedido, id_producto, cantidad, id_producto],
      );
    }

    return carrito.id_pedido;
  } catch (error) {
    console.error("Error addOrUpdateProducto:", error);
    throw error;
  }
};

export const updateCantidadProducto = async (userId, id_producto, cantidad) => {
  try {
    const carrito = await getCarritoByUser(userId);
    if (!carrito) throw new Error("Carrito no encontrado");

    await pool.query(
      "UPDATE detalle_pedidos SET cantidad = ? WHERE id_pedido = ? AND id_producto = ?",
      [cantidad, carrito.id_pedido, id_producto],
    );

    return carrito.id_pedido;
  } catch (error) {
    console.error("Error updateCantidadProducto:", error);
    throw error;
  }
};

export const removeProducto = async (userId, id_producto) => {
  try {
    const carrito = await getCarritoByUser(userId);
    if (!carrito) throw new Error("Carrito no encontrado");

    await pool.query(
      "DELETE FROM detalle_pedidos WHERE id_pedido = ? AND id_producto = ?",
      [carrito.id_pedido, id_producto],
    );

    return carrito.id_pedido;
  } catch (error) {
    console.error("Error removeProducto:", error);
    throw error;
  }
};

export const vaciar = async (userId) => {
  try {
    const carrito = await getCarritoByUser(userId);
    if (!carrito) throw new Error("Carrito no encontrado");

    await pool.query("DELETE FROM detalle_pedidos WHERE id_pedido = ?", [
      carrito.id_pedido,
    ]);
    return carrito.id_pedido;
  } catch (error) {
    console.error("Error vaciar:", error);
    throw error;
  }
};

// =====================
// CONFIRMAR PEDIDO
// =====================
export const confirmarPedido = async (
  userId,
  metodo_pago,
  tipo_servicio,
  direccion_entrega,
  detalle_direccion,
  referencia_pago,
  estado_pago,
  recomendaciones,
) => {
  try {
    const carrito = await getCarritoByUser(userId);
    if (!carrito) throw new Error("Carrito no encontrado");

    await pool.query(
      `UPDATE pedidos
       SET id_estado = 3,
           metodo_pago = ?,
           tipo_servicio = ?,
           direccion_entrega = ?,
           detalle_direccion = ?,
           referencia_pago = ?,
           estado_pago = ?,
           notas = ?
       WHERE id_pedido = ?`,
      [
        metodo_pago,
        tipo_servicio,
        direccion_entrega || null,
        detalle_direccion || null,
        referencia_pago || null,
        estado_pago || null,
        recomendaciones || null,
        carrito.id_pedido,
      ],
    );

    return carrito.id_pedido;
  } catch (error) {
    console.error("Error confirmarPedido:", error);
    throw error;
  }
};

// =====================
// ACTUALIZAR PEDIDO COMPLETO
// =====================
export const updatePedidoById = async (pedidoId, data) => {
  try {
    const {
      metodo_pago,
      tipo_servicio,
      direccion_entrega,
      detalle_direccion,
      referencia_pago,
      estado_pago,
      notas,
    } = data;

    const [result] = await pool.query(
      `UPDATE pedidos SET
        metodo_pago = ?,
        tipo_servicio = ?,
        direccion_entrega = ?,
        detalle_direccion = ?,
        referencia_pago = ?,
        estado_pago = ?,
        notas = ?
      WHERE id_pedido = ?`,
      [
        metodo_pago || null,
        tipo_servicio || null,
        direccion_entrega || null,
        detalle_direccion || null,
        referencia_pago || null,
        estado_pago || null,
        notas || null,
        pedidoId,
      ],
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updatePedidoById:", error);
    throw error;
  }
};

// =====================
// ELIMINAR PEDIDO
// =====================
export const deletePedidoById = async (pedidoId) => {
  try {
    await pool.query("DELETE FROM detalle_pedidos WHERE id_pedido = ?", [
      pedidoId,
    ]);
    const [result] = await pool.query(
      "DELETE FROM pedidos WHERE id_pedido = ?",
      [pedidoId],
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error deletePedidoById:", error);
    throw error;
  }
};

// =====================
// MARCAR PEDIDO COMO RECIBIDO
// =====================
export const marcarPedidoRecibido = async (userId, pedidoId) => {
  try {
    const [result] = await pool.query(
      "UPDATE pedidos SET recibido_cliente = 1 WHERE id_pedido = ? AND id_usuario = ?",
      [pedidoId, userId],
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error marcarPedidoRecibido:", error);
    throw error;
  }
};

export const updatePedidoEstadoPorPago = async (
  pedidoId,
  estadoPago,
  nuevoEstado,
) => {
  try {
    const [result] = await pool.query(
      `UPDATE pedidos
       SET estado_pago = ?, id_estado = ?
       WHERE id_pedido = ?`,
      [estadoPago, nuevoEstado, pedidoId],
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updatePedidoEstadoPorPago:", error);
    throw error;
  }
};

export const updatePedidoEstadoPorReferencia = async (
  referencia_pago,
  estado_pago,
  nuevoEstado,
) => {
  try {
    const [result] = await pool.query(
      `UPDATE pedidos
       SET estado_pago = ?, id_estado = ?
       WHERE referencia_pago = ?`,
      [estado_pago, nuevoEstado, referencia_pago],
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updatePedidoEstadoPorReferencia:", error);
    throw error;
  }
};
