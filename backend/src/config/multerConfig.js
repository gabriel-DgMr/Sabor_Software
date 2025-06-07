import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import fs from 'fs/promises';
import { categoriaModel } from '../models/categoriaModel.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Asegurar que el directorio de uploads exista
const ensureUploadDir = async (dirPath) => {
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
};

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            const uploadPath = path.join(__dirname, '../../../public/uploads/productos');
            await ensureUploadDir(uploadPath);
            cb(null, uploadPath);
        } catch (error) {
            cb(error);
        }
    },
    filename: async (req, file, cb) => {
        try {
            // Obtener la extensión del archivo original
            const ext = path.extname(file.originalname);
            
            // Obtener nombre del producto y categoría
            const nombreProducto = req.body.nombre_producto || 'producto';
            const categoriaId = req.body.id_categoria_producto;
            
            // Obtener el nombre de la categoría
            let nombreCategoria = 'categoria';
            if (categoriaId) {
                const categoria = await categoriaModel.getCategoriaById(categoriaId);
                if (categoria) {
                    nombreCategoria = categoria.nombre_categoria;
                }
            }
            
            // Limpiar nombres
            const limpiarNombre = (nombre) => {
                return nombre
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
                    .replace(/[^a-z0-9ñ]/g, '') // Mantener solo letras, números y ñ
                    .substring(0, 30);
            };
            
            const productoLimpio = limpiarNombre(nombreProducto);
            const categoriaLimpia = limpiarNombre(nombreCategoria);
            
            // Crear el nombre final del archivo
            const filename = `${productoLimpio}_${categoriaLimpia}${ext}`;
            
            cb(null, filename);
        } catch (error) {
            cb(error);
        }
    }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen'), false);
    }
};

// Función para renombrar el archivo después de crear el producto
export const renameProductImage = async (tempFilename, productId, categoriaNombre) => {
    try {
        const uploadPath = path.join(__dirname, '../../public/uploads/productos');
        const oldPath = path.join(uploadPath, tempFilename);
        const ext = path.extname(tempFilename);
        const newFilename = `Producto_${categoriaNombre}_${productId}${ext}`;
        const newPath = path.join(uploadPath, newFilename);

        // Verificar que el archivo temporal existe
        try {
            await fs.access(oldPath);
        } catch {
            throw new Error('Archivo temporal no encontrado');
        }

        await fs.rename(oldPath, newPath);
        return newFilename;
    } catch (error) {
        console.error('Error al renombrar la imagen:', error);
        throw error;
    }
};

// Configuración de Multer
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    }
});
