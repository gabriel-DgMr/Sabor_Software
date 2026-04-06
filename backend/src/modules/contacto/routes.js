import express from "express";
import * as contactoControllers from "./controllers.js";
import { authenticateTokenOptional } from "../../core/middlewares/auth.js";

const router = express.Router();

/**
 * @route POST /api/contacto
 * @desc Enviar un mensaje de contacto
 * @access Public (Opcionalmente autenticado)
 */
router.post(
  "/contacto",
  authenticateTokenOptional,
  contactoControllers.enviarMensajeContacto,
);

export default router;
