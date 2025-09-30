import {
  getPedidos as getPedidosFromModel,
  getAllPedidosForAdmin,
  getPedidoById as getPedidoByIdFromModel,
  updatePedidoEstado,
  updatePedidoById,
  deletePedidoById,
  marcarPedidoRecibido,
  getCarritoByUser,
  createCarrito,
  addOrUpdateProducto,
  updateCantidadProducto,
  removeProducto as removeProductoFromModel,
  vaciar as vaciarFromModel,
  confirmarPedido,
} from "../models/pedidoModel.js";
import { dbConfig } from "../config/dbconfig.js";
import mysql from "mysql2/promise";

const pool = mysql.createPool(dbConfig);

// =====================
// PEDIDOS
// =====================

export const getPedidos = async (req, res) => {
  try {
    let pedidos;
    // Si es admin (no req.onlyOwn), obtener todos los pedidos con información completa
    if (!req.onlyOwn) {
      pedidos = await getAllPedidosForAdmin();
    } else {
      // Si es usuario normal, solo sus pedidos
      const userId = req.user.id;
      pedidos = await getPedidosFromModel(userId);
    }
    res.json(pedidos);
  } catch (error) {
    console.error("Error en getPedidos:", error);
    res.status(500).json({
      mensaje: "Error al obtener los pedidos",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getPedidoById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const pedido = await getPedidoByIdFromModel(userId, id);
    if (!pedido) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }
    res.json(pedido);
  } catch (error) {
    console.error("Error en getPedidoById:", error);
    res.status(500).json({ 
      mensaje: "Error al obtener el pedido", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const updatePedido = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizado = await updatePedidoById(id, req.body);
    if (!actualizado) return res.status(404).json({ mensaje: "Pedido no encontrado" });
    res.json({ mensaje: "Pedido actualizado", pedido: actualizado });
  } catch (error) {
    console.error("Error en updatePedido:", error);
    res.status(500).json({ 
      mensaje: "Error al actualizar el pedido", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const deletePedido = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ mensaje: "ID de pedido no proporcionado" });
    }
    const eliminado = await deletePedidoById(id);
    if (!eliminado) return res.status(404).json({ mensaje: "Pedido no encontrado" });
    res.json({ mensaje: "Pedido eliminado correctamente" });
  } catch (error) {
    console.error("Error en deletePedido:", error);
    res.status(500).json({ 
      mensaje: "Error al eliminar el pedido", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const recibirPedido = async (req, res) => {
  try {
    const recibido = await marcarPedidoRecibido(req.user.id, req.params.id);
    if (!recibido) return res.status(404).json({ mensaje: "Pedido no encontrado o no autorizado" });
    res.json({ mensaje: "Pedido marcado como recibido", pedidoId: req.params.id });
  } catch (error) {
    console.error("Error en recibirPedido:", error);
    res.status(500).json({ 
      mensaje: "Error al marcar como recibido", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

// =====================
// CARRITO
// =====================

export const getCarrito = async (req, res) => {
  try {
    let carrito = await getCarritoByUser(req.user.id);
    if (!carrito) {
      const id_pedido = await createCarrito(req.user.id);
      carrito = { id_pedido, items: [] };
    }
    if (!carrito.items) carrito.items = [];
    res.json(carrito);
  } catch (error) {
    console.error("Error en getCarrito:", error);
    res.status(500).json({ mensaje: "Error al obtener el carrito", error: error.message });
  }
};

export const addProductoCarrito = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id_producto, cantidad } = req.body;
    if (!id_producto || !cantidad || cantidad <= 0) {
      return res.status(400).json({
        mensaje:
          "id_producto y cantidad son requeridos y cantidad debe ser mayor a 0",
      });
    }

    const id_pedido = await addOrUpdateProducto(
      userId,
      id_producto,
      cantidad
    );
    res.json({
      mensaje: "Producto agregado/actualizado en el carrito",
      id_pedido,
    });
  } catch (error) {
    console.error("Error en addProductoCarrito:", error);
    res.status(500).json({ mensaje: error.message });
  }
};

export const updateCantidadCarrito = async (req, res) => {
  try {
    const { id_producto, cantidad } = req.body;
    if (!id_producto || !cantidad || cantidad <= 0)
      return res.status(400).json({ mensaje: "id_producto y cantidad son requeridos" });

    const id_pedido = await updateCantidadProducto(req.user.id, id_producto, cantidad);
    res.json({ mensaje: "Cantidad actualizada", id_pedido });
  } catch (error) {
    console.error("Error en updateCantidadCarrito:", error);
    res.status(500).json({ mensaje: error.message });
  }
};

export const removeProducto = async (req, res) => {
  try {
    const { id_producto } = req.body;
    if (!id_producto) return res.status(400).json({ mensaje: "id_producto es requerido" });

    const id_pedido = await removeProductoFromModel(req.user.id, id_producto);
    res.json({ mensaje: "Producto eliminado del carrito", id_pedido });
  } catch (error) {
    console.error("Error en removeProducto:", error);
    res.status(500).json({ mensaje: error.message });
  }
};

export const vaciar = async (req, res) => {
  try {
    const id_pedido = await vaciarFromModel(req.user.id);
    res.json({ mensaje: "Carrito vaciado", id_pedido });
  } catch (error) {
    console.error("Error en vaciar:", error);
    res.status(500).json({ mensaje: error.message });
  }
};

// =====================
// CONFIRMAR PEDIDO
// =====================

export const confirmar = async (req, res) => {
  try {
    const {
      metodo_pago,
      tipo_servicio,
      direccion_entrega,
      detalle_direccion,
      referencia_pago,
      estado_pago,
      recomendaciones,
      id_mesa,
    } = req.body;

    console.log("📋 Datos recibidos:", {
      metodo_pago,
      tipo_servicio,
      direccion_entrega,
      detalle_direccion,
      referencia_pago,
      estado_pago,
      recomendaciones,
      userId: req.user.id,
    });

    // Validaciones
    if (!metodo_pago) {
      return res.status(400).json({ mensaje: "metodo_pago es requerido" });
    }
    if (!req.user.id) {
      return res.status(401).json({ mensaje: "Usuario no autenticado" });
    }
    if (!tipo_servicio || !["mesa", "domicilio"].includes(tipo_servicio)) {
      return res.status(400).json({ mensaje: "tipo_servicio inválido" });
    }
    if (tipo_servicio === "domicilio" && !direccion_entrega) {
      return res
        .status(400)
        .json({ mensaje: "direccion_entrega es requerida para domicilio" });
    }

    console.log("🚀 Llamando a confirmarPedido del modelo...");
    const id_pedido = await confirmarPedido(
      req.user.id,
      metodo_pago,
      tipo_servicio,
      direccion_entrega,
      detalle_direccion,
      referencia_pago,
      estado_pago,
      recomendaciones
    );

    res.json({ mensaje: "Pedido confirmado", id_pedido });
  } catch (error) {
    console.error("[Pedido][Confirmar] Error:", {
      error: error,
      stack: error.stack,
      user: req.user,
      body: req.body,
    });
    res
      .status(500)
      .json({ mensaje: "Error al confirmar pedido", error: error.message });
  }
};

// Actualizar estado de un pedido (solo para administradores)
export const updateEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevoEstado } = req.body;

    if (!id) {
      return res.status(400).json({ mensaje: "ID de pedido no proporcionado" });
    }

    if (!nuevoEstado || typeof nuevoEstado !== "number") {
      return res.status(400).json({
        mensaje: "nuevoEstado es requerido y debe ser un número",
      });
    }

    // Validar que el estado sea válido (2=PENDIENTE, 3=COMPLETADO, 4=CANCELADO, 5=EN PREPARACION, 6=RECIBIDO)
    const estadosValidos = [2, 3, 4, 5, 6];
    if (!estadosValidos.includes(nuevoEstado)) {
      return res.status(400).json({
        mensaje:
          "Estado inválido. Estados válidos: 2=PENDIENTE, 3=COMPLETADO, 4=CANCELADO, 5=EN PREPARACION, 6=RECIBIDO",
      });
    }

    // Verificar que el pedido no esté en estado "Recibido" (6) - no se puede cambiar
    const [pedidoActual] = await pool.query(
      "SELECT id_estado FROM pedidos WHERE id_pedido = ?",
      [id],
    );

    if (pedidoActual.length > 0 && pedidoActual[0].id_estado === 6) {
      return res.status(400).json({
        mensaje:
          "No se puede cambiar el estado de un pedido que ya fue marcado como recibido",
      });
    }

    const actualizado = await updatePedidoEstado(id, nuevoEstado);

    if (!actualizado) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }

    res.json({
      mensaje: "Estado del pedido actualizado exitosamente",
      pedidoId: id,
      nuevoEstado,
    });
  } catch (error) {
    console.error("Error en updateEstadoPedido:", error);
    res.status(500).json({
      mensaje: "Error al actualizar el estado del pedido",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
