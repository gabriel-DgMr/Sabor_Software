// Actualizar estado del pedido por resultado de pago (usado por webhook)
export const updatePedidoEstadoPorPago = async (id_pedido, nuevoEstado) => {
  try {
    const [result] = await pool.query(
      "UPDATE pedidos SET id_estado = ? WHERE id_pedido = ?",
      [nuevoEstado, id_pedido],
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error al actualizar estado de pedido por pago:", error);
    throw error;
  }
};
import { dbConfig } from "../config/dbconfig.js";
import mysql from "mysql2/promise";

const pool = mysql.createPool(dbConfig);

export const getPedidos = async (userId) => {
  try {
    let query = `
      SELECT
        p.id_pedido AS _id,
        p.total_pedido AS total,
        p.fecha_pedido AS createdAt,
        p.notas,
        e.nombre_estado,
        GROUP_CONCAT(CONCAT(dp.cantidad, ' x ', pr.nombre_producto) SEPARATOR ', ') AS items_str
      FROM pedidos p
      JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
      JOIN productos pr ON dp.id_producto = pr.id_producto
      JOIN estados e ON p.id_estado = e.id_estado
      WHERE p.id_estado != 1`;
    const params = [];
    if (userId) {
      query += " AND p.id_usuario = ?";
      params.push(userId);
    }
    query += ` GROUP BY p.id_pedido ORDER BY p.fecha_pedido DESC`;
    const [rows] = await pool.query(query, params);
    const pedidos = rows.map((row) => ({
      _id: row._id,
      total: row.total,
      createdAt: row.createdAt,
      estado: row.nombre_estado,
      recomendaciones: row.notas,
      items: row.items_str ? row.items_str.split(", ") : [],
    }));
    return pedidos;
  } catch (error) {
    console.error("Error al obtener pedidos de MySQL:", error);
    throw error;
  }
};

export const deletePedido = async (id) => {
  try {
    const [result] = await pool.query(
      "UPDATE pedidos SET id_estado = 4 WHERE id_pedido = ?",
      [id],
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error al eliminar pedido:", error);
    throw error;
  }
};

export const createPedido = async ({
  userId,
  items,
  total,
  recomendaciones,
}) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Verificar stock antes de crear el pedido
    for (const item of items) {
      const [stockResult] = await connection.query(
        "SELECT stock FROM productos WHERE id_producto = ?",
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

    const [pedidoResult] = await connection.query(
      "INSERT INTO pedidos (id_usuario, id_estado, total_pedido, notas, metodo_pago) VALUES (?, 2, ?, ?, ?)",
      [userId, total, recomendaciones, "efectivo"],
    );

    const pedidoId = pedidoResult.insertId;

    for (const item of items) {
      await connection.query(
        "INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
        [pedidoId, item.id_producto, item.cantidad, item.precio_unitario],
      );
    }

    await connection.commit();
    console.log(`Pedido creado con ID: ${pedidoId}`);

    return { id_pedido: pedidoId, userId, items, total, recomendaciones };
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Error al crear pedido en MySQL:", error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

export const updatePedido = async (id, pedidoData) => {
  try {
    const { items, total } = pedidoData;
    let connection;

    connection = await pool.getConnection();
    await connection.beginTransaction();

    if (items && Array.isArray(items)) {
      // Eliminar items existentes
      await connection.query(
        "DELETE FROM detalle_pedidos WHERE id_pedido = ?",
        [id],
      );

      // Insertar nuevos items
      for (const item of items) {
        await connection.query(
          "INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
          [id, item.id_producto, item.cantidad, item.precio_unitario],
        );
      }
    }

    if (total) {
      await connection.query(
        "UPDATE pedidos SET total_pedido = ? WHERE id_pedido = ?",
        [total, id],
      );
    }

    await connection.commit();

    // Obtener el pedido actualizado
    const [pedidoResult] = await connection.query(
      "SELECT * FROM pedidos WHERE id_pedido = ?",
      [id],
    );

    return pedidoResult[0];
  } catch (error) {
    console.error("Error al actualizar pedido:", error);
    throw error;
  }
};

export const getCarritoByUser = async (userId) => {
  try {
    const [carrito] = await pool.query(
      "SELECT * FROM pedidos WHERE id_usuario = ? AND id_estado = 1 LIMIT 1",
      [userId],
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
    console.error("Error al obtener el carrito:", error);
    throw error;
  }
};

export const createCarrito = async (userId) => {
  try {
    const [result] = await pool.query(
      "INSERT INTO pedidos (id_usuario, id_estado, total_pedido, metodo_pago) VALUES (?, 1, 0, NULL)",
      [userId],
    );
    return result.insertId;
  } catch (error) {
    console.error("Error al crear carrito:", error);
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
      [id_pedido, id_producto],
    );
    if (detalle.length === 0) {
      await connection.query(
        "INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)",
        [
          id_pedido,
          id_producto,
          cantidad,
          precio_unitario,
          cantidad * precio_unitario,
        ],
      );
    } else {
      const nuevaCantidad = detalle[0].cantidad + cantidad;
      if (stockResult[0].stock < nuevaCantidad) {
        throw new Error("Stock insuficiente para la cantidad solicitada");
      }
      await connection.query(
        "UPDATE detalle_pedidos SET cantidad = ?, subtotal = ? * precio_unitario WHERE id_pedido = ? AND id_producto = ?",
        [nuevaCantidad, nuevaCantidad, id_pedido, id_producto],
      );
    }

    // Recalcular y actualizar el total del carrito
    const [totalRow] = await connection.query(
      "SELECT SUM(subtotal) as total FROM detalle_pedidos WHERE id_pedido = ?",
      [id_pedido],
    );
    const total = totalRow[0].total || 0;
    await connection.query(
      "UPDATE pedidos SET total_pedido = ? WHERE id_pedido = ?",
      [total, id_pedido],
    );

    await connection.commit();
    return id_pedido;
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error al agregar producto al carrito:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const updateCantidadProductoCarrito = async (
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

    const [carrito] = await connection.query(
      "SELECT * FROM pedidos WHERE id_usuario = ? AND id_estado = 1 LIMIT 1",
      [userId],
    );
    if (carrito.length === 0) throw new Error("No hay carrito");
    const id_pedido = carrito[0].id_pedido;

    await connection.query(
      "UPDATE detalle_pedidos SET cantidad = ?, precio_unitario = ?, subtotal = ? * ? WHERE id_pedido = ? AND id_producto = ?",
      [
        cantidad,
        precio_unitario,
        cantidad,
        precio_unitario,
        id_pedido,
        id_producto,
      ],
    );

    // Recalcular y actualizar el total del carrito
    const [totalRow] = await connection.query(
      "SELECT SUM(subtotal) as total FROM detalle_pedidos WHERE id_pedido = ?",
      [id_pedido],
    );
    const total = totalRow[0].total || 0;
    await connection.query(
      "UPDATE pedidos SET total_pedido = ? WHERE id_pedido = ?",
      [total, id_pedido],
    );

    await connection.commit();
    return id_pedido;
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error al modificar cantidad en el carrito:", error);
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
      "SELECT * FROM pedidos WHERE id_usuario = ? AND id_estado = 1 LIMIT 1",
      [userId],
    );
    if (carrito.length === 0) throw new Error("No hay carrito");
    const id_pedido = carrito[0].id_pedido;
    await connection.query(
      "DELETE FROM detalle_pedidos WHERE id_pedido = ? AND id_producto = ?",
      [id_pedido, id_producto],
    );

    // Recalcular y actualizar el total del carrito
    const [totalRow] = await connection.query(
      "SELECT SUM(subtotal) as total FROM detalle_pedidos WHERE id_pedido = ?",
      [id_pedido],
    );
    const total = totalRow[0].total || 0;
    await connection.query(
      "UPDATE pedidos SET total_pedido = ? WHERE id_pedido = ?",
      [total, id_pedido],
    );

    await connection.commit();
    return id_pedido;
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error al eliminar producto del carrito:", error);
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
      "SELECT * FROM pedidos WHERE id_usuario = ? AND id_estado = 1 LIMIT 1",
      [userId],
    );
    if (carrito.length === 0) throw new Error("No hay carrito");
    const id_pedido = carrito[0].id_pedido;
    await connection.query("DELETE FROM detalle_pedidos WHERE id_pedido = ?", [
      id_pedido,
    ]);
    // Actualizar total a 0
    await connection.query(
      "UPDATE pedidos SET total_pedido = 0 WHERE id_pedido = ?",
      [id_pedido],
    );
    await connection.commit();
    return id_pedido;
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error al vaciar el carrito:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const confirmarPedido = async (
  userId,
  metodo_pago,
  tipo_servicio,
  direccion_entrega = null,
  detalle_direccion = null,
) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [carrito] = await connection.query(
      "SELECT * FROM pedidos WHERE id_usuario = ? AND id_estado = 1 LIMIT 1",
      [userId],
    );
    if (carrito.length === 0) throw new Error("No hay carrito");
    const id_pedido = carrito[0].id_pedido;

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

    // 🔹 Actualizar pedido con los datos extra
    await connection.query(
      `UPDATE pedidos 
       SET metodo_pago = ?, tipo_servicio = ?, direccion_entrega = ?, detalle_direccion = ?, id_estado = 2 
       WHERE id_pedido = ?`,
      [
        metodo_pago,
        tipo_servicio,
        direccion_entrega,
        detalle_direccion,
        id_pedido,
      ],
    );

    await connection.commit();
    return id_pedido;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};
// Limpieza de carritos abandonados (puedes programar esto con un cron job externo)
export const limpiarCarritosAbandonados = async (horas = 24) => {
  try {
    const [result] = await pool.query(
      `DELETE FROM pedidos WHERE id_estado = 1 AND TIMESTAMPDIFF(HOUR, fecha_pedido, NOW()) > ?`,
      [horas],
    );
    return result.affectedRows;
  } catch (error) {
    console.error("Error al limpiar carritos abandonados:", error);
    throw error;
  }
};

export const getPedidoById = async (userId, pedidoId) => {
  try {
    const [pedidoRows] = await pool.query(
      "SELECT * FROM pedidos WHERE id_pedido = ? AND id_usuario = ? LIMIT 1",
      [pedidoId, userId],
    );
    if (pedidoRows.length === 0) return null;
    const pedido = pedidoRows[0];
    const [items] = await pool.query(
      `SELECT dp.id_detalle, dp.id_producto, p.nombre_producto, dp.cantidad, dp.precio_unitario, (dp.cantidad * dp.precio_unitario) as subtotal, p.imagen_producto
       FROM detalle_pedidos dp
       JOIN productos p ON dp.id_producto = p.id_producto
       WHERE dp.id_pedido = ?`,
      [pedido.id_pedido],
    );
    return { ...pedido, items };
  } catch (error) {
    console.error("Error al obtener el pedido por ID:", error);
    throw error;
  }
};

// Obtener todos los pedidos para administradores con información completa
export const getAllPedidosForAdmin = async () => {
  try {
    const query = `
      SELECT
        p.id_pedido,
        p.fecha_pedido,
        p.total_pedido,
        p.notas,
        p.tipo_servicio,
        p.direccion_entrega,
        p.detalle_direccion,
        e.nombre_estado,
        e.id_estado,
        u.nombre_usuario,
        u.telefono_usuario,
        m.id_mesa,
        GROUP_CONCAT(CONCAT(dp.cantidad, ' x ', pr.nombre_producto) SEPARATOR ', ') AS productos_str
      FROM pedidos p
      JOIN estados e ON p.id_estado = e.id_estado
      JOIN usuarios u ON p.id_usuario = u.id_usuario
      LEFT JOIN mesas m ON p.id_mesa = m.id_mesa
      LEFT JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
      LEFT JOIN productos pr ON dp.id_producto = pr.id_producto
      WHERE p.id_estado != 1
      GROUP BY p.id_pedido
      ORDER BY p.fecha_pedido DESC
    `;

    const [rows] = await pool.query(query);

    const pedidos = rows.map((row) => ({
      id: row.id_pedido,
      cliente: row.nombre_usuario,
      telefono: row.telefono_usuario,
      productos: row.productos_str || "Sin productos",
      hora: new Date(row.fecha_pedido).toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      mesa: row.id_mesa || "N/A",
      estado: row.nombre_estado.toLowerCase().replace(" ", "-"),
      id_estado: row.id_estado,
      total: row.total_pedido,
      notas: row.notas,
      tipo_servicio: row.tipo_servicio,
      direccion_entrega: row.direccion_entrega,
      detalle_direccion: row.detalle_direccion,
      fecha_pedido: row.fecha_pedido,
    }));

    return pedidos;
  } catch (error) {
    console.error("Error al obtener todos los pedidos para admin:", error);
    throw error;
  }
};

// Actualizar estado de un pedido
export const updatePedidoEstado = async (pedidoId, nuevoEstadoId) => {
  try {
    const [result] = await pool.query(
      "UPDATE pedidos SET id_estado = ? WHERE id_pedido = ?",
      [nuevoEstadoId, pedidoId],
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error al actualizar estado de pedido:", error);
    throw error;
  }
};
