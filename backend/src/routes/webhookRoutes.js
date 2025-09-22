import express from "express";
import {
  mercadopagoWebhook,
  payuWebhook,
} from "../controllers/webhookController.js";

const router = express.Router();

// Webhook PayU
router.post("/payu", payuWebhook);

// Webhook MercadoPago (mantener por compatibilidad)
router.post("/mercadopago", mercadopagoWebhook);

export default router;
