import express from "express";
import {
  getPedidos,
  deletePedido,
  createPedido,
  updatePedido,
} from "../controllers/pedidoController.js";
import { authenticateToken, checkPermission } from "../middleware/auth.js";
import { validatePedido } from "../middleware/validateRequest.js";

const router = express.Router();

// === RUTAS DE CARRITO ===
import {
  getCarrito,
  addProductoCarrito,
  updateCantidadCarrito,
  removeProducto,
  vaciar,
  confirmar,
  getPedidoById,
} from "../controllers/pedidoController.js";

// Carrito: todas protegidas
router.get("/carrito", authenticateToken, getCarrito);
router.post("/carrito/add", authenticateToken, addProductoCarrito);
router.put("/carrito/update", authenticateToken, updateCantidadCarrito);
router.delete("/carrito/remove", authenticateToken, removeProducto);
router.delete("/carrito/vaciar", authenticateToken, vaciar);
router.post("/carrito/confirmar", authenticateToken, confirmar);

// Rutas protegidas con validaciones
router.post("/", authenticateToken, validatePedido, createPedido);

router.get(
  "/",
  authenticateToken,
  checkPermission("manage_orders"),
  getPedidos,
);

// Usar el controlador real para obtener pedido por id
router.get("/:id", authenticateToken, checkPermission("read"), getPedidoById);

router.put(
  "/:id",
  authenticateToken,
  checkPermission("manage_orders"),
  validatePedido,
  updatePedido,
);

router.delete(
  "/:id",
  authenticateToken,
  checkPermission("delete"),
  deletePedido,
);

export default router;
