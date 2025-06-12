import { productoModel } from '../models/productoModel.js';
import { categoriaModel } from '../models/categoriaModel.js';

export const productoController = {
// Obtener todos los productos
    getAllProductos: async (req, res) => {
        try {
            console.log('Obteniendo todos los productos...');
            console.log('Usuario autenticado:', req.user);
            
            const productos = await productoModel.getAllProductos();
            console.log('Productos obtenidos:', productos.length);
            console.log('Primer producto:', productos[0]);
            
            res.json(productos);
        } catch (error) {
            console.error('Error en getAllProductos:', error);
            res.status(500).json({ 
                message: 'Error al obtener los productos',
                error: error.message 
            });
        }
    },

// Obtener producto por ID
    getProductoById: async (req, res) => {
    try {
            const producto = await productoModel.getProductoById(req.params.id);
        if (!producto) {
                return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (error) {
            res.status(500).json({ message: error.message });
    }
    },

// Crear nuevo producto
    createProducto: async (req, res) => {
        try {
            console.log('Body recibido:', req.body);
            console.log('Archivo recibido:', req.file);

            const { 
                nombre_producto, 
                descripcion_producto, 
                precio_producto, 
                id_categoria_producto 
            } = req.body;
            
            // Validaciones
            if (!nombre_producto || !precio_producto || !id_categoria_producto) {
                return res.status(400).json({ 
                    error: 'Faltan campos requeridos',
                    recibidos: { nombre_producto, precio_producto, id_categoria_producto }
                });
            }

            // Validar que se haya subido una imagen
            if (!req.file) {
                return res.status(400).json({ message: 'La imagen es obligatoria' });
            }

            // Obtener el nombre de la categoría
            const categoria = await categoriaModel.getCategoriaById(id_categoria_producto);
            if (!categoria) {
                return res.status(400).json({ message: 'Categoría no encontrada' });
            }

            // Crear el producto con el nombre temporal de la imagen
            const productoData = {
                nombre_producto,
                descripcion_producto,
                precio_producto,
                id_categoria_producto,
                imagen_producto: req.file.filename
            };

            console.log('Nombre del archivo guardado en BD:', req.file.filename);
            console.log('Ruta completa del archivo:', req.file.path);

            console.log('Datos del producto a crear:', productoData);

            // Crear el producto en la base de datos
            const nuevoProductoId = await productoModel.createProducto(productoData);
            
            // Enviar respuesta exitosa
            res.status(201).json({ 
                message: 'Producto creado exitosamente',
                productoId: nuevoProductoId
            });

        } catch (error) {
            console.error('Error en createProducto:', error);
            res.status(500).json({ 
                message: 'Error interno del servidor',
                error: error.message 
            });
        }
    },

    // Actualizar producto
    updateProducto: async (req, res) => {
        try {
            const { 
                nombre_producto, 
                descripcion_producto, 
                precio_producto, 
                id_categoria_producto 
            } = req.body;

            // Validaciones
            if (!nombre_producto || !precio_producto || !id_categoria_producto) {
                return res.status(400).json({ 
                    error: 'Faltan campos requeridos' 
                });
            }

            if (isNaN(precio_producto) || precio_producto <= 0) {
                return res.status(400).json({ 
                    error: 'El precio debe ser un número positivo' 
                });
            }

            const productoData = {
                nombre_producto,
                descripcion_producto,
                precio_producto,
                id_categoria_producto
            };

            // Si se subió una nueva imagen, actualizar el nombre del archivo
            if (req.file) {
                productoData.imagen_producto = req.file.filename;
            }

            const success = await productoModel.updateProducto(req.params.id, productoData);
            
            if (!success) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }

            res.json({ message: 'Producto actualizado exitosamente' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Eliminar producto
    deleteProducto: async (req, res) => {
        try {
            const success = await productoModel.deleteProducto(req.params.id);
            
            if (!success) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }

            res.json({ message: 'Producto eliminado exitosamente' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

// Obtener productos por categoría
    getProductosByCategoria: async (req, res) => {
    try {
            const productos = await productoModel.getProductosByCategoria(req.params.categoriaId);
        res.json(productos);
    } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};