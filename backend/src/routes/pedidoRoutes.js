import express from 'express';
import { getPedidos, deletePedido, createPedido, updatePedido } from '../controllers/pedidoController.js';
import { authenticateToken, checkPermission } from '../middleware/auth.js';
import { validatePedido } from '../middleware/validateRequest.js';

const router = express.Router();

// Rutas protegidas con validaciones
router.post('/', 
    authenticateToken, 
    validatePedido,
    createPedido
);

router.get('/', 
    authenticateToken, 
    checkPermission('read'),
    getPedidos
);

router.get('/:id', 
    authenticateToken, 
    checkPermission('read'),
    (req, res) => {
        // Implementar getPedidoById si es necesario
        res.status(501).json({ message: 'Función no implementada' });
    }
);

router.put('/:id', 
    authenticateToken, 
    checkPermission('write'),
    validatePedido,
    updatePedido
);

router.delete('/:id', 
    authenticateToken, 
    checkPermission('delete'),
    deletePedido
);

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