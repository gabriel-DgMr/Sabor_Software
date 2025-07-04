import express from 'express';
import { getPedidos, deletePedido, createPedido, updatePedido } from '../controllers/pedidoController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/pedidos - Obtener todos los pedidos
// Añadir middleware authenticateToken para proteger esta ruta
router.get('/', authenticateToken, getPedidos);

// DELETE /api/pedidos/:id - Eliminar un pedido
router.delete('/:id', deletePedido);

// GET /api/pedidos/cerrados - Obtener todos los pedidos cerrados
//router.get('/cerrados', authenticateToken, getPedidosCerrados);

// POST /api/pedidos - Crear un nuevo pedido
router.post('/', authenticateToken, createPedido);

// PUT /api/pedidos/:id - Actualizar un pedido
router.put('/:id', updatePedido);

// === RUTAS DE CARRITO ===
import {
  getCarrito,
  addProductoCarrito,
  updateCantidadCarrito,
  removeProducto,
  vaciar,
  confirmar
} from '../controllers/pedidoController.js';

// Carrito: todas protegidas
router.get('/carrito', authenticateToken, getCarrito);
router.post('/carrito/add', authenticateToken, addProductoCarrito);
router.put('/carrito/update', authenticateToken, updateCantidadCarrito);
router.delete('/carrito/remove', authenticateToken, removeProducto);
router.delete('/carrito/vaciar', authenticateToken, vaciar);
router.post('/carrito/confirmar', authenticateToken, confirmar);

export default router; 