import express from 'express';
import { productoController } from '../controllers/productoController.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../config/multerConfig.js';
import { processImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Rutas públicas
router.get('/', productoController.getAllProductos);
router.get('/:id', productoController.getProductoById);
router.get('/categoria/:categoriaId', productoController.getProductosByCategoria);

// Rutas protegidas con manejo de imágenes
router.post('/', 
    authenticateToken, 
    upload.single('imagen_producto'), 
    processImage, 
    productoController.createProducto
);

router.put('/:id', 
    authenticateToken, 
    upload.single('imagen_producto'), 
    processImage, 
    productoController.updateProducto
);

router.delete('/:id', authenticateToken, productoController.deleteProducto);

export default router; 