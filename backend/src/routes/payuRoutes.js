import express from "express";
import {
  crearOrdenPago,
  generarFormularioPago,
  consultarTransaccion,
  simularPago,
} from "../controllers/payuController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Crear orden de pago directo (requiere autenticación)
router.post("/orden", authenticateToken, crearOrdenPago);

// Generar datos para formulario de pago (requiere autenticación)
router.post("/formulario", authenticateToken, generarFormularioPago);

// Consultar estado de transacción (requiere autenticación)
router.get(
  "/consultar/:referenceCode",
  authenticateToken,
  consultarTransaccion,
);

// Simular pago (para modo simulación sin cuenta PayU)
router.get("/simulate", simularPago);

export default router;
