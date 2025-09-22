import express from "express";
import {
  crearOActualizarCalificacion,
  obtenerCalificacionesProducto,
  obtenerProductosParaCalificar,
  obtenerCalificacionUsuario,
  eliminarCalificacion,
} from "../controllers/calificacionController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Crear o actualizar una calificación (requiere autenticación)
router.post("/", authenticateToken, crearOActualizarCalificacion);

// Obtener productos que el usuario puede calificar
router.get("/mis-productos", authenticateToken, obtenerProductosParaCalificar);

// Obtener calificación específica del usuario para un producto y pedido
router.get(
  "/usuario/:productoId/:pedidoId",
  authenticateToken,
  obtenerCalificacionUsuario,
);

// Obtener calificaciones de un producto (público)
router.get("/producto/:productoId", obtenerCalificacionesProducto);

// Eliminar una calificación
router.delete("/:calificacionId", authenticateToken, eliminarCalificacion);

export default router;
