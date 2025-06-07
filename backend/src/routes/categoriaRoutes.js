import express from 'express';
import { categoriaController } from '../controllers/categoriaController.js';

const router = express.Router();

// Rutas públicas
router.get('/', categoriaController.getAllCategorias);
router.get('/:id', categoriaController.getCategoriaById);
router.get('/:categoriaId/productos', categoriaController.getProductosByCategoria);

export default router; 