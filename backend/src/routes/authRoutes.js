import express from 'express';

import * as authController from '../controllers/authController.js';
import * as clienteController from '../controllers/clienteController.js';
import { authenticateToken, checkRole, checkPermission, logAuthAttempt } from '../middleware/auth.js';
import { 
  validateUserRegister, 
  validateClienteRegister, 
  validateLogin, 
  validateUpdateCliente 
} from '../middleware/validateRequest.js';

const router = express.Router();

// Middleware de logging para todas las rutas de auth
router.use(logAuthAttempt);

// ===== RUTAS PÚBLICAS =====
router.post('/register', validateUserRegister, authController.registerUser);
router.post('/login', validateLogin, authController.loginUser);
router.post('/verify-email', authController.verifyEmailCode);
router.post('/resend-verification', authController.resendVerificationCode);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password/:token', authController.verifyResetToken);
router.post('/reset-password/:token', authController.resetPassword);

// ===== APLICAR MIDDLEWARE A TODAS LAS RUTAS PROTEGIDAS =====
router.use(authenticateToken);

// ===== RUTAS PROTEGIDAS - USUARIO AUTENTICADO =====
router.post('/logout', authController.logoutUser);
router.get('/perfil', authController.getUserProfile);

// ===== RUTAS PROTEGIDAS - SOLO ADMINISTRADORES =====
router.get('/clientes', checkRole(['admin']), clienteController.getAllClientes);

router.get('/cliente/:id', 
  checkPermission('manage_users'),
  clienteController.getClienteById
);

router.post('/cliente', 
  checkRole(['admin']),
  validateClienteRegister,
  clienteController.createCliente
);

router.put('/actualizarcliente/:id', 
  checkPermission('manage_users'),
  validateUpdateCliente,
  clienteController.updateCliente
);

router.delete('/eliminarcliente/:id', 
  checkRole(['admin']), 
  clienteController.deleteCliente
);

export default router;
