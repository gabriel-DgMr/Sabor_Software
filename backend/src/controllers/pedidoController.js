import {
  getPedidos as getPedidosFromModel,
  getAllPedidosForAdmin,
  getPedidoById as getPedidoByIdFromModel,
  updatePedidoEstado,
  updatePedidoById,
  deletePedidoById,
  marcarPedidoRecibido,
} from "../models/pedidoModel.js";
import { dbConfig } from "../config/dbconfig.js";
import mysql from "mysql2/promise";

const pool = mysql.createPool(dbConfig);

// Obtener todos los pedidos
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

// Eliminar un pedido
export const deletePedido = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ mensaje: "ID de pedido no proporcionado" });
    }

    const pedido = await deletePedidoFromModel(id);

    if (!pedido) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }

    res.json({
      mensaje: "Pedido cancelado exitosamente",
      pedido,
    });
  } catch (error) {
    console.error("Error en deletePedido:", error);
    res.status(500).json({
      mensaje: "Error al cancelar el pedido",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Crear un nuevo pedido (desde el carrito)
export const createPedido = async (req, res) => {
  try {
    const { items, total, recomendaciones } = req.body;
    const userId = req.user.id; // Asumiendo que el middleware de autenticación añade el ID del cliente

    // Validaciones
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        mensaje: "La lista de items es requerida y debe ser un array no vacío",
      });
    }

    // Validar cada item en el array
    for (const item of items) {
      if (!item.id_producto || typeof item.id_producto !== "number") {
        return res.status(400).json({
          mensaje: "Cada item debe tener un id_producto numérico válido",
        });
      }
      if (
        !item.cantidad ||
        typeof item.cantidad !== "number" ||
        item.cantidad <= 0
      ) {
        return res.status(400).json({
          mensaje: "Cada item debe tener una cantidad numérica positiva",
        });
      }
      if (
        !item.precio_unitario ||
        typeof item.precio_unitario !== "number" ||
        item.precio_unitario < 0
      ) {
        return res.status(400).json({
          mensaje:
            "Cada item debe tener un precio_unitario numérico no negativo",
        });
      }
    }

    if (!total || typeof total !== "number" || total <= 0) {
      return res.status(400).json({
        mensaje: "El total es requerido y debe ser un número positivo",
      });
    }

    // Validar recomendaciones (opcional, puede ser un string vacío)
    if (recomendaciones !== undefined && typeof recomendaciones !== "string") {
      return res
        .status(400)
        .json({ mensaje: "Las recomendaciones deben ser un string" });
    }

    const pedidoGuardado = await createPedidoFromModel({
      userId,
      items,
      total,
      recomendaciones,
    });

    res.status(201).json(pedidoGuardado);
  } catch (error) {
    console.error("Error en createPedido:", error);
    res.status(400).json({
      mensaje: error.message || "Error al crear el pedido",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Actualizar un pedido
export const updatePedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, total } = req.body;

    if (!id) {
      return res.status(400).json({ mensaje: "ID de pedido no proporcionado" });
    }

    // Validaciones
    if (items && (!Array.isArray(items) || items.length === 0)) {
      return res
        .status(400)
        .json({ mensaje: "La lista de items debe ser un array no vacío" });
    }

    if (total && (typeof total !== "number" || total <= 0)) {
      return res
        .status(400)
        .json({ mensaje: "El total debe ser un número positivo" });
    }

    const pedido = await updatePedidoFromModel(id, { items, total });

    if (!pedido) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }

    res.json(pedido);
  } catch (error) {
    console.error("Error en updatePedido:", error);
    res.status(400).json({
      mensaje: "Error al actualizar el pedido",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// === CONTROLADORES DE CARRITO ===
import {
  getCarritoByUser,
  createCarrito,
  addOrUpdateProducto,
  updateCantidadProducto,
  removeProducto as removeProductoFromModel,
  vaciar as vaciarFromModel,
  confirmarPedido,
} from "../models/pedidoModel.js";

// =====================
// PEDIDOS
// =====================

export const getPedidoById = async (req, res) => {
  try {
    const pedido = await getPedidoByIdFromModel(req.user.id, req.params.id);
    if (!pedido)
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    res.json(pedido);
  } catch (error) {
    console.error("Error en getPedidoById:", error);
    res
      .status(500)
      .json({ mensaje: "Error al obtener el pedido", error: error.message });
  }
};

export const updateEstadoPedido = async (req, res) => {
  try {
    const { nuevoEstado } = req.body;
    const actualizado = await updatePedidoEstado(req.params.id, nuevoEstado);
    if (!actualizado)
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    res.json({
      mensaje: "Estado actualizado",
      pedidoId: req.params.id,
      nuevoEstado,
    });
  } catch (error) {
    console.error("Error en updateEstadoPedido:", error);
    res
      .status(500)
      .json({ mensaje: "Error al actualizar estado", error: error.message });
  }
};

export const recibirPedido = async (req, res) => {
  try {
    const recibido = await marcarPedidoRecibido(req.user.id, req.params.id);
    if (!recibido)
      return res
        .status(404)
        .json({ mensaje: "Pedido no encontrado o no autorizado" });
    res.json({
      mensaje: "Pedido marcado como recibido",
      pedidoId: req.params.id,
    });
  } catch (error) {
    console.error("Error en recibirPedido:", error);
    res
      .status(500)
      .json({ mensaje: "Error al marcar como recibido", error: error.message });
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
    res
      .status(500)
      .json({ mensaje: "Error al obtener el carrito", error: error.message });
  }
};

export const addProductoCarrito = async (req, res) => {
  try {
    const { id_producto, cantidad } = req.body;
    if (!id_producto || !cantidad || cantidad <= 0)
      return res
        .status(400)
        .json({ mensaje: "id_producto y cantidad son requeridos" });

    const id_pedido = await addOrUpdateProducto(
      req.user.id,
      id_producto,
      cantidad,
    );
    res.json({ mensaje: "Producto agregado/actualizado", id_pedido });
  } catch (error) {
    console.error("Error en addProductoCarrito:", error);
    res.status(500).json({ mensaje: error.message });
  }
};

export const updateCantidadCarrito = async (req, res) => {
  try {
    const { id_producto, cantidad } = req.body;
    if (!id_producto || !cantidad || cantidad <= 0)
      return res
        .status(400)
        .json({ mensaje: "id_producto y cantidad son requeridos" });

    const id_pedido = await updateCantidadProducto(
      req.user.id,
      id_producto,
      cantidad,
    );
    res.json({ mensaje: "Cantidad actualizada", id_pedido });
  } catch (error) {
    console.error("Error en updateCantidadCarrito:", error);
    res.status(500).json({ mensaje: error.message });
  }
};

export const removeProducto = async (req, res) => {
  try {
    const { id_producto } = req.body;
    if (!id_producto)
      return res.status(400).json({ mensaje: "id_producto es requerido" });

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
    } = req.body;

    if (!metodo_pago)
      return res.status(400).json({ mensaje: "metodo_pago es requerido" });

    const id_pedido = await confirmarPedido(
      req.user.id,
      metodo_pago,
      tipo_servicio,
      direccion_entrega,
      detalle_direccion,
      referencia_pago,
      estado_pago,
      recomendaciones,
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
