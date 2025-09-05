import express from "express";
import { productoController } from "../controllers/productoController.js";
import {
  authenticateToken,
  checkRole,
  checkPermission,
} from "../middleware/auth.js";
import { upload } from "../config/multerConfig.js";
import { processImage, cleanupFiles } from "../middleware/uploadMiddleware.js";
import { validateProducto } from "../middleware/validateRequest.js";
import { validateFileType, validateFileSize } from "../middleware/security.js";

const router = express.Router();

// Rutas públicas
router.get("/", productoController.getAllProductos);

// Rutas protegidas
router.get("/:id", authenticateToken, productoController.getProductoById);
router.get(
  "/categoria/:categoriaId",
  authenticateToken,
  productoController.getProductosByCategoria,
);

// Rutas protegidas con manejo de imágenes y validaciones
router.post(
  "/",
  authenticateToken,
  checkPermission("manage_products"),
  upload.single("imagen_producto"),
  validateFileType(["image/jpeg", "image/jpg", "image/png", "image/webp"]),
  validateFileSize(5), // 5MB
  processImage,
  validateProducto,
  cleanupFiles,
  productoController.createProducto,
);

router.put(
  "/:id",
  authenticateToken,
  checkPermission("manage_products"),
  upload.single("imagen_producto"),
  validateFileType(["image/jpeg", "image/jpg", "image/png", "image/webp"]),
  validateFileSize(5), // 5MB
  processImage,
  validateProducto,
  cleanupFiles,
  productoController.updateProducto,
);

router.delete(
  "/:id",
  authenticateToken,
  checkPermission("manage_products"),
  productoController.deleteProducto,
);

export default router;
