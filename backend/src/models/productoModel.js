import { dbConfig } from "../config/dbconfig.js";
import mysql from "mysql2/promise";

const pool = mysql.createPool(dbConfig);

const normalizeImagePath = (imagen) => {
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

const normalizeImagePath = (imagen) => {
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
      const idioma = filtros.idioma || "es";
      let sql = `
                SELECT 
                    p.id_producto,
                    p.nombre_producto,
                    COALESCE(pt.descripcion, p.descripcion_producto) AS descripcion_producto,
                    p.precio_producto,
                    p.imagen_producto,
                    p.id_categoria,
                    c.nombre_categoria,
                    p.activo,
                    p.calificacion AS calificacion_base,
                    p.ventas,
                    COALESCE(AVG(cp.calificacion), 0) AS calificacion_promedio,
                    COUNT(cp.id_calificacion) AS total_calificaciones
                FROM productos p 
                LEFT JOIN categorias c ON p.id_categoria = c.id_categoria 
                LEFT JOIN producto_traducciones pt ON pt.producto_id = p.id_producto AND pt.idioma = ?
                LEFT JOIN calificaciones_productos cp ON cp.id_producto = p.id_producto
                WHERE p.activo = 1
            `;
      const params = [idioma];
      // Filtro por categoría
      if (filtros.categoria) {
        sql += " AND c.nombre_categoria = ?";
        params.push(filtros.categoria);
      }
      // Filtro por búsqueda
      if (filtros.busqueda) {
        sql +=
          " AND (p.nombre_producto LIKE ? OR p.descripcion_producto LIKE ? OR pt.descripcion LIKE ?)";
        params.push(
          `%${filtros.busqueda}%`,
          `%${filtros.busqueda}%`,
          `%${filtros.busqueda}%`,
        );
      }
      // Ordenamiento
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

      const [rows] = await pool.query(sql, params);

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
      const [rows] = await pool.query(
        `
        SELECT 
          p.id_producto,
          p.nombre_producto,
          COALESCE(pt.descripcion, p.descripcion_producto) AS descripcion_producto,
          p.precio_producto,
          p.imagen_producto,
          p.id_categoria,
          c.nombre_categoria,
          p.activo,
          p.calificacion AS calificacion_base,
          p.ventas,
          COALESCE(AVG(cp.calificacion), 0) AS calificacion_promedio,
          COUNT(cp.id_calificacion) AS total_calificaciones
        FROM productos p
        LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
        LEFT JOIN producto_traducciones pt ON pt.producto_id = p.id_producto AND pt.idioma = ?
        LEFT JOIN calificaciones_productos cp ON cp.id_producto = p.id_producto
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
      `,
        [idioma, id],
      );

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
      } = productoData;

      const [result] = await pool.query(
        "INSERT INTO productos (nombre_producto, descripcion_producto, precio_producto, id_categoria, imagen_producto, calificacion, ventas) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          nombre_producto,
          descripcion_producto,
          precio_producto,
          id_categoria_producto,
          imagen_producto,
          calificacion,
          ventas,
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
      } = productoData;

      const [result] = await pool.query(
        "UPDATE productos SET nombre_producto = ?, descripcion_producto = ?, precio_producto = ?, id_categoria = ?, imagen_producto = ?, calificacion = ?, ventas = ? WHERE id_producto = ?",
        [
          nombre_producto,
          descripcion_producto,
          precio_producto,
          id_categoria_producto,
          imagen_producto,
          calificacion,
          ventas,
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
        "SELECT * FROM productos WHERE id_categoria = ? AND activo = 1",
        [categoriaId],
      );
      return rows;
    } catch (error) {
      throw new Error(
        "Error al obtener productos por categoría: " + error.message,
      );
    }
  },
};

// Get Productos by Categoria

export const getProductosByCategoria = async (categoria) => {
  const pool = mysql.createPool(dbConfig);
  const [rows] = await pool.query(
    "SELECT * FROM productos WHERE categoria = ?",
    [categoria],
  );
  return rows;
};

// Search Productos

export const searchProductos = async (searchTerm) => {
  const pool = mysql.createPool(dbConfig);
  const [rows] = await pool.query(
    "SELECT * FROM productos WHERE nombre LIKE ? OR descripcion LIKE ? OR ingredientes LIKE ?",
    [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`],
  );
  return rows;
};

// Update Producto Stock

export const updateProductoStock = async (id, cantidad) => {
  const pool = mysql.createPool(dbConfig);
  const [result] = await pool.query(
    "UPDATE productos SET cantidad = cantidad + ? WHERE id = ?",
    [cantidad, id],
  );
  return result.affectedRows;
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

export const productoTraduccionModel = {
  upsertProductoTraduccion,
};

export { normalizeImagePath };
