import * as pedidosServices from "./services.js";

// =====================
// CONTROLADORES PEDIDOS
// =====================

/**
 * Obtener pedidos (General)
 */
export const getPedidos = async (req, res) => {
  try {
    const isAdmin = !req.onlyOwn; // Si soloOwn es falso, es admin o empleado con permisos amplios
    const userId = req.user.id;
    const pedidos = await pedidosServices.getPedidosService(userId, isAdmin);
    res.json(pedidos);
  } catch (error) {
    console.error("Error en getPedidos:", error);
    res
      .status(500)
      .json({ mensaje: "Error al obtener pedidos", error: error.message });
  }
};

/**
 * Obtener pedido por ID
 */
export const getPedidoById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const pedido = await pedidosServices.getPedidoByIdService(userId, id);
    res.json(pedido);
  } catch (error) {
    console.error("Error en getPedidoById:", error);
    res.status(404).json({ mensaje: error.message });
  }
};

/**
 * Marcar pedido como recibido por el cliente
 */
export const recibirPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const resultado = await pedidosServices.recibirPedidoService(userId, id);
    res.json({ mensaje: "Pedido marcado como recibido", ...resultado });
  } catch (error) {
    console.error("Error en recibirPedido:", error);
    res.status(400).json({ mensaje: error.message });
  }
};

/**
 * Actualizar estado del pedido (solo administradores)
 */
export const updateEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevoEstado } = req.body;
    const resultado = await pedidosServices.updateEstadoPedidoService(
      id,
      nuevoEstado,
    );
    res.json({ mensaje: "Estado del pedido actualizado", ...resultado });
  } catch (error) {
    console.error("Error en updateEstadoPedido:", error);
    res.status(400).json({ mensaje: error.message });
  }
};

// =====================
// CONTROLADORES CARRITO
// =====================

/**
 * Obtener el carrito actual
 */
export const getCarrito = async (req, res) => {
  try {
    const userId = req.user.id;
    const carrito = await pedidosServices.getCarritoService(userId);
    res.json(carrito);
  } catch (error) {
    console.error("Error en getCarrito:", error);
    res
      .status(500)
      .json({ mensaje: "Error al obtener el carrito", error: error.message });
  }
};

/**
 * Agregar producto al carrito
 */
export const addProductoCarrito = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id_producto, cantidad } = req.body;

    if (!id_producto || !cantidad || cantidad <= 0) {
      return res
        .status(400)
        .json({ mensaje: "ID de producto y cantidad válidos son requeridos" });
    }

    const resultado = await pedidosServices.addProductoCarritoService(
      userId,
      id_producto,
      cantidad,
    );
    res.json({
      mensaje: "Producto agregado/actualizado en el carrito",
      ...resultado,
    });
  } catch (error) {
    console.error("Error en addProductoCarrito:", error);
    res.status(400).json({ mensaje: error.message });
  }
};

/**
 * Actualizar cantidad de producto en carrito
 */
export const updateCantidadCarrito = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id_producto, cantidad } = req.body;

    if (!id_producto || !cantidad || cantidad <= 0) {
      return res
        .status(400)
        .json({ mensaje: "ID de producto y cantidad válidos son requeridos" });
    }

    const resultado = await pedidosServices.updateCantidadCarritoService(
      userId,
      id_producto,
      cantidad,
    );
    res.json({ mensaje: "Cantidad del producto actualizada", ...resultado });
  } catch (error) {
    console.error("Error en updateCantidadCarrito:", error);
    res.status(400).json({ mensaje: error.message });
  }
};

/**
 * Eliminar producto del carrito
 */
export const removeProducto = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id_producto } = req.body;

    if (!id_producto)
      return res.status(400).json({ mensaje: "ID de producto requerido" });

    const resultado = await pedidosServices.removeProductoCarritoService(
      userId,
      id_producto,
    );
    res.json({ mensaje: "Producto eliminado del carrito", ...resultado });
  } catch (error) {
    console.error("Error en removeProducto:", error);
    res.status(400).json({ mensaje: error.message });
  }
};

/**
 * Vaciar carrito
 */
export const vaciar = async (req, res) => {
  try {
    const userId = req.user.id;
    const resultado = await pedidosServices.vaciarCarritoService(userId);
    res.json({ mensaje: "Carrito vaciado", ...resultado });
  } catch (error) {
    console.error("Error en vaciar:", error);
    res.status(500).json({ mensaje: error.message });
  }
};

/**
 * Confirmar pedido (Checkout)
 */
export const confirmar = async (req, res) => {
  try {
    const userId = req.user.id;
    const resultado = await pedidosServices.confirmarPedidoService(
      userId,
      req.body,
    );
    res.json({ mensaje: "Pedido confirmado", ...resultado });
  } catch (error) {
    console.error("Error en confirmar:", error);
    res
      .status(400)
      .json({ mensaje: "Error al confirmar el pedido", error: error.message });
  }
};

// =====================
// CONTROLADORES DOMICILIOS
// =====================

/**
 * Obtener historial de domicilios para el cliente
 */
export const getHistorialDomicilios = async (req, res) => {
  try {
    const userId = req.user.id;
    const domicilios =
      await pedidosServices.getHistorialDomiciliosService(userId);
    res.json(domicilios);
  } catch (error) {
    console.error("Error en getHistorialDomicilios:", error);
    res.status(500).json({ mensaje: error.message });
  }
};

/**
 * Obtener todos los domicilios (Admin/Empleado)
 */
export const getDomicilios = async (req, res) => {
  try {
    const domicilios = await pedidosServices.getTodosDomiciliosService();
    res.json(domicilios);
  } catch (error) {
    console.error("Error en getDomicilios:", error);
    res.status(500).json({ mensaje: error.message });
  }
};

/**
 * Marcar domicilio como recibido (Cliente)
 */
export const marcarDomicilioRecibido = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const resultado = await pedidosServices.marcarDomicilioRecibidoService(
      userId,
      id,
    );
    res.json({ mensaje: "Domicilio marcado como recibido", ...resultado });
  } catch (error) {
    console.error("Error en marcarDomicilioRecibido:", error);
    // Errores de "no encontrado" o "no autorizado" suelen ser 400/404/403,
    // pero errores de BD o sintaxis deben ser 500.
    const statusCode =
      error.message.includes("No encontrado") ||
      error.message.includes("no autorizado")
        ? 400
        : 500;
    res.status(statusCode).json({
      mensaje:
        statusCode === 500 ? "Error interno del servidor" : error.message,
      error: error.message,
    });
  }
};
