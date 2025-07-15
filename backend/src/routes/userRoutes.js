import express from 'express';
import * as userController from '../controllers/userController.js';
import { 
  authenticateToken, 
  checkUserActive, 
  checkUserType
} from '../middleware/auth.js';
import { 
  validateUserRegister 
} from '../middleware/validateRequest.js';

const router = express.Router();

// ===== RUTAS PÚBLICAS =====
router.get('/stats/public', userController.getPublicStats);

// ===== APLICAR MIDDLEWARE A TODAS LAS RUTAS PROTEGIDAS =====
router.use(authenticateToken);
router.use(checkUserActive);

// ===== RUTAS PROTEGIDAS - USUARIO AUTENTICADO =====
router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);
router.put('/change-password', userController.changePassword);

// ===== RUTAS PROTEGIDAS - SOLO ADMINISTRADORES =====
router.get('/', 
  checkUserType(['administrador']),
  userController.getAllUsers
);

router.get('/:id', 
  checkUserType(['administrador']),
  userController.getUserById
);

router.post('/', 
  checkUserType(['administrador']),
  validateUserRegister,
  userController.createUser
);

router.put('/:id', 
  checkUserType(['administrador']),
  userController.updateUser
);

router.put('/:id/toggle-active', 
  checkUserType(['administrador']),
  userController.toggleUserActive
);

router.delete('/:id', 
  checkUserType(['administrador']),
  userController.deleteUser
);

// ===== RUTAS DE GESTIÓN MASIVA =====
router.get('/recent/:limit?', 
  checkUserType(['administrador']),
  userController.getRecentUsers
);

router.get('/export/csv', 
  checkUserType(['administrador']),
  userController.exportUsers
);

router.post('/import/csv', 
  checkUserType(['administrador']),
  userController.importUsers
);

// ===== RUTAS DE AUDITORÍA =====
router.get('/:id/audit-log', 
  checkUserType(['administrador']),
  userController.getUserAuditLog
);

router.get('/:id/activity', 
  checkUserType(['administrador']),
  userController.getUserActivity
);

export default router; 