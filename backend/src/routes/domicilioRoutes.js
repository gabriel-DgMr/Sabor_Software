import express from "express";
import {
  getHistorialDomicilios,
  getDomicilios // <-- nuevo controlador para empleados/admin
} from "../controllers/domicilioController.js";
import { authMiddleware, checkRole } from "../middleware/auth.js";

const router = express.Router();

// Ruta para que el cliente vea su propio historial de domicilios
router.get("/historial", authMiddleware, getHistorialDomicilios);

<<<<<<< HEAD
// Ruta para que empleados/administradores vean todos los domicilios
router.get(
  "/todos",
  authMiddleware,
  checkRole(["Empleado", "Administrador"]),
  getDomicilios
);

export default router;
=======
export default router;
>>>>>>> origin/develop
