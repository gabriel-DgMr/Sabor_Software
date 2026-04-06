import express from "express";
import * as authController from "./controllers.js";
import {
  authenticateToken,
  logAuthAttempt,
} from "../../core/middlewares/auth.js";
import {
  validateRegister,
  validateLogin,
} from "../../core/middlewares/validateRequest.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

router.use(logAuthAttempt);

// Rutas Públicas (Registro y recuperaciones)
router.post("/register", validateRegister, authController.registerUser);
router.post("/login", validateLogin, authController.loginUser);
router.post("/verify-email", authController.verifyEmailCode);
router.post("/resend-verification", authController.resendVerificationCode);
router.post("/forgot-password", authController.forgotPassword);
router.get("/reset-password/:token", authController.verifyResetToken);
router.post("/reset-password/:token", authController.resetPassword);

// Ruta para servir imagen de perfil (Mantener compatibilidad hasta usar S3/Bucket)
router.get("/imagen-perfil/:filename", authenticateToken, (req, res) => {
  const filename = req.params.filename;
  // Navega 4 directorios arriba: modules -> src -> backend -> public -> uploads
  // Anteriormente __dirname era en routes/, ahora es modules/auth/, sumamos una subida.
  const imagePath = path.join(__dirname, "../../../public/uploads", filename);

  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).json({ error: "Imagen no encontrada" });
  }
});

// Rutas Protegidas
router.post("/logout", authenticateToken, authController.logoutUser);
router.get("/perfil", authenticateToken, authController.getUserProfile);

export default router;
