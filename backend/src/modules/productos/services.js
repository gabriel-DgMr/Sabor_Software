import * as Q from "./queries.js";

// ======================= PRODUCTOS SERVICES =======================
export const getAllProductosService = async (filtros) => {
  const rows = await Q.getAllProductosQuery(filtros);
  return rows.map((producto) => {
    const {
      calificacion_base,
      calificacion_promedio,
      total_calificaciones,
      ...resto
    } = producto;
    const promedio = Number(calificacion_promedio ?? calificacion_base ?? 0);
    const promedioValido = Number.isFinite(promedio) ? promedio : 0;
    return {
      ...resto,
      imagen_producto: Q.normalizeImagePath(resto.imagen_producto),
      calificacion: promedioValido,
      calificacion_promedio: promedioValido,
      total_calificaciones: Number(total_calificaciones ?? 0),
    };
  });
};

export const getProductoByIdService = async (id, idioma) => {
  const row = await Q.getProductoByIdQuery(id, idioma);
  if (!row) return null;
  const {
    calificacion_base,
    calificacion_promedio,
    total_calificaciones,
    ...resto
  } = row;
  const promedio = Number(calificacion_promedio ?? calificacion_base ?? 0);
  const promedioValido = Number.isFinite(promedio) ? promedio : 0;
  return {
    ...resto,
    imagen_producto: Q.normalizeImagePath(resto.imagen_producto),
    calificacion: promedioValido,
    calificacion_promedio: promedioValido,
    total_calificaciones: Number(total_calificaciones ?? 0),
  };
};

export const createProductoService = async (productoData) => {
  return await Q.createProductoQuery(productoData);
};

export const updateProductoService = async (id, productoData) => {
  return await Q.updateProductoQuery(id, productoData);
};

export const deleteProductoService = async (id) => {
  return await Q.deleteProductoQuery(id);
};

export const upsertProductoTraduccionService = async (
  productoId,
  idioma,
  desc,
) => {
  return await Q.upsertProductoTraduccionQuery(productoId, idioma, desc);
};

export const getProductoTraduccionesService = async (id) => {
  return await Q.getProductoTraduccionesQuery(id);
};

export const getProductosByCategoriaService = async (categoriaId) => {
  const rows = await Q.getProductosByCategoriaQuery(categoriaId);
  return rows.map((producto) => ({
    ...producto,
    imagen_producto: producto.imagen_producto
      ? `/uploads/productos/${producto.imagen_producto}`
      : null,
  }));
};

// ======================= CATEGORIAS SERVICES =======================
export const getAllCategoriasService = async (idioma) => {
  return await Q.getAllCategoriasQuery(idioma);
};

export const getCategoriaByIdService = async (id, idioma) => {
  return await Q.getCategoriaByIdQuery(id, idioma);
};

// ======================= CALIFICACIONES SERVICES =======================
export const crearOActualizarCalificacionService = async (
  userId,
  productoId,
  pedidoId,
  calificacion,
  comentario,
) => {
  if (!productoId || !pedidoId || !calificacion)
    throw new Error("Faltan datos requeridos");
  if (calificacion < 1 || calificacion > 5)
    throw new Error("La calificación debe estar entre 1 y 5 estrellas");
  return await Q.createOrUpdateCalificacionQuery(
    userId,
    productoId,
    pedidoId,
    calificacion,
    comentario,
  );
};

export const obtenerCalificacionesProductoService = async (
  productoId,
  limit = 10,
  offset = 0,
) => {
  const calificaciones = await Q.getCalificacionesByProductoQuery(
    productoId,
    limit,
    offset,
  );
  const estadisticas = await Q.getEstadisticasCalificacionQuery(productoId);
  return { calificaciones, estadisticas, total: calificaciones.length };
};

export const obtenerCalificacionUsuarioService = async (
  userId,
  productoId,
  pedidoId,
) => {
  return await Q.getCalificacionUsuarioQuery(userId, productoId, pedidoId);
};

export const eliminarCalificacionService = async (userId, calificacionId) => {
  return await Q.deleteCalificacionQuery(userId, calificacionId);
};

export const obtenerProductosParaCalificarService = async (userId) => {
  const rows = await Q.getProductosParaCalificarQuery(userId);
  const pedidosMap = new Map();
  rows.forEach((row) => {
    if (!pedidosMap.has(row.id_pedido)) {
      pedidosMap.set(row.id_pedido, {
        id_pedido: row.id_pedido,
        fecha_pedido: row.fecha_pedido,
        productos: [],
      });
    }
    pedidosMap.get(row.id_pedido).productos.push({
      id_producto: row.id_producto,
      nombre_producto: row.nombre_producto,
      imagen_producto: Q.normalizeImagePath(row.imagen_producto),
      cantidad: row.cantidad,
      precio_unitario: row.precio_unitario,
      calificacion_actual: row.calificacion_actual,
      comentario_actual: row.comentario_actual,
      id_calificacion: row.id_calificacion,
      ya_calificado: !!row.calificacion_actual,
    });
  });
  return Array.from(pedidosMap.values());
};

export const obtenerProductosParaCalificarPorPedidoService = async (
  userId,
  pedidoId,
) => {
  const rows = await Q.getProductosParaCalificarPorPedidoQuery(
    userId,
    pedidoId,
  );
  return rows.map((row) => ({
    id_pedido: row.id_pedido,
    fecha_pedido: row.fecha_pedido,
    id_producto: row.id_producto,
    nombre_producto: row.nombre_producto,
    imagen_producto: Q.normalizeImagePath(row.imagen_producto),
    cantidad: row.cantidad,
    precio_unitario: row.precio_unitario,
    calificacion_actual: row.calificacion_actual,
    comentario_actual: row.comentario_actual,
    id_calificacion: row.id_calificacion,
    ya_calificado: !!row.calificacion_actual,
  }));
};
