import express from 'express'
import * as authController from '../controllers/authController.js'
import * as clienteController from '../controllers/clienteController.js'
import { authenticateToken, checkRole } from '../middleware/auth.js'
import { validateRegister, validateLogin } from '../middleware/validateRequest.js'

const router = express.Router();

// Rutas públicas
router.post('/register', validateRegister, authController.registerUser);
router.post('/login', validateLogin, authController.loginUser);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password/:token', authController.verifyResetToken);
router.post('/reset-password/:token', authController.resetPassword);

// Rutas protegidas
router.post('/logout', authenticateToken, authController.logoutUser);
router.get('/perfil', authenticateToken, authController.getUserProfile);

// Ruta para obtener todos los clientes
router.get('/clientes' , clienteController.getAllClientes);

// Ruta para obtener un cliente
router.get('/cliente/:id' , clienteController.getClienteById);

// Ruta para actualizar un cliente
router.put('/actualizarcliente/:id' , clienteController.updateCliente);

// Ruta para eliminar un cliente
router.delete('/eliminarcliente/:id' , clienteController.deleteCliente);

export default router;
