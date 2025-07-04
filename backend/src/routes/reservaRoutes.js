import express from 'express';
import { hacerReserva, checkDisponibilidad, getHorariosDisponibles, getHistorialReservas } from '../controllers/reservaController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Rutas para clientes
router.post('/hacerReserva', hacerReserva);
router.get('/horarios-disponibles', getHorariosDisponibles);
router.get('/disponibilidad', checkDisponibilidad);
router.get('/historial', authenticateToken, getHistorialReservas);

export default router; 