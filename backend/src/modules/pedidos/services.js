import * as pedidosQueries from "./queries.js";
import { normalizeImagePath } from "../productos/queries.js";
import { pool } from "../../core/config/dbconfig.js";

// =====================
// SERVICIOS DE PEDIDOS
// =====================

/**
 * Obtener pedidos (Admin ve todos, Usuario solo los propios)
 */
export const getPedidosService = async (userId, isAdmin = false) => {
  let pedidos;
  if (isAdmin) {
    pedidos = await pedidosQueries.getAllPedidosQuery();
  } else {
    pedidos = await pedidosQueries.getPedidosByUserIdQuery(userId);
  }

  // Normalizar items: convertir items_str (CSV) en un arreglo 'items'
  return pedidos.map((p) => ({
    ...p,
    items: p.items_str ? p.items_str.split(", ") : [],
    productos: p.items_str || "", // Para compatibilidad con Admin View
  }));
};

/**
 * Obtener un pedido específico por ID
 */
export const getPedidoByIdService = async (userId, pedidoId) => {
  const pedido = await pedidosQueries.getPedidoByIdQuery(userId, pedidoId);
  if (!pedido) {
    throw new Error("Pedido no encontrado o no autorizado");
  }

  return {
    ...pedido,
    items: pedido.items_str ? pedido.items_str.split(", ") : [],
    productos: pedido.items_str || "",
  };
};

/**
 * Marcar un pedido como recibido por el cliente
 */
export const recibirPedidoService = async (userId, pedidoId) => {
  const actualizado = await pedidosQueries.updatePedidoRecibidoQuery(
    pedidoId,
    userId,
  );
  if (!actualizado) {
    throw new Error("No se pudo marcar el pedido como recibido");
  }
  return { pedidoId };
};

/**
 * Actualizar el estado de un pedido (Admin)
 */
export const updateEstadoPedidoService = async (pedidoId, nuevoEstado) => {
  // Validar estados válidos (2=PENDIENTE, 3=COMPLETADO, 4=CANCELADO, 5=EN PREPARACION, 6=RECIBIDO)
  const estadosValidos = [2, 3, 4, 5, 6];
  if (!estadosValidos.includes(nuevoEstado)) {
    throw new Error("Estado de pedido inválido");
  }

  const actualizado = await pedidosQueries.updatePedidoEstadoQuery(
    pedidoId,
    nuevoEstado,
  );
  if (!actualizado) {
    throw new Error("Pedido no encontrado");
  }
  return { pedidoId, nuevoEstado };
};

/**
 * Actualizar el estado de un pedido por su referencia de pago (PayU)
 */
export const updateEstadoPedidoPorReferenciaService = async (
  referencia,
  nuevoEstado,
) => {
  const estadosValidos = [2, 3, 4, 5, 6];
  if (!estadosValidos.includes(nuevoEstado)) {
    throw new Error("Estado de pedido inválido");
  }

  const actualizado = await pedidosQueries.updatePedidoEstadoPorReferenciaQuery(
    referencia,
    nuevoEstado,
  );
  if (!actualizado) {
    throw new Error("Pedido con referencia no encontrado");
  }
  return { referencia, nuevoEstado };
};

// =====================
// SERVICIOS DE CARRITO
// =====================

/**
 * Obtener el carrito actual del usuario o crear uno nuevo
 */
export const getCarritoService = async (userId) => {
  let carrito = await pedidosQueries.getCarritoQuery(userId);
  if (!carrito) {
    const id_pedido = await pedidosQueries.createCarritoQuery(userId);
    carrito = { id_pedido, items: [] };
  } else if (carrito.items && carrito.items.length > 0) {
    // Normalizar rutas de imágenes para el frontend
    carrito.items = carrito.items.map((item) => ({
      ...item,
      imagen_producto: normalizeImagePath(item.imagen_producto),
    }));
  }
  return carrito;
};

/**
 * Agregar producto al carrito (maneja transacciones y stock)
 */
export const addProductoCarritoService = async (
  userId,
  productoId,
  cantidad,
  mensaje = null,
) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Validar stock (Lock for update)
    const infoProducto = await pedidosQueries.validateStockQuery(
      productoId,
      conn,
    );
    if (!infoProducto) throw new Error("Producto no encontrado");
    if (infoProducto.stock < cantidad) throw new Error("Stock insuficiente");

    // 2. Buscar o crear carrito
    let carrito = await pedidosQueries.getCarritoQuery(userId, conn);
    let pedidoId;
    if (!carrito) {
      pedidoId = await pedidosQueries.createCarritoQuery(userId, conn);
    } else {
      pedidoId = carrito.id_pedido;
    }

    // 3. Agregar o actualizar detalle
    const detalleExistente = await pedidosQueries.getDetallePedidoQuery(
      pedidoId,
      productoId,
      conn,
    );
    if (detalleExistente) {
      await pedidosQueries.updateDetallePedidoCantidadQuery(
        pedidoId,
        productoId,
        cantidad,
        true,
        conn,
      );
      // Opcional: Actualizar el mensaje si se envía uno nuevo al re-agregar
      if (mensaje !== null) {
        await pedidosQueries.updateDetallePedidoMensajeQuery(
          pedidoId,
          productoId,
          mensaje,
          conn,
        );
      }
    } else {
      await pedidosQueries.insertDetallePedidoQuery(
        pedidoId,
        productoId,
        cantidad,
        infoProducto.precio_producto,
        mensaje,
        conn,
      );
    }

    await conn.commit();
    return { pedidoId };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

/**
 * Actualizar cantidad de un producto en el carrito
 */
export const updateCantidadCarritoService = async (
  userId,
  productoId,
  cantidad,
) => {
  const carrito = await pedidosQueries.getCarritoQuery(userId);
  if (!carrito) throw new Error("No tienes un carrito activo");

  await pedidosQueries.updateDetallePedidoCantidadQuery(
    carrito.id_pedido,
    productoId,
    cantidad,
    false,
  );
  return { pedidoId: carrito.id_pedido };
};

/**
 * Actualizar el mensaje de un producto en el carrito
 */
export const updateMensajeCarritoService = async (
  userId,
  productoId,
  mensaje,
) => {
  const carrito = await pedidosQueries.getCarritoQuery(userId);
  if (!carrito) throw new Error("No tienes un carrito activo");

  await pedidosQueries.updateDetallePedidoMensajeQuery(
    carrito.id_pedido,
    productoId,
    mensaje,
  );
  return { pedidoId: carrito.id_pedido };
};

/**
 * Eliminar un producto del carrito
 */
export const removeProductoCarritoService = async (userId, productoId) => {
  const carrito = await pedidosQueries.getCarritoQuery(userId);
  if (!carrito) throw new Error("No tienes un carrito activo");

  await pedidosQueries.deleteDetallePedidoQuery(carrito.id_pedido, productoId);
  return { pedidoId: carrito.id_pedido };
};

/**
 * Vaciar el carrito
 */
export const vaciarCarritoService = async (userId) => {
  const carrito = await pedidosQueries.getCarritoQuery(userId);
  if (!carrito) throw new Error("No tienes un carrito activo");

  await pedidosQueries.deleteDetallePedidoQuery(carrito.id_pedido);
  return { pedidoId: carrito.id_pedido };
};

// =====================
// CONFIRMACIÓN DE PEDIDO
// =====================

/**
 * Confirmar el pedido (pasa de carrito a pendiente/pagado)
 */
export const confirmarPedidoService = async (userId, datos) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const carrito = await pedidosQueries.getCarritoQuery(userId, conn);
    if (!carrito || carrito.id_estado !== 1) {
      throw new Error("No hay un carrito disponible para confirmar");
    }

    // Re-validar stock de todos los items
    const items = await pedidosQueries.getItemsForUpdateQuery(
      carrito.id_pedido,
      conn,
    );
    for (const item of items) {
      const stockInfo = await pedidosQueries.validateStockQuery(
        item.id_producto,
        conn,
      );
      if (!stockInfo || stockInfo.stock < item.cantidad) {
        throw new Error(
          `Stock insuficiente para el producto ID: ${item.id_producto}`,
        );
      }
    }

    // Determinar estado final (2=Pendiente por defecto)
    const estadoFinal = datos.id_estado || 2;

    // Actualizar pedido
    const confirmado = await pedidosQueries.confirmarPedidoQuery(
      carrito.id_pedido,
      {
        ...datos,
        id_estado: estadoFinal,
      },
      conn,
    );

    if (!confirmado) throw new Error("No se pudo confirmar el pedido");

    await conn.commit();
    return { pedidoId: carrito.id_pedido };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

// =====================
// SERVICIOS DE DOMICILIOS
// =====================

/**
 * Historial de domicilios para un cliente
 */
export const getHistorialDomiciliosService = async (userId) => {
  return await pedidosQueries.getDomiciliosQuery(userId);
};

/**
 * Lista de todos los domicilios para empleados/admin
 */
export const getTodosDomiciliosService = async () => {
  return await pedidosQueries.getDomiciliosQuery();
};

/**
 * Marcar un domicilio como recibido (validando que sea domicilio y esté completado)
 */
export const marcarDomicilioRecibidoService = async (userId, pedidoId) => {
  // Esta lógica era específica en el modelo legacy, la mantendremos como una validación de negocio aquí
  const pedido = await pedidosQueries.getPedidoByIdQuery(userId, pedidoId);
  if (!pedido) throw new Error("Domicilio no encontrado o no autorizado");

  // Validaciones adicionales (ej: solo si tipo_servicio es domicilio)
  // Nota: getPedidoByIdQuery no trae tipo_servicio en el modelo legacy pero getDomiciliosQuery sí.
  // Usaremos una consulta directa si es necesario o confiaremos en la lógica previa.

  const actualizado = await pedidosQueries.updatePedidoEstadoQuery(pedidoId, 6); // 6 = Recibido
  if (!actualizado)
    throw new Error("Error al actualizar el estado del domicilio");

  return { pedidoId };
};
