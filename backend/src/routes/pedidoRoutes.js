import express from 'express';
import { getPedidos, deletePedido, createPedido, updatePedido } from '../controllers/pedidoController.js';
import { authenticateToken, checkPermission } from '../middleware/auth.js';
import { validatePedido } from '../middleware/validateRequest.js';

const router = express.Router();

// Importar controladores de carrito
import {
  getCarrito,
  addProductoCarrito,
  updateCantidadCarrito,
  removeProducto,
  vaciar,
  confirmar,
  getPedidoById
} from '../controllers/pedidoController.js';

// ===== APLICAR MIDDLEWARE A TODAS LAS RUTAS PROTEGIDAS =====
router.use(authenticateToken);

// ===== RUTAS DE CARRITO =====
router.get('/carrito', getCarrito);
router.post('/carrito/add', addProductoCarrito);
router.put('/carrito/update', updateCantidadCarrito);
router.delete('/carrito/remove', removeProducto);
router.delete('/carrito/vaciar', vaciar);
router.post('/carrito/confirmar', confirmar);

// ===== RUTAS DE GESTIÓN DE PEDIDOS =====
router.post('/', 
  validatePedido,
  createPedido
);

router.get('/', 
  checkPermission('read'),
  getPedidos
);

router.get('/:id', 
  checkPermission('read'), 
  getPedidoById
);

router.put('/:id', 
  checkPermission('write'),
  validatePedido,
  updatePedido
);

router.delete('/:id', 
  checkPermission('delete'),
  deletePedido
);

export default router; 