import { dbConfig } from '../config/dbconfig.js';
import mysql from 'mysql2/promise';

const pool = mysql.createPool(dbConfig);

export const categoriaModel = {
    // Obtener todas las categorías
    getAllCategorias: async () => {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM categorias'
            );
            return rows;
        } catch (error) {
            throw new Error('Error al obtener categorías: ' + error.message);
        }
    },

    // Obtener categoría por ID
    getCategoriaById: async (id) => {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM categorias WHERE id_categoria = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            throw new Error('Error al obtener categoría: ' + error.message);
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
                [categoriaId]
            );
            return rows;
        } catch (error) {
            throw new Error('Error al obtener productos por categoría: ' + error.message);
        }
    }
}; 