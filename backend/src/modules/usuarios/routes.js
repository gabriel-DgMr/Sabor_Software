import express from "express";
import * as usuarioController from "./controllers.js";
import {
  authenticateToken,
  checkRole,
  checkPermission,
} from "../../core/middlewares/auth.js";
import { validateUpdateusuario } from "../../core/middlewares/validateRequest.js";
import { upload } from "../../core/middlewares/upload.js";

const router = express.Router();

// Gestión de usuarios (requiere permisos administrativos en lecturas generales)
router.get(
  "/usuarios",
  authenticateToken,
  checkRole(["Administrador"]),
  usuarioController.getAllusuarios,
);
router.get(
  "/usuario/:id",
  authenticateToken,
  checkPermission("manage_users"),
  usuarioController.getusuarioById,
);

router.put(
  "/actualizarusuario/:id",
  authenticateToken,
  (req, res, next) => {
    if (req.user.rol === "Administrador")
      return checkPermission("manage_users")(req, res, next);
    // Usuarios corrientes solo acceden a afectarse a ellos mismos
    return checkPermission("manage_users_own")(req, res, next);
  },
  upload.single("imagen_usuario"),
  validateUpdateusuario,
  usuarioController.updateusuario,
);

router.delete(
  "/eliminarusuario/:id",
  authenticateToken,
  checkRole(["Administrador"]),
  usuarioController.deleteusuario,
);

// Gestión de Roles (Administración)
router.get(
  "/roles",
  authenticateToken,
  checkRole(["Administrador"]),
  usuarioController.getAllRoles,
);
router.put(
  "/actualizar-rol/:id",
  authenticateToken,
  checkRole(["Administrador"]),
  usuarioController.actualizarRolUsuario,
);

export default router;
