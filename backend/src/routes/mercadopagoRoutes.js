import express from 'express';
import { crearPreferencia } from '../controllers/mercadopagoController.js';

const router = express.Router();

router.post('/preferencia', crearPreferencia);

export default router; 