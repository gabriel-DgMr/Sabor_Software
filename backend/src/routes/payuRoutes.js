import express from "express";
import {
  crearOrdenPago,
  generarFormularioPago,
  consultarTransaccion,
} from "../controllers/payuController.js";

const router = express.Router();

// Crear orden de pago directo
router.post("/orden", crearOrdenPago);

// Generar datos para formulario de pago
router.post("/formulario", generarFormularioPago);

// Consultar estado de transacción
router.get("/consultar/:referenceCode", consultarTransaccion);

export default router;
