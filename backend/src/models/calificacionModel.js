import mysql from "mysql2/promise";
import { dbConfig } from "../config/dbconfig.js";
import { normalizeImagePath } from "./productoModel.js";

const pool = mysql.createPool(dbConfig);

// Crear o actualizar una calificación
export const createOrUpdateCalificacion = async (
  userId,
  productoId,
  pedidoId,
  calificacion,
  comentario = null,
) => {
  let connection;
  try {
    connection = await pool.getConnection();

    // Verificar que el usuario haya pedido este producto en este pedido
    const [pedidoItems] = await connection.query(
      `
      SELECT dp.* FROM detalle_pedidos dp
      JOIN pedidos p ON dp.id_pedido = p.id_pedido
      WHERE p.id_pedido = ? AND p.id_usuario = ? AND dp.id_producto = ? AND p.id_estado = 3
    `,
      [pedidoId, userId, productoId],
    );

    if (pedidoItems.length === 0) {
      throw new Error(
        "No puedes calificar un producto que no has pedido o el pedido no está completado",
      );
    }

    // Insertar o actualizar calificación
    const [result] = await connection.query(
      `
      INSERT INTO calificaciones_productos (id_usuario, id_producto, id_pedido, calificacion, comentario)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        calificacion = VALUES(calificacion),
        comentario = VALUES(comentario),
        fecha_modificacion = CURRENT_TIMESTAMP
    `,
      [userId, productoId, pedidoId, calificacion, comentario],
    );

    return {
      id_calificacion: result.insertId || result.affectedRows,
      id_usuario: userId,
      id_producto: productoId,
      id_pedido: pedidoId,
      calificacion,
      comentario,
    };
  } catch (error) {
    console.error("Error al crear/actualizar calificación:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

// Obtener calificaciones de un producto
export const getCalificacionesByProducto = async (
  productoId,
  limit = 10,
  offset = 0,
) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        c.id_calificacion,
        c.calificacion,
        c.comentario,
        c.fecha_calificacion,
        u.nombre_usuario
      FROM calificaciones_productos c
      JOIN usuarios u ON c.id_usuario = u.id_usuario
      WHERE c.id_producto = ?
      ORDER BY c.fecha_calificacion DESC
      LIMIT ? OFFSET ?
    `,
      [productoId, limit, offset],
    );

    return rows;
  } catch (error) {
    console.error("Error al obtener calificaciones del producto:", error);
    throw error;
  }
};

// Obtener calificación de un usuario para un producto específico en un pedido
export const getCalificacionUsuario = async (userId, productoId, pedidoId) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT * FROM calificaciones_productos
      WHERE id_usuario = ? AND id_producto = ? AND id_pedido = ?
    `,
      [userId, productoId, pedidoId],
    );

    return rows[0] || null;
  } catch (error) {
    console.error("Error al obtener calificación del usuario:", error);
    throw error;
  }
};

// Obtener productos que el usuario puede calificar (de pedidos completados)
export const getProductosParaCalificar = async (userId) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT DISTINCT
        p.id_pedido,
        p.fecha_pedido,
        pr.id_producto,
        pr.nombre_producto,
        pr.imagen_producto,
        dp.cantidad,
        dp.precio_unitario,
        c.calificacion as calificacion_actual,
        c.comentario as comentario_actual,
        c.id_calificacion
      FROM pedidos p
      JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
      JOIN productos pr ON dp.id_producto = pr.id_producto
      LEFT JOIN calificaciones_productos c ON (c.id_usuario = p.id_usuario AND c.id_producto = pr.id_producto AND c.id_pedido = p.id_pedido)
      WHERE p.id_usuario = ? AND p.id_estado = 3
      ORDER BY p.fecha_pedido DESC, pr.nombre_producto ASC
    `,
      [userId],
    );

    // Agrupar por pedido
    const pedidosMap = new Map();

    rows.forEach((row) => {
      if (!pedidosMap.has(row.id_pedido)) {
        pedidosMap.set(row.id_pedido, {
          id_pedido: row.id_pedido,
          fecha_pedido: row.fecha_pedido,
          productos: [],
        });
      }

      pedidosMap.get(row.id_pedido).productos.push({
        id_producto: row.id_producto,
        nombre_producto: row.nombre_producto,
        imagen_producto: normalizeImagePath(row.imagen_producto),
        cantidad: row.cantidad,
        precio_unitario: row.precio_unitario,
        calificacion_actual: row.calificacion_actual,
        comentario_actual: row.comentario_actual,
        id_calificacion: row.id_calificacion,
        ya_calificado: !!row.calificacion_actual,
      });
    });

    return Array.from(pedidosMap.values());
  } catch (error) {
    console.error("Error al obtener productos para calificar:", error);
    throw error;
  }
};

// Obtener productos para calificar por pedido específico
export const getProductosParaCalificarPorPedido = async (userId, pedidoId) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        p.id_pedido,
        p.fecha_pedido,
        pr.id_producto,
        pr.nombre_producto,
        pr.imagen_producto,
        dp.cantidad,
        dp.precio_unitario,
        c.calificacion AS calificacion_actual,
        c.comentario AS comentario_actual,
        c.id_calificacion
      FROM pedidos p
      JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
      JOIN productos pr ON dp.id_producto = pr.id_producto
      LEFT JOIN calificaciones_productos c ON (
        c.id_usuario = p.id_usuario AND 
        c.id_producto = pr.id_producto AND 
        c.id_pedido = p.id_pedido
      )
      WHERE p.id_usuario = ? AND p.id_estado = 3 AND p.id_pedido = ?
      ORDER BY pr.nombre_producto ASC
    `,
      [userId, pedidoId],
    );

    return rows.map((row) => ({
      id_pedido: row.id_pedido,
      fecha_pedido: row.fecha_pedido,
      id_producto: row.id_producto,
      nombre_producto: row.nombre_producto,
      imagen_producto: normalizeImagePath(row.imagen_producto),
      cantidad: row.cantidad,
      precio_unitario: row.precio_unitario,
      calificacion_actual: row.calificacion_actual,
      comentario_actual: row.comentario_actual,
      id_calificacion: row.id_calificacion,
      ya_calificado: !!row.calificacion_actual,
    }));
  } catch (error) {
    console.error(
      "Error al obtener productos para calificar por pedido:",
      error,
    );
    throw error;
  }
};

// Obtener estadísticas de calificaciones de un producto
export const getEstadisticasCalificacion = async (productoId) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        COUNT(*) as total_calificaciones,
        AVG(calificacion) as promedio,
        COUNT(CASE WHEN calificacion = 5 THEN 1 END) as estrellas_5,
        COUNT(CASE WHEN calificacion = 4 THEN 1 END) as estrellas_4,
        COUNT(CASE WHEN calificacion = 3 THEN 1 END) as estrellas_3,
        COUNT(CASE WHEN calificacion = 2 THEN 1 END) as estrellas_2,
        COUNT(CASE WHEN calificacion = 1 THEN 1 END) as estrellas_1
      FROM calificaciones_productos
      WHERE id_producto = ?
    `,
      [productoId],
    );

    return rows[0];
  } catch (error) {
    console.error("Error al obtener estadísticas de calificación:", error);
    throw error;
  }
};

// Eliminar una calificación
export const deleteCalificacion = async (userId, calificacionId) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const [result] = await connection.query(
      `
      DELETE FROM calificaciones_productos 
      WHERE id_calificacion = ? AND id_usuario = ?
    `,
      [calificacionId, userId],
    );

    if (result.affectedRows === 0) {
      throw new Error(
        "Calificación no encontrada o no tienes permisos para eliminarla",
      );
    }

    return { message: "Calificación eliminada exitosamente" };
  } catch (error) {
    console.error("Error al eliminar calificación:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};
