import express from 'express';
import { enviarMensajeContacto } from '../controllers/contactoController.js';
import { authenticateTokenOptional } from '../middleware/auth.js'; // Middleware que añade req.user si hay token, pero no obliga
import { contactoRateLimiter } from '../middleware/security.js';

const router = express.Router();

router.post('/contacto', contactoRateLimiter, authenticateTokenOptional, enviarMensajeContacto);

export default router;