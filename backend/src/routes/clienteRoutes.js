import express from 'express';
import * as userController from '../controllers/userController.js';
import * as clienteController from '../controllers/clienteController.js';
import { 
  authenticateToken, 
  checkUserActive, 
  checkUserType
} from '../middleware/auth.js';
import { 
  validateClienteRegister, 
  validateUpdateCliente 
} from '../middleware/validateRequest.js';

const router = express.Router();

// ===== RUTAS PÚBLICAS =====
router.get('/stats/public', userController.getClienteStats);

// ===== APLICAR MIDDLEWARE A TODAS LAS RUTAS PROTEGIDAS =====
router.use(authenticateToken);
router.use(checkUserActive);

// ===== RUTAS PROTEGIDAS - CLIENTE AUTENTICADO =====
router.get('/profile', 
  checkUserType(['cliente']), 
  clienteController.getClienteProfile
);

router.put('/profile', 
  checkUserType(['cliente']),
  clienteController.updateClienteProfile
);

// ===== RUTAS PROTEGIDAS - ADMINISTRADORES Y EMPLEADOS =====
router.get('/', 
  checkUserType(['administrador', 'empleado']),
  userController.getAllClientes
);

router.get('/:id', 
  checkUserType(['administrador', 'empleado']),
  userController.getClienteById
);

router.get('/search/:term', 
  checkUserType(['administrador', 'empleado']),
  userController.searchClientes
);

router.get('/stats/summary', 
  checkUserType(['administrador', 'empleado']),
  userController.getClienteStats
);

// ===== RUTAS PROTEGIDAS - SOLO ADMINISTRADORES =====
router.post('/', 
  checkUserType(['administrador']),
  validateClienteRegister,
  userController.createCliente
);

router.put('/:id', 
  checkUserType(['administrador']),
  validateUpdateCliente,
  userController.updateCliente
);

router.put('/:id/activate', 
  checkUserType(['administrador']),
  clienteController.activateCliente
);

router.put('/:id/deactivate', 
  checkUserType(['administrador']),
  clienteController.deactivateCliente
);

router.delete('/:id', 
  checkUserType(['administrador']),
  clienteController.deleteCliente
);

// ===== RUTAS DE GESTIÓN ESPECÍFICAS =====
router.get('/recent/:limit?', 
  checkUserType(['administrador']),
  clienteController.getRecentClientes
);

router.get('/search', 
  checkUserType(['administrador', 'empleado']),
  clienteController.searchClientes
);

export default router; 