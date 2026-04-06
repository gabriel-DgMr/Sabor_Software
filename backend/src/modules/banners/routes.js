import express from "express";
import * as C from "./controllers.js";
import {
  authenticateToken,
  checkPermission,
} from "../../core/middlewares/auth.js";
import { upload, bannerUpload } from "../../core/config/multerConfig.js";
import {
  processImage,
  cleanupFiles,
} from "../../core/middlewares/uploadMiddleware.js";
import {
  validateFileType,
  validateFileSize,
} from "../../core/middlewares/security.js";

const router = express.Router();

// Rutas Públicas
router.get("/", C.getAllBanners);
router.get("/:id", C.getBannerById);

// Rutas Administrativas
router.post(
  "/",
  authenticateToken,
  checkPermission("manage_products"),
  bannerUpload.single("imagen_banner"),
  validateFileType(["image/jpeg", "image/jpg", "image/png", "image/webp"]),
  validateFileSize(5),
  // processImage, // Temporarily disabled for debugging
  // cleanupFiles,
  C.createBanner,
);

router.put(
  "/:id",
  authenticateToken,
  checkPermission("manage_products"),
  bannerUpload.single("imagen_banner"),
  validateFileType(["image/jpeg", "image/jpg", "image/png", "image/webp"]),
  validateFileSize(5),
  // processImage,
  // cleanupFiles,
  C.updateBanner,
);

router.delete(
  "/:id",
  authenticateToken,
  checkPermission("manage_products"),
  C.deleteBanner,
);

export default router;
