import { errorLogger } from "./logger.js";

export const errorHandler = (err, req, res, next) => {
  errorLogger.log(err, req);

  // Manejar errores específicos
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Error de validación",
      errors: err.errors,
    });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      message: "No autorizado",
    });
  }

  // Error por defecto
  res.status(500).json({
    message: "Error interno del servidor",
  });
};

// Middleware para manejar rutas no encontradas
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: "Ruta no encontrada",
  });
};
