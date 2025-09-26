import {
  getPedidos as getPedidosFromModel,
  deletePedido as deletePedidoFromModel,
  createPedido as createPedidoFromModel,
  updatePedido as updatePedidoFromModel,
  getAllPedidosForAdmin,
  updatePedidoEstado,
} from "../models/pedidoModel.js";

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
      return res.status(400).json({
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
    res.status(500).json({
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
      return res.status(400).json({
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
    res.status(500).json({
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
    console.log("🔄 ===== CONFIRMANDO PEDIDO EN BACKEND =====");
    const userId = req.user?.id;
    console.log("👤 Usuario ID:", userId);

    const {
      metodo_pago,
      tipo_servicio,
      direccion_entrega,
      detalle_direccion,
      referencia_pago,
      estado_pago,
      recomendaciones,
    } = req.body;

    console.log("📋 Datos recibidos:", {
      metodo_pago,
      tipo_servicio,
      direccion_entrega,
      detalle_direccion,
      referencia_pago,
      estado_pago,
      recomendaciones,
      userId,
    });

    // Validaciones
    if (!metodo_pago) {
      return res.status(400).json({ mensaje: "metodo_pago es requerido" });
    }
    if (!userId) {
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
      userId,
      metodo_pago,
      tipo_servicio,
      direccion_entrega,
      detalle_direccion,
      referencia_pago,
      estado_pago,
      recomendaciones,
    );

    console.log("✅ Pedido confirmado con ID:", id_pedido);
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
