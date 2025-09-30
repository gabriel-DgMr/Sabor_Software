import express from "express";
import {
  // Funciones de pedidos
  getPedidos,
  deletePedido,
  updatePedido,
  updateEstadoPedido,
  getPedidoById,
  recibirPedido,
  // Funciones de carrito
  getCarrito,
  addProductoCarrito,
  updateCantidadCarrito,
  removeProducto,
  vaciar,
  confirmar,
} from "../controllers/pedidoController.js";

import { authenticateToken, checkPermission } from "../middleware/auth.js";
import { validatePedido } from "../middleware/validateRequest.js";

const router = express.Router();

//
// === RUTAS DE CARRITO ===
//
router.get("/carrito", authenticateToken, getCarrito);
router.post("/carrito/add", authenticateToken, addProductoCarrito);
router.put("/carrito/update", authenticateToken, updateCantidadCarrito);
router.delete("/carrito/remove", authenticateToken, removeProducto);
router.delete("/carrito/vaciar", authenticateToken, vaciar);
router.post("/carrito/confirmar", authenticateToken, confirmar);

//
// === RUTAS DE PEDIDOS ===
//



// Ver todos los pedidos (admin) o solo los propios (usuario)
router.get(
  "/",
  authenticateToken,
  (req, res, next) => {
    const userPermissions = req.user?.permisos || req.user?.permissions || [];
    if (userPermissions.includes("manage_orders")) return next();
    if (userPermissions.includes("read_own")) {
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

// Obtener pedido por ID
router.get("/:id", authenticateToken, checkPermission("read"), getPedidoById);

// Actualizar pedido
router.put(
  "/:id",
  authenticateToken,
  checkPermission("manage_orders"),
  validatePedido,
  updatePedido,
);

// Eliminar pedido
router.delete(
  "/:id",
  authenticateToken,
  checkPermission("delete"),
  deletePedido,
);

// Actualizar estado del pedido
router.patch(
  "/:id/estado",
  authenticateToken,
  checkPermission("manage_orders"),
  updateEstadoPedido,
);

// Marcar pedido como recibido
router.patch("/recibir/:id", authenticateToken, recibirPedido);

export default router;
