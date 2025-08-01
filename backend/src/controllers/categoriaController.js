import { categoriaModel } from '../models/categoriaModel.js';

export const categoriaController = {
    // Obtener todas las categorías
    getAllCategorias: async (req, res) => {
        try {
            const categorias = await categoriaModel.getAllCategorias();
            res.json(categorias);
        } catch (error) {
            res.status(500).json({ 
                error: 'Error al obtener categorías',
                message: error.message 
            });
        }
    },

    // Obtener categoría por ID
    getCategoriaById: async (req, res) => {
        try {
            const { id } = req.params;
            const categoria = await categoriaModel.getCategoriaById(id);
            
            if (!categoria) {
                return res.status(404).json({ 
                    error: 'Categoría no encontrada' 
                });
            }

            res.json(categoria);
        } catch (error) {
            res.status(500).json({ 
                error: 'Error al obtener categoría',
                message: error.message 
            });
        }
    },

    // Obtener productos por categoría
    getProductosByCategoria: async (req, res) => {
        try {
            const { categoriaId } = req.params;
            const productos = await categoriaModel.getProductosByCategoria(categoriaId);
            res.json(productos);
        } catch (error) {
            res.status(500).json({ 
                error: 'Error al obtener productos por categoría',
                message: error.message 
            });
        }
    }
}; 