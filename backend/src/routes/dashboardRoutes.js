import express from "express";
import { dashboardController } from "../controllers/dashboardController.js";
import { authenticateToken, checkRole } from "../middleware/auth.js";

const router = express.Router();
// Dashboard metrics (protegido solo para admin/empleado)
router.get(
  "/metrics",
  authenticateToken,
  checkRole(["Administrador", "Empleado"]),
  dashboardController.getMetrics,
);

// Dashboard de ventas (protegido solo para admin/empleado)
router.get(
  "/sales",
  authenticateToken,
  checkRole(["Administrador", "Empleado"]),
  dashboardController.getSalesMetrics,
);

// Dashboard de empleados (protegido solo para admin)
router.get(
  "/employees",
  authenticateToken,
  checkRole(["Administrador"]),
  dashboardController.getEmployeeMetrics,
);

export default router;
