import express from "express";
import * as C from "./controllers.js";
import {
  authenticateToken,
  checkPermission,
  checkRole,
} from "../../core/middlewares/auth.js";
import { validatePedido } from "../../core/middlewares/validateRequest.js";

// ======================================
// 1. RUTAS DE PEDIDOS (API/PEDIDOS)
// ======================================
export const pedidoRoutes = express.Router();

// --- Carrito ---
pedidoRoutes.get("/carrito", authenticateToken, C.getCarrito);
pedidoRoutes.post("/carrito/add", authenticateToken, C.addProductoCarrito);
pedidoRoutes.put("/carrito/update", authenticateToken, C.updateCantidadCarrito);
pedidoRoutes.delete("/carrito/remove", authenticateToken, C.removeProducto);
pedidoRoutes.delete("/carrito/vaciar", authenticateToken, C.vaciar);
pedidoRoutes.post("/carrito/confirmar", authenticateToken, C.confirmar);

// --- Pedidos ---

// Ver pedidos: Admin ve todos, Usuario ve los propios
// Lógica de filtrado "req.onlyOwn" se maneja en el controlador
pedidoRoutes.get(
  "/",
  authenticateToken,
  (req, res, next) => {
    const userPermissions = req.user?.permisos || [];
    if (userPermissions.includes("manage_orders")) return next();
    if (userPermissions.includes("read_own")) {
      req.onlyOwn = true;
      return next();
    }
    return res.status(403).json({
      message: "No autorizado - Permiso insuficiente",
      code: "INSUFFICIENT_PERMISSIONS",
      requiredPermission: "manage_orders|read_own",
    });
  },
  C.getPedidos,
);

pedidoRoutes.get(
  "/:id",
  authenticateToken,
  checkPermission("read"),
  C.getPedidoById,
);

pedidoRoutes.patch(
  "/:id/estado",
  authenticateToken,
  checkPermission("manage_orders"),
  C.updateEstadoPedido,
);

pedidoRoutes.patch("/recibir/:id", authenticateToken, C.recibirPedido);

// ======================================
// 2. RUTAS DE DOMICILIOS (API/DOMICILIOS)
// ======================================
export const domicilioRoutes = express.Router();

// Historial del cliente
domicilioRoutes.get("/historial", authenticateToken, C.getHistorialDomicilios);

// Ver todos (Empleado/Admin)
domicilioRoutes.get(
  "/todos",
  authenticateToken,
  checkRole(["Empleado", "Administrador"]),
  C.getDomicilios,
);

// Marcar como recibido
domicilioRoutes.put(
  "/:id/recibido",
  authenticateToken,
  C.marcarDomicilioRecibido,
);
