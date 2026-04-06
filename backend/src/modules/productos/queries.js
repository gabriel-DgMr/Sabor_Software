import { dbConfig } from "../../core/config/dbconfig.js";
import mysql from "mysql2/promise";

const pool = mysql.createPool(dbConfig);

// ======================= PRODUCOS QUERIES =======================
const buildProductosQuery = (filtros = {}, includeRatings = true) => {
  const idioma = filtros.idioma || "es";
  let sql = `
    SELECT p.id_producto, p.nombre_producto,
           COALESCE(pt.descripcion, p.descripcion_producto) AS descripcion_producto,
           p.descripcion_producto AS descripcion_original,
           p.precio_producto, p.imagen_producto, p.id_categoria AS id_categoria_producto,
           c.nombre_categoria, p.activo, p.calificacion AS calificacion_base, p.ventas, p.stock,
  `;
  if (includeRatings) {
    sql += `COALESCE(AVG(cp.calificacion), 0) AS calificacion_promedio, COUNT(cp.id_calificacion) AS total_calificaciones`;
  } else {
    sql += `p.calificacion AS calificacion_promedio, 0 AS total_calificaciones`;
  }
  sql += `
    FROM productos p 
    LEFT JOIN categorias c ON p.id_categoria = c.id_categoria 
    LEFT JOIN producto_traducciones pt ON pt.producto_id = p.id_producto AND pt.idioma = ?
  `;
  if (includeRatings)
    sql +=
      " LEFT JOIN calificaciones_productos cp ON cp.id_producto = p.id_producto ";
  sql += " WHERE p.activo = 1 ";

  const params = [idioma];
  if (filtros.categoria) {
    sql += " AND c.nombre_categoria = ?";
    params.push(filtros.categoria);
  }
  if (filtros.busqueda) {
    sql +=
      " AND (p.nombre_producto LIKE ? OR p.descripcion_producto LIKE ? OR pt.descripcion LIKE ?)";
    params.push(
      `%${filtros.busqueda}%`,
      `%${filtros.busqueda}%`,
      `%${filtros.busqueda}%`,
    );
  }
  sql += `
    GROUP BY p.id_producto, p.nombre_producto, p.descripcion_producto, pt.descripcion, 
             p.precio_producto, p.imagen_producto, p.id_categoria, c.nombre_categoria, 
             p.activo, p.calificacion, p.ventas, p.stock
  `;
  if (filtros.orden === "precio_asc") sql += " ORDER BY p.precio_producto ASC";
  else if (filtros.orden === "precio_desc")
    sql += " ORDER BY p.precio_producto DESC";
  else if (filtros.orden === "calificacion")
    sql += " ORDER BY calificacion_promedio DESC";
  else if (filtros.orden === "ventas") sql += " ORDER BY p.ventas DESC";
  if (filtros.limit) {
    sql += " LIMIT ?";
    params.push(Number(filtros.limit));
  }

  return { sql, params };
};

const buildProductoByIdQuery = (includeRatings = true) => {
  let sql = `
    SELECT p.id_producto, p.nombre_producto,
           COALESCE(pt.descripcion, p.descripcion_producto) AS descripcion_producto,
           p.precio_producto, p.imagen_producto, p.id_categoria AS id_categoria_producto,
           c.nombre_categoria, p.activo, p.calificacion AS calificacion_base, p.ventas, p.stock,
  `;
  if (includeRatings) {
    sql += `COALESCE(AVG(cp.calificacion), 0) AS calificacion_promedio, COUNT(cp.id_calificacion) AS total_calificaciones`;
  } else {
    sql += `p.calificacion AS calificacion_promedio, 0 AS total_calificaciones`;
  }
  sql += `
    FROM productos p
    LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
    LEFT JOIN producto_traducciones pt ON pt.producto_id = p.id_producto AND pt.idioma = ?
  `;
  if (includeRatings)
    sql +=
      " LEFT JOIN calificaciones_productos cp ON cp.id_producto = p.id_producto ";
  sql += `
    WHERE p.id_producto = ? AND p.activo = 1
    GROUP BY p.id_producto, p.nombre_producto, p.descripcion_producto, pt.descripcion, 
             p.precio_producto, p.imagen_producto, p.id_categoria, c.nombre_categoria, 
             p.activo, p.calificacion, p.ventas, p.stock
  `;
  return sql;
};

export const normalizeImagePath = (imagen) => {
  if (!imagen) return null;
  if (typeof imagen !== "string") {
    try {
      imagen = String(imagen);
    } catch {
      return null;
    }
  }
  let trimmed = imagen.trim().replace(/\\/g, "/");
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://"))
    return trimmed;
  if (trimmed.startsWith("/uploads/")) return trimmed;
  if (trimmed.startsWith("uploads/")) return `/${trimmed}`;
  if (trimmed.startsWith("productos/")) return `/uploads/${trimmed}`;
  return `/uploads/productos/${trimmed.replace(/^\/+/g, "")}`;
};

export const getAllProductosQuery = async (filtros = {}) => {
  const { sql, params } = buildProductosQuery(filtros, true);
  let rows;
  try {
    [rows] = await pool.query(sql, params);
  } catch (error) {
    if (
      error?.code === "ER_NO_SUCH_TABLE" &&
      String(error?.sqlMessage || "").includes("calificaciones_productos")
    ) {
      const fallback = buildProductosQuery(filtros, false);
      [rows] = await pool.query(fallback.sql, fallback.params);
    } else {
      throw error;
    }
  }
  return rows;
};

export const getProductoByIdQuery = async (id, idioma = "es") => {
  const sql = buildProductoByIdQuery(true);
  let rows;
  try {
    [rows] = await pool.query(sql, [idioma, id]);
  } catch (error) {
    if (
      error?.code === "ER_NO_SUCH_TABLE" &&
      String(error?.sqlMessage || "").includes("calificaciones_productos")
    ) {
      const fallback = buildProductoByIdQuery(false);
      [rows] = await pool.query(fallback, [idioma, id]);
    } else {
      throw error;
    }
  }
  return rows[0] || null;
};

export const createProductoQuery = async (data) => {
  const [result] = await pool.query(
    "INSERT INTO productos (nombre_producto, descripcion_producto, precio_producto, id_categoria, imagen_producto, calificacion, ventas, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      data.nombre_producto,
      data.descripcion_producto,
      data.precio_producto,
      data.id_categoria_producto,
      data.imagen_producto,
      data.calificacion || 0,
      data.ventas || 0,
      data.stock || 0,
    ],
  );
  return result.insertId;
};

export const updateProductoQuery = async (id, data) => {
  const fields = [];
  const params = [];

  const allowedFields = {
    nombre_producto: data.nombre_producto,
    descripcion_producto: data.descripcion_producto,
    precio_producto: data.precio_producto,
    id_categoria: data.id_categoria_producto,
    imagen_producto: data.imagen_producto,
    calificacion: data.calificacion,
    ventas: data.ventas,
    stock: data.stock,
  };

  for (const [key, value] of Object.entries(allowedFields)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      params.push(value);
    }
  }

  if (fields.length === 0) return true; // Nada que actualizar

  const sql = `UPDATE productos SET ${fields.join(", ")} WHERE id_producto = ?`;
  params.push(id);

  const [result] = await pool.query(sql, params);
  return result.affectedRows > 0;
};

export const deleteProductoQuery = async (id) => {
  const [result] = await pool.query(
    "UPDATE productos SET activo = 0 WHERE id_producto = ?",
    [id],
  );
  return result.affectedRows > 0;
};

export const upsertProductoTraduccionQuery = async (
  producto_id,
  idioma,
  descripcion,
) => {
  if (!descripcion) return;
  return await pool.query(
    "INSERT INTO producto_traducciones (producto_id, idioma, descripcion) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion)",
    [producto_id, idioma, descripcion],
  );
};

export const getProductoTraduccionesQuery = async (producto_id) => {
  const [rows] = await pool.query(
    "SELECT idioma, descripcion FROM producto_traducciones WHERE producto_id = ?",
    [producto_id],
  );
  return rows;
};

export const getProductosByCategoriaQuery = async (categoriaId) => {
  const [rows] = await pool.query(
    "SELECT *, id_categoria AS id_categoria_producto FROM productos WHERE id_categoria = ? AND activo = 1",
    [categoriaId],
  );
  return rows;
};

// ======================= CATEGORIAS QUERIES =======================
export const getAllCategoriasQuery = async (idioma = "es") => {
  const [rows] = await pool.query(
    `SELECT c.id_categoria, COALESCE(ct.nombre, c.nombre_categoria) as nombre_categoria,
            COALESCE(ct.descripcion, c.descripcion_categoria) as descripcion_categoria,
            c.fecha_creacion, c.fecha_modificacion
     FROM categorias c
     LEFT JOIN categoria_traducciones ct ON c.id_categoria = ct.categoria_id AND ct.idioma = ?
     ORDER BY c.id_categoria`,
    [idioma],
  );
  return rows;
};

export const getCategoriaByIdQuery = async (id, idioma = "es") => {
  const [rows] = await pool.query(
    `SELECT c.id_categoria, COALESCE(ct.nombre, c.nombre_categoria) as nombre_categoria,
            COALESCE(ct.descripcion, c.descripcion_categoria) as descripcion_categoria,
            c.fecha_creacion, c.fecha_modificacion
     FROM categorias c
     LEFT JOIN categoria_traducciones ct ON c.id_categoria = ct.categoria_id AND ct.idioma = ?
     WHERE c.id_categoria = ?`,
    [idioma, id],
  );
  return rows[0] || null;
};

// ======================= CALIFICACIONES QUERIES =======================
export const createOrUpdateCalificacionQuery = async (
  userId,
  productoId,
  pedidoId,
  calificacion,
  comentario,
) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [pedidoItems] = await connection.query(
      "SELECT dp.* FROM detalle_pedidos dp JOIN pedidos p ON dp.id_pedido = p.id_pedido WHERE p.id_pedido = ? AND p.id_usuario = ? AND dp.id_producto = ? AND p.id_estado = 3",
      [pedidoId, userId, productoId],
    );
    if (pedidoItems.length === 0)
      throw new Error(
        "No puedes calificar un producto que no has pedido o el pedido no está completado",
      );
    const [result] = await connection.query(
      "INSERT INTO calificaciones_productos (id_usuario, id_producto, id_pedido, calificacion, comentario) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE calificacion = VALUES(calificacion), comentario = VALUES(comentario), fecha_modificacion = CURRENT_TIMESTAMP",
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
  } finally {
    if (connection) connection.release();
  }
};

export const getCalificacionesByProductoQuery = async (
  productoId,
  limit,
  offset,
) => {
  const [rows] = await pool.query(
    `SELECT c.id_calificacion, c.calificacion, c.comentario, c.fecha_calificacion, u.nombre_usuario
     FROM calificaciones_productos c
     JOIN usuarios u ON c.id_usuario = u.id_usuario
     WHERE c.id_producto = ? ORDER BY c.fecha_calificacion DESC LIMIT ? OFFSET ?`,
    [productoId, limit, offset],
  );
  return rows;
};

export const getCalificacionUsuarioQuery = async (
  userId,
  productoId,
  pedidoId,
) => {
  const [rows] = await pool.query(
    "SELECT * FROM calificaciones_productos WHERE id_usuario = ? AND id_producto = ? AND id_pedido = ?",
    [userId, productoId, pedidoId],
  );
  return rows[0] || null;
};

export const getProductosParaCalificarQuery = async (userId) => {
  const [rows] = await pool.query(
    `SELECT DISTINCT p.id_pedido, p.fecha_pedido, pr.id_producto, pr.nombre_producto, pr.imagen_producto,
            dp.cantidad, dp.precio_unitario, c.calificacion as calificacion_actual, c.comentario as comentario_actual, c.id_calificacion
     FROM pedidos p
     JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
     JOIN productos pr ON dp.id_producto = pr.id_producto
     LEFT JOIN calificaciones_productos c ON (c.id_usuario = p.id_usuario AND c.id_producto = pr.id_producto AND c.id_pedido = p.id_pedido)
     WHERE p.id_usuario = ? AND p.id_estado = 3
     ORDER BY p.fecha_pedido DESC, pr.nombre_producto ASC`,
    [userId],
  );
  return rows;
};

export const getProductosParaCalificarPorPedidoQuery = async (
  userId,
  pedidoId,
) => {
  const [rows] = await pool.query(
    `SELECT p.id_pedido, p.fecha_pedido, pr.id_producto, pr.nombre_producto, pr.imagen_producto,
            dp.cantidad, dp.precio_unitario, c.calificacion AS calificacion_actual, c.comentario AS comentario_actual, c.id_calificacion
     FROM pedidos p
     JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
     JOIN productos pr ON dp.id_producto = pr.id_producto
     LEFT JOIN calificaciones_productos c ON (c.id_usuario = p.id_usuario AND c.id_producto = pr.id_producto AND c.id_pedido = p.id_pedido)
     WHERE p.id_usuario = ? AND p.id_estado = 3 AND p.id_pedido = ?
     ORDER BY pr.nombre_producto ASC`,
    [userId, pedidoId],
  );
  return rows;
};

export const getEstadisticasCalificacionQuery = async (productoId) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as total_calificaciones, AVG(calificacion) as promedio,
            COUNT(CASE WHEN calificacion = 5 THEN 1 END) as estrellas_5,
            COUNT(CASE WHEN calificacion = 4 THEN 1 END) as estrellas_4,
            COUNT(CASE WHEN calificacion = 3 THEN 1 END) as estrellas_3,
            COUNT(CASE WHEN calificacion = 2 THEN 1 END) as estrellas_2,
            COUNT(CASE WHEN calificacion = 1 THEN 1 END) as estrellas_1
     FROM calificaciones_productos WHERE id_producto = ?`,
    [productoId],
  );
  return rows[0] || null;
};

export const deleteCalificacionQuery = async (userId, calificacionId) => {
  const [result] = await pool.query(
    "DELETE FROM calificaciones_productos WHERE id_calificacion = ? AND id_usuario = ?",
    [calificacionId, userId],
  );
  if (result.affectedRows === 0)
    throw new Error(
      "Calificación no encontrada o no tienes permisos para eliminarla",
    );
  return { message: "Calificación eliminada exitosamente" };
};
