import {
  getPedidos as getPedidosFromModel,
  deletePedido as deletePedidoFromModel,
  createPedido as createPedidoFromModel,
  updatePedido as updatePedidoFromModel,
} from "../models/pedidoModel.js";

// Obtener todos los pedidos
export const getPedidos = async (req, res) => {
  try {
    // Obtener el ID del cliente autenticado del objeto req
    const userId = req.user.id; // Asumiendo que el middleware de autenticación añade el ID del cliente en req.user.userId

    const pedidos = await getPedidosFromModel(userId); // Pasar el ID del cliente al modelo
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
      return res
        .status(400)
        .json({
          mensaje:
            "La lista de items es requerida y debe ser un array no vacío",
        });
    }

    // Validar cada item en el array
    for (const item of items) {
      if (!item.id_producto || typeof item.id_producto !== "number") {
        return res
          .status(400)
          .json({
            mensaje: "Cada item debe tener un id_producto numérico válido",
          });
      }
      if (
        !item.cantidad ||
        typeof item.cantidad !== "number" ||
        item.cantidad <= 0
      ) {
        return res
          .status(400)
          .json({
            mensaje: "Cada item debe tener una cantidad numérica positiva",
          });
      }
      if (
        !item.precio_unitario ||
        typeof item.precio_unitario !== "number" ||
        item.precio_unitario < 0
      ) {
        return res
          .status(400)
          .json({
            mensaje:
              "Cada item debe tener un precio_unitario numérico no negativo",
          });
      }
    }

    if (!total || typeof total !== "number" || total <= 0) {
      return res
        .status(400)
        .json({
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
  addOrUpdateProductoCarrito,
  updateCantidadProductoCarrito,
  removeProductoCarrito,
  vaciarCarrito,
  confirmarPedido,
} from "../models/pedidoModel.js";

// Obtener el carrito actual del cliente
export const getCarrito = async (req, res) => {
  try {
    const userId = req.user.id;
    const carrito = await getCarritoByUser(userId);
    if (!carrito) {
      // Si no hay carrito, crear uno vacío
      const id_pedido = await createCarrito(userId);
      return res.json({ id_pedido, items: [] });
    }
    // Asegurar que siempre haya una propiedad 'items' (aunque esté vacía)
    if (!carrito.items) {
      carrito.items = [];
    }
    res.json(carrito);
  } catch (error) {
    console.error("Error en getCarrito:", error);
    res
      .status(500)
      .json({ mensaje: "Error al obtener el carrito", error: error.message });
  }
};

// Agregar producto al carrito
export const addProductoCarrito = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id_producto, cantidad } = req.body;
    if (!id_producto || !cantidad || cantidad <= 0) {
      return res
        .status(400)
        .json({
          mensaje:
            "id_producto y cantidad son requeridos y cantidad debe ser mayor a 0",
        });
    }
    const id_pedido = await addOrUpdateProductoCarrito(
      userId,
      id_producto,
      cantidad,
    );
    res.json({
      mensaje: "Producto agregado/actualizado en el carrito",
      id_pedido,
    });
  } catch (error) {
    console.error("Error en addProductoCarrito:", error);
    res
      .status(500)
      .json({
        mensaje: error.message || "Error al agregar producto al carrito",
        error: error.message,
      });
  }
};

// Modificar cantidad de un producto en el carrito
export const updateCantidadCarrito = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id_producto, cantidad } = req.body;
    if (!id_producto || !cantidad || cantidad <= 0) {
      return res
        .status(400)
        .json({
          mensaje:
            "id_producto y cantidad son requeridos y cantidad debe ser mayor a 0",
        });
    }
    const id_pedido = await updateCantidadProductoCarrito(
      userId,
      id_producto,
      cantidad,
    );
    res.json({ mensaje: "Cantidad actualizada", id_pedido });
  } catch (error) {
    console.error("Error en updateCantidadCarrito:", error);
    res
      .status(500)
      .json({
        mensaje: error.message || "Error al actualizar cantidad",
        error: error.message,
      });
  }
};

// Eliminar producto del carrito
export const removeProducto = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id_producto } = req.body;
    if (!id_producto) {
      return res.status(400).json({ mensaje: "id_producto es requerido" });
    }
    const id_pedido = await removeProductoCarrito(userId, id_producto);
    res.json({ mensaje: "Producto eliminado del carrito", id_pedido });
  } catch (error) {
    console.error("Error en removeProducto:", error);
    res
      .status(500)
      .json({ mensaje: "Error al eliminar producto", error: error.message });
  }
};

// Vaciar carrito
export const vaciar = async (req, res) => {
  try {
    const userId = req.user.id;
    const id_pedido = await vaciarCarrito(userId);
    res.json({ mensaje: "Carrito vaciado", id_pedido });
  } catch (error) {
    console.error("Error en vaciar:", error);
    res
      .status(500)
      .json({ mensaje: "Error al vaciar carrito", error: error.message });
  }
};

// Confirmar pedido (finalizar carrito)
export const confirmar = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id_empleado, metodo_pago } = req.body;
    if (!metodo_pago) {
      return res.status(400).json({ mensaje: "metodo_pago es requerido" });
    }
    // id_empleado puede ser undefined/null
    const idEmpleadoValue =
      typeof id_empleado !== "undefined" ? id_empleado : null;
    const id_pedido = await confirmarPedido(
      userId,
      idEmpleadoValue,
      metodo_pago,
    );
    res.json({ mensaje: "Pedido confirmado", id_pedido });
  } catch (error) {
    console.error("Error en confirmar:", error);
    res
      .status(500)
      .json({ mensaje: "Error al confirmar pedido", error: error.message });
  }
};

// Obtener un pedido por ID
export const getPedidoById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    // Buscar el pedido por id y cliente
    const [pedidos] = await import("../models/pedidoModel.js").then((m) =>
      m.getPedidoById(userId, id),
    );
    if (!pedidos) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }
    res.json(pedidos);
  } catch (error) {
    console.error("Error en getPedidoById:", error);
    res
      .status(500)
      .json({ mensaje: "Error al obtener el pedido", error: error.message });
  }
};
