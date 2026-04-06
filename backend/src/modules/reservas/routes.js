import express from "express";
import { reservaController, horarioController } from "./controllers.js";
import {
  authenticateToken,
  checkPermission,
} from "../../core/middlewares/auth.js";

const router = express.Router();

// --- Rutas de Horarios ---
router.get(
  "/horarios/fechas-disponibles",
  horarioController.getFechasDisponibles,
);
router.get("/horarios/disponibles", horarioController.getHorariosDisponibles); // fusionada de /horarios-disponibles y /disponibles
router.get("/horarios/verificar", horarioController.checkDisponibilidad); // fusionada de /disponibilidad y /verificar

// --- Rutas de Reservas ---
router.post("/reservas/hacerReserva", reservaController.hacerReserva); // Público
router.get(
  "/reservas/historial",
  authenticateToken,
  reservaController.getHistorialReservas,
);

// Administración de Reservas
router.get(
  "/reservas/",
  authenticateToken,
  checkPermission("manage_reservations"),
  reservaController.getAllReservaciones,
);
router.post(
  "/reservas/",
  authenticateToken,
  checkPermission("manage_reservations"),
  reservaController.crearReservaAdmin,
);
router.put(
  "/reservas/:id",
  authenticateToken,
  checkPermission("manage_reservations"),
  reservaController.actualizarReservaAdmin,
);
router.get(
  "/reservas/fecha/:fecha",
  authenticateToken,
  checkPermission("manage_reservations"),
  reservaController.getReservacionesByFecha,
);
router.put(
  "/reservas/:id/estado",
  authenticateToken,
  checkPermission("manage_reservations"),
  reservaController.updateEstadoReservacion,
);
router.delete(
  "/reservas/:id",
  authenticateToken,
  checkPermission("delete"),
  reservaController.deleteReservacion,
);

export default router;
