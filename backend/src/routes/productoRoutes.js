import express from "express";
import { productoController } from "../controllers/productoController.js";
import { authenticateToken, checkPermission } from "../middleware/auth.js";
import { upload } from "../config/multerConfig.js";
import { processImage, cleanupFiles } from "../middleware/uploadMiddleware.js";
import { validateProducto } from "../middleware/validateRequest.js";
import { validateFileType, validateFileSize } from "../middleware/security.js";

const router = express.Router();

// ===== RUTAS PÚBLICAS =====
router.get("/", productoController.getAllProductos);

// ===== APLICAR MIDDLEWARE A TODAS LAS RUTAS PROTEGIDAS =====
router.use(authenticateToken);

// ===== RUTAS PROTEGIDAS - LECTURA =====
router.get("/:id", productoController.getProductoById);
router.get(
  "/categoria/:categoriaId",
  productoController.getProductosByCategoria,
);

// ===== RUTAS PROTEGIDAS - GESTIÓN (ADMINISTRADORES) =====
router.post(
  "/",
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
  checkPermission("manage_products"),
  productoController.deleteProducto,
);

export default router;
