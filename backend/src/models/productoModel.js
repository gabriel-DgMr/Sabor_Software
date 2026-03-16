import { dbConfig } from "../config/dbconfig.js";
import mysql from "mysql2/promise";

const pool = mysql.createPool(dbConfig);

const buildProductosQuery = (filtros = {}, includeRatings = true) => {
  const idioma = filtros.idioma || "es";
  let sql = `
                SELECT 
                    p.id_producto,
                    p.nombre_producto,
                    COALESCE(pt.descripcion, p.descripcion_producto) AS descripcion_producto,
                    p.descripcion_producto AS descripcion_original,
                    p.precio_producto,
                    p.imagen_producto,
                    p.id_categoria AS id_categoria_producto,
                    c.nombre_categoria,
                    p.activo,
                    p.calificacion AS calificacion_base,
                    p.ventas,
            `;

  if (includeRatings) {
    sql += `
                    COALESCE(AVG(cp.calificacion), 0) AS calificacion_promedio,
                    COUNT(cp.id_calificacion) AS total_calificaciones
    `;
  } else {
    sql += `
                    p.calificacion AS calificacion_promedio,
                    0 AS total_calificaciones
    `;
  }

  sql += `
                FROM productos p 
                LEFT JOIN categorias c ON p.id_categoria = c.id_categoria 
                LEFT JOIN producto_traducciones pt ON pt.producto_id = p.id_producto AND pt.idioma = ?
  `;

  if (includeRatings) {
    sql += " LEFT JOIN calificaciones_productos cp ON cp.id_producto = p.id_producto ";
  }

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
        GROUP BY 
          p.id_producto,
          p.nombre_producto,
          p.descripcion_producto,
          pt.descripcion,
          p.precio_producto,
          p.imagen_producto,
          p.id_categoria,
          c.nombre_categoria,
          p.activo,
          p.calificacion,
          p.ventas
      `;

  if (filtros.orden === "precio_asc") {
    sql += " ORDER BY p.precio_producto ASC";
  } else if (filtros.orden === "precio_desc") {
    sql += " ORDER BY p.precio_producto DESC";
  } else if (filtros.orden === "calificacion") {
    sql += " ORDER BY calificacion_promedio DESC";
  } else if (filtros.orden === "ventas") {
    sql += " ORDER BY p.ventas DESC";
  } else {
    sql += " ORDER BY p.id_producto DESC";
  }

  return { sql, params };
};

const buildProductoByIdQuery = (includeRatings = true) => {
  let sql = `
        SELECT 
          p.id_producto,
          p.nombre_producto,
          COALESCE(pt.descripcion, p.descripcion_producto) AS descripcion_producto,
          p.precio_producto,
          p.imagen_producto,
          p.id_categoria AS id_categoria_producto,
          c.nombre_categoria,
          p.activo,
          p.calificacion AS calificacion_base,
          p.ventas,
  `;

  if (includeRatings) {
    sql += `
          COALESCE(AVG(cp.calificacion), 0) AS calificacion_promedio,
          COUNT(cp.id_calificacion) AS total_calificaciones
    `;
  } else {
    sql += `
          p.calificacion AS calificacion_promedio,
          0 AS total_calificaciones
    `;
  }

  sql += `
        FROM productos p
        LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
        LEFT JOIN producto_traducciones pt ON pt.producto_id = p.id_producto AND pt.idioma = ?
  `;

  if (includeRatings) {
    sql += " LEFT JOIN calificaciones_productos cp ON cp.id_producto = p.id_producto ";
  }

  sql += `
        WHERE p.id_producto = ? AND p.activo = 1
        GROUP BY 
          p.id_producto,
          p.nombre_producto,
          p.descripcion_producto,
          pt.descripcion,
          p.precio_producto,
          p.imagen_producto,
          p.id_categoria,
          c.nombre_categoria,
          p.activo,
          p.calificacion,
          p.ventas
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

  let trimmed = imagen.trim();

  if (!trimmed) return null;

  // Normalizar separadores de ruta
  trimmed = trimmed.replace(/\\/g, "/");

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("/uploads/")) {
    return trimmed;
  }

  if (trimmed.startsWith("uploads/")) {
    return `/${trimmed}`;
  }

  if (trimmed.startsWith("productos/")) {
    return `/uploads/${trimmed}`;
  }

  return `/uploads/productos/${trimmed.replace(/^\/+/g, "")}`;
};

export const productoModel = {
  // Obtener todos los productos con filtros
  getAllProductos: async (filtros = {}) => {
    try {
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

      // Agregar la ruta base a la imagen
      const productos = rows.map((producto) => {
        const {
          calificacion_base,
          calificacion_promedio,
          total_calificaciones,
          ...resto
        } = producto;

        const promedio = Number(
          calificacion_promedio ?? calificacion_base ?? 0,
        );
        const promedioValido = Number.isFinite(promedio) ? promedio : 0;

        return {
          ...resto,
          imagen_producto: normalizeImagePath(resto.imagen_producto),
          calificacion: promedioValido,
          calificacion_promedio: promedioValido,
          total_calificaciones: Number(total_calificaciones ?? 0),
        };
      });

      return productos;
    } catch (error) {
      console.error("Error en getAllProductos (model):", error);
      throw new Error("Error al obtener productos: " + error.message);
    }
  },

  // Obtener producto por ID
  getProductoById: async (id, idioma = "es") => {
    try {
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

      if (!rows[0]) return null;

      const {
        calificacion_base,
        calificacion_promedio,
        total_calificaciones,
        ...resto
      } = rows[0];

      const promedio = Number(calificacion_promedio ?? calificacion_base ?? 0);
      const promedioValido = Number.isFinite(promedio) ? promedio : 0;

      return {
        ...resto,
        imagen_producto: normalizeImagePath(resto.imagen_producto),
        calificacion: promedioValido,
        calificacion_promedio: promedioValido,
        total_calificaciones: Number(total_calificaciones ?? 0),
      };
    } catch (error) {
      throw new Error("Error al obtener producto: " + error.message);
    }
  },

  // Crear nuevo producto
  createProducto: async (productoData) => {
    try {
      const {
        nombre_producto,
        descripcion_producto,
        precio_producto,
        id_categoria_producto,
        imagen_producto,
        calificacion = 0, // Calificación de 1.0 a 5.0 (un decimal)
        ventas = 0, // Número de ventas
        stock = 0,
      } = productoData;

      const [result] = await pool.query(
        "INSERT INTO productos (nombre_producto, descripcion_producto, precio_producto, id_categoria, imagen_producto, calificacion, ventas, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          nombre_producto,
          descripcion_producto,
          precio_producto,
          id_categoria_producto,
          imagen_producto,
          calificacion,
          ventas,
          stock,
        ],
      );
      return result.insertId;
    } catch (error) {
      throw new Error("Error al crear producto: " + error.message);
    }
  },

  // Actualizar producto
  updateProducto: async (id, productoData) => {
    try {
      const {
        nombre_producto,
        descripcion_producto,
        precio_producto,
        id_categoria_producto,
        imagen_producto,
        calificacion, // Calificación de 1.0 a 5.0 (un decimal)
        ventas, // Número de ventas
        stock,
      } = productoData;

      const [result] = await pool.query(
        "UPDATE productos SET nombre_producto = ?, descripcion_producto = ?, precio_producto = ?, id_categoria = ?, imagen_producto = ?, calificacion = ?, ventas = ?, stock = ? WHERE id_producto = ?",
        [
          nombre_producto,
          descripcion_producto,
          precio_producto,
          id_categoria_producto,
          imagen_producto,
          calificacion,
          ventas,
          stock,
          id,
        ],
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Error al actualizar producto: " + error.message);
    }
  },

  // Eliminar producto (soft delete)
  deleteProducto: async (id) => {
    try {
      const [result] = await pool.query(
        "UPDATE productos SET activo = 0 WHERE id_producto = ?",
        [id],
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Error al eliminar producto: " + error.message);
    }
  },

  // Obtener productos por categoría
  getProductosByCategoria: async (categoriaId) => {
    try {
      const [rows] = await pool.query(
        "SELECT *, id_categoria AS id_categoria_producto FROM productos WHERE id_categoria = ? AND activo = 1",
        [categoriaId],
      );
      const productos = rows.map((producto) => ({
        ...producto,
        imagen_producto: producto.imagen_producto
          ? `/uploads/productos/${producto.imagen_producto}`
          : null,
      }));
      return productos;
    } catch (error) {
      throw new Error(
        "Error al obtener productos por categoría: " + error.message,
      );
    }
  },
};

// Funciones para traducciones de productos
const upsertProductoTraduccion = async (producto_id, idioma, descripcion) => {
  if (!descripcion) return;
  // Intenta actualizar, si no existe inserta
  const [result] = await pool.query(
    `INSERT INTO producto_traducciones (producto_id, idioma, descripcion)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion)`,
    [producto_id, idioma, descripcion],
  );
  return result;
};

// Obtener todas las traducciones de un producto
const getProductoTraducciones = async (producto_id) => {
  try {
    const [rows] = await pool.query(
      `SELECT idioma, descripcion FROM producto_traducciones WHERE producto_id = ?`,
      [producto_id],
    );
    return rows;
  } catch (error) {
    throw new Error("Error al obtener traducciones: " + error.message);
  }
};

export const productoTraduccionModel = {
  upsertProductoTraduccion,
  getProductoTraducciones,
};
