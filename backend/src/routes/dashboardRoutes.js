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

export default router;
