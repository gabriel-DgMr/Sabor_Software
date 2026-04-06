import express from "express";
import {
  getMetrics,
  getSalesMetrics,
  getEmployeeMetrics,
  getInventoryMetrics,
} from "./controllers.js";
import { authenticateToken, checkRole } from "../../core/middlewares/auth.js";

const router = express.Router();

// General metrics (admin/empleado)
router.get(
  "/metrics",
  authenticateToken,
  checkRole(["Administrador", "Empleado"]),
  getMetrics,
);

// Sales metrics (admin/empleado)
router.get(
  "/sales",
  authenticateToken,
  checkRole(["Administrador", "Empleado"]),
  getSalesMetrics,
);

// Employee metrics (admin only)
router.get(
  "/employees",
  authenticateToken,
  checkRole(["Administrador"]),
  getEmployeeMetrics,
);

// Inventory metrics (admin only)
router.get(
  "/inventory",
  authenticateToken,
  checkRole(["Administrador"]),
  getInventoryMetrics,
);

export default router;
