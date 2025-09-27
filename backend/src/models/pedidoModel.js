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
// Helper: compatibilidad con columna recibido_cliente
// =====================
let cachedHasRecibidoCliente = null;

const hasRecibidoClienteColumn = async () => {
  if (cachedHasRecibidoCliente !== null) return cachedHasRecibidoCliente;
  try {
    const [rows] = await pool.query(
      `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'pedidos' AND COLUMN_NAME = 'recibido_cliente'
       LIMIT 1`,
      [dbConfig.database],
    );
    cachedHasRecibidoCliente = rows && rows.length > 0;
    return cachedHasRecibidoCliente;
  } catch (error) {
    console.warn(
      "No se pudo verificar columna 'recibido_cliente'. Asumiendo que no existe.",
    );
    cachedHasRecibidoCliente = false;
    return false;
  }
};

// =====================
// Helper genérico: detectar columnas opcionales por tabla (con caché)
// =====================
const columnExistenceCache = new Map();
const hasTableColumn = async (tableName, columnName) => {
  const cacheKey = `${tableName}.${columnName}`;
  if (columnExistenceCache.has(cacheKey))
    return columnExistenceCache.get(cacheKey);
  try {
    const [rows] = await pool.query(
      `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
       LIMIT 1`,
      [dbConfig.database, tableName, columnName],
    );
    const exists = rows && rows.length > 0;
    columnExistenceCache.set(cacheKey, exists);
    return exists;
  } catch (error) {
    console.warn(
      `No se pudo verificar columna '${columnName}' en '${tableName}'. Asumiendo que no existe.`,
    );
    columnExistenceCache.set(cacheKey, false);
    return false;
  }
};

// =====================
// PEDIDOS
// =====================

// Obtener pedidos de un usuario
export const getPedidos = async (userId) => {
  try {
    const carritoEstadoId = await getCartEstadoId();
    const includeRecibido = await hasRecibidoClienteColumn();
    const recibidoSelect = includeRecibido
      ? "p.recibido_cliente AS recibido_cliente,"
      : "0 AS recibido_cliente,";
    let query = `
      SELECT
        p.id_pedido AS id,
        p.total_pedido AS total,
        p.fecha_pedido AS createdAt,
        p.notas AS recomendaciones,
        ${recibidoSelect}
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
      recibido_cliente: Number(row.recibido_cliente) === 1,
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
    const includeRecibido = await hasRecibidoClienteColumn();
    const recibidoSelect = includeRecibido
      ? "p.recibido_cliente AS recibido_cliente,"
      : "0 AS recibido_cliente,";
    const [rows] = await pool.query(
      `SELECT p.id_pedido AS id, p.total_pedido AS total, p.fecha_pedido AS createdAt,
              p.notas AS recomendaciones, ${recibidoSelect} e.nombre_estado AS estado,
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
      recibido_cliente: Number(row.recibido_cliente) === 1,
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
    const includeRecibido = await hasRecibidoClienteColumn();
    let result;
    if (includeRecibido) {
      [result] = await pool.query(
        "INSERT INTO pedidos (id_usuario, id_estado, total_pedido, recibido_cliente) VALUES (?, ?, 0, 0)",
        [userId, carritoEstadoId],
      );
    } else {
      [result] = await pool.query(
        "INSERT INTO pedidos (id_usuario, id_estado, total_pedido) VALUES (?, ?, 0)",
        [userId, carritoEstadoId],
      );
    }
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
      // Evitar error 1442: no leer de 'productos' dentro del mismo INSERT que dispara triggers que actualizan 'productos'
      const [precioRows] = await pool.query(
        "SELECT precio_producto FROM productos WHERE id_producto = ?",
        [id_producto],
      );
      const precioUnitario =
        Array.isArray(precioRows) && precioRows.length
          ? precioRows[0].precio_producto
          : 0;
      await pool.query(
        "INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
        [carrito.id_pedido, id_producto, cantidad, precioUnitario],
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

    // Construir UPDATE dinámico según columnas disponibles
    const fields = ["id_estado = 3", "metodo_pago = ?", "tipo_servicio = ?"];
    const params = [metodo_pago, tipo_servicio];

    if (await hasTableColumn("pedidos", "direccion_entrega")) {
      fields.push("direccion_entrega = ?");
      params.push(direccion_entrega || null);
    }
    if (await hasTableColumn("pedidos", "detalle_direccion")) {
      fields.push("detalle_direccion = ?");
      params.push(detalle_direccion || null);
    }
    if (await hasTableColumn("pedidos", "referencia_pago")) {
      fields.push("referencia_pago = ?");
      params.push(referencia_pago || null);
    }
    if (await hasTableColumn("pedidos", "estado_pago")) {
      fields.push("estado_pago = ?");
      params.push(estado_pago || null);
    }
    if (await hasTableColumn("pedidos", "notas")) {
      fields.push("notas = ?");
      params.push(recomendaciones || null);
    }

    const sql = `UPDATE pedidos SET ${fields.join(", ")} WHERE id_pedido = ?`;
    params.push(carrito.id_pedido);

    await pool.query(sql, params);

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

    const fields = [];
    const params = [];
    if (await hasTableColumn("pedidos", "metodo_pago")) {
      fields.push("metodo_pago = ?");
      params.push(metodo_pago || null);
    }
    if (await hasTableColumn("pedidos", "tipo_servicio")) {
      fields.push("tipo_servicio = ?");
      params.push(tipo_servicio || null);
    }
    if (await hasTableColumn("pedidos", "direccion_entrega")) {
      fields.push("direccion_entrega = ?");
      params.push(direccion_entrega || null);
    }
    if (await hasTableColumn("pedidos", "detalle_direccion")) {
      fields.push("detalle_direccion = ?");
      params.push(detalle_direccion || null);
    }
    if (await hasTableColumn("pedidos", "referencia_pago")) {
      fields.push("referencia_pago = ?");
      params.push(referencia_pago || null);
    }
    if (await hasTableColumn("pedidos", "estado_pago")) {
      fields.push("estado_pago = ?");
      params.push(estado_pago || null);
    }
    if (await hasTableColumn("pedidos", "notas")) {
      fields.push("notas = ?");
      params.push(notas || null);
    }

    if (fields.length === 0) {
      return false;
    }

    const sql = `UPDATE pedidos SET ${fields.join(", ")} WHERE id_pedido = ?`;
    params.push(pedidoId);

    const [result] = await pool.query(sql, params);

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
    const includeRecibido = await hasRecibidoClienteColumn();
    if (!includeRecibido) {
      // Si la columna no existe, no hacer nada y considerar exitoso
      return true;
    }
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
