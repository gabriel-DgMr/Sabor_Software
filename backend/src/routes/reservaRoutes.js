import express from "express";
import {
  hacerReserva,
  crearReservaAdmin,
  actualizarReservaAdmin,
  getHorariosDisponibles,
  checkDisponibilidad,
  getHistorialReservas,
  getAllReservaciones,
  getReservacionesByFecha,
  updateEstadoReservacion,
  deleteReservacion,
} from "../controllers/reservaController.js";
import { authenticateToken, checkPermission } from "../middleware/auth.js";
import { validateReserva } from "../middleware/validateRequest.js";

const router = express.Router();

// Rutas públicas para verificar disponibilidad
router.get("/horarios-disponibles", getHorariosDisponibles);
router.get("/disponibilidad", checkDisponibilidad);
router.get("/historial", authenticateToken, getHistorialReservas);

// Rutas protegidas con validaciones
router.post("/hacerReserva", hacerReserva);

// Ruta para crear reservas desde administración
router.post(
  "/",
  authenticateToken,
  checkPermission("manage_reservations"),
  crearReservaAdmin,
);

// Ruta para actualizar reservas desde administración
router.put(
  "/:id",
  authenticateToken,
  checkPermission("manage_reservations"),
  actualizarReservaAdmin,
);

// Rutas para administración de reservaciones
router.get(
  "/",
  authenticateToken,
  checkPermission("manage_reservations"),
  getAllReservaciones,
);
router.get(
  "/fecha/:fecha",
  authenticateToken,
  checkPermission("manage_reservations"),
  getReservacionesByFecha,
);
router.put(
  "/:id/estado",
  authenticateToken,
  checkPermission("manage_reservations"),
  updateEstadoReservacion,
);
router.delete(
  "/:id",
  authenticateToken,
  checkPermission("delete"),
  deleteReservacion,
);

export default router;
