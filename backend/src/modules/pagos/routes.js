import express from "express";
import { authenticateToken } from "../../core/middlewares/auth.js";
import {
  crearOrdenPago,
  generarFormularioPago,
  consultarTransaccion,
  payuWebhook,
  mercadopagoWebhook,
} from "./controllers.js";

const router = express.Router();

// Rutas de pagos PayU
router.post("/orden", authenticateToken, crearOrdenPago);
router.post("/formulario", generarFormularioPago);
router.get("/transaccion/:referenceCode", consultarTransaccion);

// Webhooks
router.post("/webhook/payu", payuWebhook);
router.post("/webhook/mercadopago", mercadopagoWebhook);

export default router;
