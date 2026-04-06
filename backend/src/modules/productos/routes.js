import express from "express";
import * as C from "./controllers.js";
import {
  authenticateToken,
  checkPermission,
} from "../../core/middlewares/auth.js";
import { upload } from "../../core/config/multerConfig.js";
import {
  processImage,
  cleanupFiles,
} from "../../core/middlewares/uploadMiddleware.js";
import { validateProducto } from "../../core/middlewares/validateRequest.js";
import {
  validateFileType,
  validateFileSize,
} from "../../core/middlewares/security.js";

// ======================================
// 1. RUTAS DE PRODUCTOS
// ======================================
export const productoRoutes = express.Router();

productoRoutes.get("/", C.getAllProductos);
productoRoutes.get("/:id", C.getProductoById);
productoRoutes.get("/:id/traducciones", C.getProductoTraducciones);
productoRoutes.get(
  "/categoria/:categoriaId",
  authenticateToken,
  C.getProductosByCategoria,
);

productoRoutes.post(
  "/",
  authenticateToken,
  checkPermission("manage_products"),
  upload.single("imagen_producto"),
  validateFileType(["image/jpeg", "image/jpg", "image/png", "image/webp"]),
  validateFileSize(5), // 5MB
  processImage,
  validateProducto,
  cleanupFiles,
  C.createProducto,
);

productoRoutes.put(
  "/:id",
  authenticateToken,
  checkPermission("manage_products"),
  upload.single("imagen_producto"),
  validateFileType(["image/jpeg", "image/jpg", "image/png", "image/webp"]),
  validateFileSize(5), // 5MB
  processImage,
  validateProducto,
  cleanupFiles,
  C.updateProducto,
);

productoRoutes.delete(
  "/:id",
  authenticateToken,
  checkPermission("manage_products"),
  C.deleteProducto,
);

// ======================================
// 2. RUTAS DE CATEGORIAS
// ======================================
export const categoriaRoutes = express.Router();

categoriaRoutes.get("/", C.getAllCategorias);
categoriaRoutes.get("/:id", C.getCategoriaById);
categoriaRoutes.get("/:categoriaId/productos", C.getProductosByCategoria); // Mapeado a C.getProductosByCategoria (compartido)

// ======================================
// 3. RUTAS DE CALIFICACIONES
// ======================================
export const calificacionRoutes = express.Router();

calificacionRoutes.post("/", authenticateToken, C.crearOActualizarCalificacion);
calificacionRoutes.get(
  "/mis-productos",
  authenticateToken,
  C.obtenerProductosParaCalificar,
);
calificacionRoutes.get(
  "/pedido/:pedidoId/productos",
  authenticateToken,
  C.obtenerProductosParaCalificarPorPedido,
);
calificacionRoutes.get(
  "/usuario/:productoId/:pedidoId",
  authenticateToken,
  C.obtenerCalificacionUsuario,
);
calificacionRoutes.get(
  "/producto/:productoId",
  C.obtenerCalificacionesProducto,
);
calificacionRoutes.delete(
  "/:calificacionId",
  authenticateToken,
  C.eliminarCalificacion,
);
