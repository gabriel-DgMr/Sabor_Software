import express from "express";
import * as userController from "../controllers/userController.js";
import {
  authenticateToken,
  checkUserActive,
  checkUserType,
} from "../middleware/auth.js";
import { validateEmpleadoRegister } from "../middleware/validateRequest.js";

const router = express.Router();

// ===== APLICAR MIDDLEWARE A TODAS LAS RUTAS PROTEGIDAS =====
router.use(authenticateToken);
router.use(checkUserActive);

// ===== RUTAS PROTEGIDAS - EMPLEADO AUTENTICADO =====
router.get(
  "/profile",
  checkUserType(["empleado", "administrador"]),
  userController.getUserProfile,
);

router.put(
  "/profile",
  checkUserType(["empleado", "administrador"]),
  userController.updateUserProfile,
);

// ===== RUTAS PROTEGIDAS - SOLO ADMINISTRADORES =====
router.get(
  "/",
  checkUserType(["administrador"]),
  userController.getAllEmpleados,
);

router.get(
  "/:id",
  checkUserType(["administrador"]),
  userController.getEmpleadoById,
);

router.post(
  "/",
  checkUserType(["administrador"]),
  validateEmpleadoRegister,
  userController.createEmpleado,
);

router.put(
  "/:id",
  checkUserType(["administrador"]),
  userController.updateEmpleado,
);

router.put(
  "/:id/activate",
  checkUserType(["administrador"]),
  userController.toggleUserActive,
);

router.put(
  "/:id/deactivate",
  checkUserType(["administrador"]),
  userController.toggleUserActive,
);

router.delete(
  "/:id",
  checkUserType(["administrador"]),
  userController.deleteUser,
);

// ===== RUTAS DE GESTIÓN ESPECÍFICAS =====
router.get(
  "/search/:term",
  checkUserType(["administrador"]),
  userController.searchEmpleados,
);

router.get(
  "/stats/summary",
  checkUserType(["administrador"]),
  userController.getEmpleadoStats,
);

router.get(
  "/recent/:limit?",
  checkUserType(["administrador"]),
  userController.getRecentUsers,
);

// ===== RUTAS DE ROLES Y PERMISOS =====
router.get("/roles", checkUserType(["administrador"]), (req, res) => {
  res.status(501).json({
    message: "Funcionalidad de roles en desarrollo",
  });
});

router.put("/:id/role", checkUserType(["administrador"]), (req, res) => {
  res.status(501).json({
    message: "Funcionalidad de actualización de roles en desarrollo",
  });
});

export default router;
