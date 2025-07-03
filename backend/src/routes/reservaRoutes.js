import express from 'express';
import { hacerReserva, getHorariosDisponibles, checkDisponibilidad } from '../controllers/reservaController.js';
import { authenticateToken, checkPermission } from '../middleware/auth.js';
import { validateReserva } from '../middleware/validateRequest.js';

const router = express.Router();

// Rutas públicas para verificar disponibilidad
router.get('/horarios-disponibles', getHorariosDisponibles);
router.get('/disponibilidad', checkDisponibilidad);

// Rutas protegidas con validaciones
router.post('/hacerReserva', 
    authenticateToken, 
    validateReserva,
    hacerReserva
);

// Rutas adicionales para gestión (solo admin/manager)
router.get('/', 
    authenticateToken, 
    checkPermission('read'),
    (req, res) => {
        // Implementar getAllReservas si es necesario
        res.status(501).json({ message: 'Función no implementada' });
    }
);

router.get('/:id', 
    authenticateToken, 
    checkPermission('read'),
    (req, res) => {
        // Implementar getReservaById si es necesario
        res.status(501).json({ message: 'Función no implementada' });
    }
);

router.put('/:id', 
    authenticateToken, 
    checkPermission('write'),
    validateReserva,
    (req, res) => {
        // Implementar updateReserva si es necesario
        res.status(501).json({ message: 'Función no implementada' });
    }
);

router.delete('/:id', 
    authenticateToken, 
    checkPermission('delete'),
    (req, res) => {
        // Implementar deleteReserva si es necesario
        res.status(501).json({ message: 'Función no implementada' });
    }
);

export default router; 