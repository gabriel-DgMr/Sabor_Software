import express from 'express';
import { hacerReserva, checkDisponibilidad, getHorariosDisponibles } from '../controllers/reservaController.js';

const router = express.Router();

// Rutas para clientes
router.post('/hacerReserva', hacerReserva);
router.get('/horarios-disponibles', getHorariosDisponibles);
router.get('/disponibilidad', checkDisponibilidad);

export default router; 