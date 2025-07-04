import { dbConfig } from '../config/dbconfig.js';
import mysql from 'mysql2/promise';

const pool = mysql.createPool(dbConfig);

export const productoModel = {
    // Obtener todos los productos
    getAllProductos: async () => {
        try {
            console.log('Ejecutando consulta getAllProductos...');
            
            const query = `
                SELECT 
                    p.id_producto,
                    p.nombre_producto,
                    p.descripcion_producto,
                    p.precio_producto,
                    p.imagen_producto,
                    p.id_categoria,
                    c.nombre_categoria,
                    p.activo
                FROM productos p 
                LEFT JOIN categorias c ON p.id_categoria = c.id_categoria 
                WHERE p.activo = 1
                ORDER BY p.id_producto DESC
            `;
            
            console.log('Query SQL:', query);
            
            const [rows] = await pool.query(query);
            console.log('Número de productos encontrados:', rows.length);
            
            if (rows.length === 0) {
                console.log('No se encontraron productos activos');
            } else {
                console.log('Ejemplo de producto:', {
                    id: rows[0].id_producto,
                    nombre: rows[0].nombre_producto,
                    categoria: rows[0].nombre_categoria
                });
            }
            
            return rows;
        } catch (error) {
            console.error('Error en getAllProductos (model):', error);
            throw new Error('Error al obtener productos: ' + error.message);
        }
    },

    // Obtener producto por ID
    getProductoById: async (id) => {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM productos WHERE id_producto = ? AND activo = 1',
                [id]
            );
            return rows[0];
        } catch (error) {
            throw new Error('Error al obtener producto: ' + error.message);
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
                imagen_producto 
            } = productoData;

            const [result] = await pool.query(
                'INSERT INTO productos (nombre_producto, descripcion_producto, precio_producto, id_categoria, imagen_producto) VALUES (?, ?, ?, ?, ?)',
                [nombre_producto, descripcion_producto, precio_producto, id_categoria_producto, imagen_producto]
            );
            return result.insertId;
        } catch (error) {
            throw new Error('Error al crear producto: ' + error.message);
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
                imagen_producto 
            } = productoData;

            const [result] = await pool.query(
                'UPDATE productos SET nombre_producto = ?, descripcion_producto = ?, precio_producto = ?, id_categoria = ?, imagen_producto = ? WHERE id_producto = ?',
                [nombre_producto, descripcion_producto, precio_producto, id_categoria_producto, imagen_producto, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Error al actualizar producto: ' + error.message);
        }
    },

    // Eliminar producto (soft delete)
    deleteProducto: async (id) => {
        try {
            const [result] = await pool.query(
                'UPDATE productos SET activo = 0 WHERE id_producto = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Error al eliminar producto: ' + error.message);
        }
    },

    // Obtener productos por categoría
    getProductosByCategoria: async (categoriaId) => {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM productos WHERE id_categoria = ? AND activo = 1',
                [categoriaId]
            );
            return rows;
        } catch (error) {
            throw new Error('Error al obtener productos por categoría: ' + error.message);
        }
    }
};

// Get Productos by Categoria

export const getProductosByCategoria = async (categoria) => {
    const pool = mysql.createPool(dbConfig);
    const [rows] = await pool.query('SELECT * FROM productos WHERE categoria = ?', [categoria]);
    return rows;
};

// Search Productos

export const searchProductos = async (searchTerm) => {
    const pool = mysql.createPool(dbConfig);
    const [rows] = await pool.query(
        'SELECT * FROM productos WHERE nombre LIKE ? OR descripcion LIKE ? OR ingredientes LIKE ?',
        [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
    );
    return rows;
};

// Update Producto Stock

export const updateProductoStock = async (id, cantidad) => {
    const pool = mysql.createPool(dbConfig);
    const [result] = await pool.query(
        'UPDATE productos SET cantidad = cantidad + ? WHERE id = ?',
        [cantidad, id]
    );
    return result.affectedRows;
};
