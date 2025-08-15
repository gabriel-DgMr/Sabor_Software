import express from "express";
import { mercadopagoWebhook } from "../controllers/webhookController.js";

const router = express.Router();

// Webhook MercadoPago
router.post("/mercadopago", mercadopagoWebhook);

export default router;
