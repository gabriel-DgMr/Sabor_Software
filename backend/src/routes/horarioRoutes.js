import express from 'express';
import { horarioController } from '../controllers/horarioController.js';

const router = express.Router();

// Rutas para horarios
router.get('/fechas-disponibles', horarioController.getFechasDisponibles);
router.get('/disponibles', horarioController.getHorariosDisponibles);
router.get('/verificar', horarioController.checkDisponibilidad);

export default router; 