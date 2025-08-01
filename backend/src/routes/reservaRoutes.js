import express from "express";
import {
  hacerReserva,
  getHorariosDisponibles,
  checkDisponibilidad,
  getHistorialReservas,
} from "../controllers/reservaController.js";
import { authenticateToken, checkPermission } from "../middleware/auth.js";
import { validateReserva } from "../middleware/validateRequest.js";

const router = express.Router();

// ===== RUTAS PÚBLICAS =====
router.get("/horarios-disponibles", getHorariosDisponibles);
router.get("/disponibilidad", checkDisponibilidad);
router.post("/hacerReserva", hacerReserva);

// ===== APLICAR MIDDLEWARE A TODAS LAS RUTAS PROTEGIDAS =====
router.use(authenticateToken);

// ===== RUTAS PROTEGIDAS - USUARIO AUTENTICADO =====
router.get("/historial", getHistorialReservas);

// ===== RUTAS PROTEGIDAS - GESTIÓN (ADMINISTRADORES) =====
router.get("/", checkPermission("read"), (req, res) => {
  // Implementar getAllReservas si es necesario
  res.status(501).json({ message: "Función no implementada" });
});

router.get("/:id", checkPermission("read"), (req, res) => {
  // Implementar getReservaById si es necesario
  res.status(501).json({ message: "Función no implementada" });
});

router.put("/:id", checkPermission("write"), validateReserva, (req, res) => {
  // Implementar updateReserva si es necesario
  res.status(501).json({ message: "Función no implementada" });
});

router.delete("/:id", checkPermission("delete"), (req, res) => {
  // Implementar deleteReserva si es necesario
  res.status(501).json({ message: "Función no implementada" });
});

export default router;
