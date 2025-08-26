import { dbConfig } from "../config/dbconfig.js";
import mysql from "mysql2/promise";

const pool = mysql.createPool(dbConfig);

export const categoriaModel = {
  // Obtener todas las categorías con traducciones
  getAllCategorias: async (idioma = "es") => {
    try {
      const [rows] = await pool.query(
        `
                SELECT 
                    c.id_categoria,
                    COALESCE(ct.nombre, c.nombre_categoria) as nombre_categoria,
                    COALESCE(ct.descripcion, c.descripcion_categoria) as descripcion_categoria,
                    c.fecha_creacion,
                    c.fecha_modificacion
                FROM categorias c
                LEFT JOIN categoria_traducciones ct ON c.id_categoria = ct.categoria_id AND ct.idioma = ?
                ORDER BY c.id_categoria
            `,
        [idioma],
      );
      return rows;
    } catch (error) {
      throw new Error("Error al obtener categorías: " + error.message);
    }
  },

  // Obtener categoría por ID con traducción
  getCategoriaById: async (id, idioma = "es") => {
    try {
      const [rows] = await pool.query(
        `
                SELECT 
                    c.id_categoria,
                    COALESCE(ct.nombre, c.nombre_categoria) as nombre_categoria,
                    COALESCE(ct.descripcion, c.descripcion_categoria) as descripcion_categoria,
                    c.fecha_creacion,
                    c.fecha_modificacion
                FROM categorias c
                LEFT JOIN categoria_traducciones ct ON c.id_categoria = ct.categoria_id AND ct.idioma = ?
                WHERE c.id_categoria = ?
            `,
        [idioma, id],
      );
      return rows[0];
    } catch (error) {
      throw new Error("Error al obtener categoría: " + error.message);
    }
  },

  // Obtener productos por categoría
  getProductosByCategoria: async (categoriaId) => {
    try {
      const [rows] = await pool.query(
        `SELECT p.* 
                FROM productos p 
                INNER JOIN categorias c ON p.id_categoria = c.id_categoria 
                WHERE c.id_categoria = ? AND p.activo = 1`,
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
