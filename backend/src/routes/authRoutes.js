import express from "express";

import * as authController from "../controllers/authController.js";
import * as usuarioController from "../controllers/usuarioController.js";
import {
  authenticateToken,
  checkRole,
  checkPermission,
  logAuthAttempt,
} from "../middleware/auth.js";
import {
  validateRegister,
  validateLogin,
  validateUpdateusuario,
} from "../middleware/validateRequest.js";
import { upload } from "../middleware/upload.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Middleware de logging para todas las rutas de auth
router.use(logAuthAttempt);

// Rutas públicas
router.post("/register", validateRegister, authController.registerUser);
router.post("/login", validateLogin, authController.loginUser);
router.post("/verify-email", authController.verifyEmailCode);
router.post("/resend-verification", authController.resendVerificationCode);
router.post("/forgot-password", authController.forgotPassword);
router.get("/reset-password/:token", authController.verifyResetToken);
router.post("/reset-password/:token", authController.resetPassword);

// Ruta para servir imagen de perfil directamente
router.get("/imagen-perfil/:filename", authenticateToken, (req, res) => {
  try {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, "../../public/uploads", filename);

    console.log("🔍 Sirviendo imagen:", filename);
    console.log("🔍 Ruta completa:", imagePath);
    console.log("🔍 ¿Existe?", fs.existsSync(imagePath));

    if (fs.existsSync(imagePath)) {
      res.sendFile(imagePath);
    } else {
      // Fallback a la carpeta raíz
      const fallbackPath = path.join(
        __dirname,
        "../../../public/uploads",
        filename,
      );
      console.log("🔍 Fallback ruta:", fallbackPath);
      console.log("🔍 Fallback ¿Existe?", fs.existsSync(fallbackPath));

      if (fs.existsSync(fallbackPath)) {
        res.sendFile(fallbackPath);
      } else {
        res.status(404).json({ error: "Imagen no encontrada" });
      }
    }
  } catch (error) {
    console.error("Error sirviendo imagen:", error);
    res.status(500).json({ error: "Error interno" });
  }
});

// Rutas protegidas
router.post("/logout", authenticateToken, authController.logoutUser);
router.get("/perfil", authenticateToken, authController.getUserProfile);

// Rutas para gestión de usuarios (solo Administrador)
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
    if (req.user.rol === "Administrador") {
      // Admin puede actualizar a cualquiera
      return checkPermission("manage_users")(req, res, next);
    }
    // Usuario solo puede actualizarse a sí mismo
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

// Rutas para gestión de roles
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
