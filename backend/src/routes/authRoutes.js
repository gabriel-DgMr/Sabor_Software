import express from 'express';

import * as authController from '../controllers/authController.js';
import * as clienteController from '../controllers/clienteController.js';
import { authenticateToken, checkRole, checkPermission, logAuthAttempt } from '../middleware/auth.js';
import { validateRegister, validateLogin, validateUpdateCliente } from '../middleware/validateRequest.js';

const router = express.Router();

// Middleware de logging para todas las rutas de auth
router.use(logAuthAttempt);

// Rutas públicas
router.post('/register', validateRegister, authController.registerUser);
router.post('/login', validateLogin, authController.loginUser);
router.post('/verify-email', authController.verifyEmailCode);
router.post('/resend-verification', authController.resendVerificationCode);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password/:token', authController.verifyResetToken);
router.post('/reset-password/:token', authController.resetPassword);

// Rutas protegidas
router.post('/logout', authenticateToken, authController.logoutUser);
router.get('/perfil', authenticateToken, authController.getUserProfile);

// Rutas para gestión de clientes (solo admin)
router.get('/clientes', 
  authenticateToken, 
  checkRole(['admin']), 
  clienteController.getAllClientes
);

router.get('/cliente/:id', 
  authenticateToken, 
  checkPermission('manage_users'),
  clienteController.getClienteById
);

router.put('/actualizarcliente/:id', 
  authenticateToken, 
  checkPermission('manage_users'),
  validateUpdateCliente,
  clienteController.updateCliente
);

router.delete('/eliminarcliente/:id', 
  authenticateToken, 
  checkRole(['admin']), 
  clienteController.deleteCliente
);

export default router;
