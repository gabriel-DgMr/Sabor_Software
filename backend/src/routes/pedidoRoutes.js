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

// Permitir a admin ver todos los pedidos y a usuarios ver los suyos propios
router.get(
  "/",
  authenticateToken,
  (req, res, next) => {
    // Si el usuario tiene 'manage_orders', permitir
    // Si tiene 'read_own', permitir pero solo sus pedidos
    const userPermissions = req.user?.permisos || req.user?.permissions || [];
    if (userPermissions.includes("manage_orders")) {
      return next();
    }
    if (userPermissions.includes("read_own")) {
      // Forzar filtro por usuario en el controlador
      req.onlyOwn = true;
      return next();
    }
    return res.status(403).json({
      message: "No autorizado - Permiso insuficiente",
      code: "INSUFFICIENT_PERMISSIONS",
      requiredPermission: "manage_orders|read_own",
      userPermissions,
    });
  },
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
