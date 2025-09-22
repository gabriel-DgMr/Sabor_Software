import {
  createOrUpdateCalificacion,
  getCalificacionesByProducto,
  getCalificacionUsuario,
  getProductosParaCalificar,
  getEstadisticasCalificacion,
  deleteCalificacion,
} from "../models/calificacionModel.js";

// Crear o actualizar una calificación
export const crearOActualizarCalificacion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productoId, pedidoId, calificacion, comentario } = req.body;

    // Validaciones
    if (!productoId || !pedidoId || !calificacion) {
      return res.status(400).json({
        mensaje: "Faltan datos requeridos: productoId, pedidoId, calificacion",
      });
    }

    if (calificacion < 1 || calificacion > 5) {
      return res.status(400).json({
        mensaje: "La calificación debe estar entre 1 y 5 estrellas",
      });
    }

    const result = await createOrUpdateCalificacion(
      userId,
      productoId,
      pedidoId,
      calificacion,
      comentario,
    );

    res.status(201).json({
      mensaje: "Calificación guardada exitosamente",
      calificacion: result,
    });
  } catch (error) {
    console.error("Error al crear/actualizar calificación:", error);
    res.status(500).json({
      mensaje: error.message || "Error interno del servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Obtener calificaciones de un producto
export const obtenerCalificacionesProducto = async (req, res) => {
  try {
    const { productoId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const calificaciones = await getCalificacionesByProducto(
      productoId,
      parseInt(limit),
      parseInt(offset),
    );

    const estadisticas = await getEstadisticasCalificacion(productoId);

    res.json({
      calificaciones,
      estadisticas,
      total: calificaciones.length,
    });
  } catch (error) {
    console.error("Error al obtener calificaciones del producto:", error);
    res.status(500).json({
      mensaje: "Error al obtener calificaciones del producto",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Obtener productos que el usuario puede calificar
export const obtenerProductosParaCalificar = async (req, res) => {
  try {
    const userId = req.user.id;

    const productos = await getProductosParaCalificar(userId);

    res.json({
      pedidos: productos,
      total: productos.length,
    });
  } catch (error) {
    console.error("Error al obtener productos para calificar:", error);
    res.status(500).json({
      mensaje: "Error al obtener productos para calificar",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Obtener calificación específica del usuario
export const obtenerCalificacionUsuario = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productoId, pedidoId } = req.params;

    const calificacion = await getCalificacionUsuario(
      userId,
      productoId,
      pedidoId,
    );

    if (!calificacion) {
      return res.status(404).json({
        mensaje: "No se encontró calificación para este producto y pedido",
      });
    }

    res.json(calificacion);
  } catch (error) {
    console.error("Error al obtener calificación del usuario:", error);
    res.status(500).json({
      mensaje: "Error al obtener calificación del usuario",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Eliminar una calificación
export const eliminarCalificacion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { calificacionId } = req.params;

    const result = await deleteCalificacion(userId, calificacionId);

    res.json(result);
  } catch (error) {
    console.error("Error al eliminar calificación:", error);
    res.status(500).json({
      mensaje: error.message || "Error al eliminar calificación",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
