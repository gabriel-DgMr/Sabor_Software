import express from 'express';
import { getPedidos, deletePedido, createPedido, updatePedido } from '../controllers/pedidoController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/pedidos - Obtener todos los pedidos
// Añadir middleware authenticateToken para proteger esta ruta
router.get('/', authenticateToken, getPedidos);

// DELETE /api/pedidos/:id - Eliminar un pedido
router.delete('/:id', deletePedido);

// POST /api/pedidos - Crear un nuevo pedido
router.post('/', createPedido);

// PUT /api/pedidos/:id - Actualizar un pedido
router.put('/:id', updatePedido);

export default router; 