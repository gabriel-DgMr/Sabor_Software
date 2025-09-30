import { dbConfig } from "../config/dbconfig.js";
import { normalizeImagePath } from "./productoModel.js";
import mysql from "mysql2/promise";

const pool = mysql.createPool(dbConfig);

// =====================
// PEDIDOS
// =====================

// Obtener pedidos de un usuario
export const getPedidos = async (userId) => {
  try {
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
      WHERE p.id_estado != 1
    `;

    const params = [];
    if (userId) {
      query += " AND p.id_usuario = ?";
      params.push(userId);
    }

    query += " GROUP BY p.id_pedido ORDER BY p.fecha_pedido DESC";
    const [rows] = await pool.query(query, params);

    return rows.map(row => ({
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
      [pedidoId, userId]
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
      [nuevoEstado, pedidoId]
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
    const [rows] = await pool.query(
      "SELECT * FROM pedidos WHERE id_usuario = ? AND id_estado = 2 LIMIT 1",
      [userId]
    );
    if (carrito.length === 0) return null;
    const pedido = carrito[0];
    const [items] = await pool.query(
      `SELECT dp.id_detalle, dp.id_producto, p.nombre_producto, dp.cantidad, dp.precio_unitario, (dp.cantidad * dp.precio_unitario) as subtotal, p.imagen_producto
       FROM detalle_pedidos dp
       JOIN productos p ON dp.id_producto = p.id_producto
       WHERE dp.id_pedido = ?`,
      [pedido.id_pedido],
    );
    return { ...pedido, items };
  } catch (error) {
    console.error("Error getCarritoByUser:", error);
    throw error;
  }
};

export const createCarrito = async (userId, mesa = null) => {
  try {
    const [result] = await pool.query(
      "INSERT INTO pedidos (id_usuario, id_estado, total_pedido, metodo_pago) VALUES (?, 1, 0, NULL)",
      [userId],
    );
    return result.insertId;
  } catch (error) {
    console.error("Error createCarrito:", error);
    throw error;
  }
};

export const addOrUpdateProductoCarrito = async (
  userId,
  id_producto,
  cantidad,
) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Verificar stock y obtener precio actual (lock row for update)
    const [stockResult] = await connection.query(
      "SELECT stock, precio_producto FROM productos WHERE id_producto = ? FOR UPDATE",
      [id_producto],
    );
    if (stockResult.length === 0) {
      throw new Error("Producto no encontrado");
    }
    if (stockResult[0].stock < cantidad) {
      throw new Error("Stock insuficiente");
    }
    const precio_unitario = stockResult[0].precio_producto;

    // Buscar o crear carrito persistente
    const [carrito] = await connection.query(
      "SELECT * FROM pedidos WHERE id_usuario = ? AND id_estado = 1 LIMIT 1",
      [userId],
    );
    let id_pedido;
    if (carrito.length === 0) {
      const [result] = await connection.query(
        "INSERT INTO pedidos (id_usuario, id_estado, total_pedido, metodo_pago) VALUES (?, 1, 0, 'efectivo')",
        [userId],
      );
      id_pedido = result.insertId;
    } else {
      id_pedido = carrito[0].id_pedido;
    }

    // Agregar o actualizar producto en el carrito
    const [detalle] = await connection.query(
      "SELECT * FROM detalle_pedidos WHERE id_pedido = ? AND id_producto = ?",
      [carrito.id_pedido, id_producto]
    );

    if (existing.length) {
      await pool.query(
        "UPDATE detalle_pedidos SET cantidad = cantidad + ? WHERE id_pedido = ? AND id_producto = ?",
        [cantidad, carrito.id_pedido, id_producto]
      );
    } else {
      await pool.query(
        "INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, (SELECT precio_producto FROM productos WHERE id_producto = ?))",
        [carrito.id_pedido, id_producto, cantidad, id_producto]
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
      [cantidad, carrito.id_pedido, id_producto]
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
      [carrito.id_pedido, id_producto]
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

    await pool.query("DELETE FROM detalle_pedidos WHERE id_pedido = ?", [carrito.id_pedido]);
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
  direccion_entrega = null,
  detalle_direccion = null,
  referencia_pago = null,
  estado_pago = null,
  recomendaciones = null,
) => {
  let connection;
  try {
    console.log("🔄 ===== CONFIRMANDO PEDIDO EN MODELO =====");
    console.log("📋 Parámetros del modelo:", {
      userId,
      metodo_pago,
      tipo_servicio,
      direccion_entrega,
      detalle_direccion,
      referencia_pago,
      estado_pago,
      recomendaciones,
    });

    connection = await pool.getConnection();
    console.log("🔗 Conexión a BD obtenida");
    await connection.beginTransaction();
    console.log("📝 Transacción iniciada");

    const [carrito] = await connection.query(
      "SELECT * FROM pedidos WHERE id_usuario = ? AND id_estado = 1 LIMIT 1",
      [userId],
    );
    console.log("🛒 Carrito encontrado:", carrito.length > 0 ? "SÍ" : "NO");
    console.log("🛒 Datos del carrito:", carrito);

    if (carrito.length === 0) {
      console.error(
        "❌ No se encontró carrito activo para el usuario:",
        userId,
      );
      throw new Error("No hay carrito");
    }
    const id_pedido = carrito[0].id_pedido;
    console.log("🆔 ID del pedido a confirmar:", id_pedido);

    // Revalidar stock y precio de todos los productos antes de confirmar
    const [items] = await connection.query(
      "SELECT id_producto, cantidad FROM detalle_pedidos WHERE id_pedido = ?",
      [id_pedido],
    );
    for (const item of items) {
      const [stockResult] = await connection.query(
        "SELECT stock, precio_producto FROM productos WHERE id_producto = ? FOR UPDATE",
        [item.id_producto],
      );
      if (stockResult.length === 0) {
        throw new Error(`Producto con ID ${item.id_producto} no encontrado`);
      }
      if (stockResult[0].stock < item.cantidad) {
        throw new Error(
          `Stock insuficiente para el producto con ID ${item.id_producto}`,
        );
      }
    }

    // Determinar el estado del pedido
    const estadoFinal = estado_pago || 2; // Por defecto pendiente (2), puede ser pagado (3)
    console.log("📊 Estado final del pedido:", estadoFinal);

    // 🔹 Actualizar pedido con los datos extra
    console.log("📝 Actualizando pedido en BD...");
    const [updateResult] = await connection.query(
      `UPDATE pedidos 
       SET metodo_pago = ?, tipo_servicio = ?, direccion_entrega = ?, detalle_direccion = ?, 
           referencia_pago = ?, recomendaciones = ?, id_estado = ?
       WHERE id_pedido = ?`,
      [
        metodo_pago,
        tipo_servicio,
        direccion_entrega,
        detalle_direccion,
        referencia_pago,
        recomendaciones,
        estadoFinal,
        id_pedido,
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
    await pool.query("DELETE FROM detalle_pedidos WHERE id_pedido = ?", [pedidoId]);
    const [result] = await pool.query("DELETE FROM pedidos WHERE id_pedido = ?", [pedidoId]);
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
      [pedidoId, userId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error marcarPedidoRecibido:", error);
    throw error;
  }
};

export const updatePedidoEstadoPorPago = async (pedidoId, estadoPago, nuevoEstado) => {
  try {
    const [result] = await pool.query(
      `UPDATE pedidos
       SET estado_pago = ?, id_estado = ?
       WHERE id_pedido = ?`,
      [estadoPago, nuevoEstado, pedidoId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updatePedidoEstadoPorPago:", error);
    throw error;
  }
};

export const updatePedidoEstadoPorReferencia = async (referencia_pago, estado_pago, nuevoEstado) => {
  try {
    const [result] = await pool.query(
      `UPDATE pedidos
       SET estado_pago = ?, id_estado = ?
       WHERE referencia_pago = ?`,
      [estado_pago, nuevoEstado, referencia_pago]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updatePedidoEstadoPorReferencia:", error);
    throw error;
  }
};
