import rateLimit from "express-rate-limit";
import helmet from "helmet";
import validator from "validator";

// Rate limiting para prevenir ataques de fuerza bruta
export const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      message:
        "Demasiadas solicitudes desde esta IP, inténtalo de nuevo más tarde.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Rate limiter específico para autenticación
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 5 intentos
  message: {
    message:
      "Demasiados intentos de inicio de sesión. Inténtalo de nuevo en 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para registro
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 registros por hora
  message: {
    message: "Demasiados intentos de registro. Inténtalo de nuevo en 1 hora.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para mensajes de contacto (máx 3 por día por IP)
export const contactoRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 100,
  message: {
    message: "Solo puedes enviar 3 mensajes de contacto por día desde esta IP.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Configuración de Helmet para headers de seguridad
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Sanitización de datos de entrada
export const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        req.body[key] = validator.escape(req.body[key].trim());
      }
    });
  }

  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      if (typeof req.query[key] === "string") {
        req.query[key] = validator.escape(req.query[key].trim());
      }
    });
  }

  next();
};

// Validación de tipos de archivo
export const validateFileType = (allowedTypes) => {
  return (req, res, next) => {
    if (!req.file) {
      return next();
    }

    const fileType = req.file.mimetype;
    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({
        code: "security_file_type",
        types: allowedTypes,
      });
    }

    next();
  };
};

// Validación de tamaño de archivo
export const validateFileSize = (maxSizeInMB) => {
  return (req, res, next) => {
    if (!req.file) {
      return next();
    }

    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (req.file.size > maxSizeInBytes) {
      return res.status(400).json({
        code: "security_file_size",
        max: maxSizeInMB,
      });
    }

    next();
  };
};

// Validación de URL segura
export const validateSecureUrl = (url) => {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    return (
      urlObj.protocol === "https:" ||
      (urlObj.protocol === "http:" && urlObj.hostname === "localhost")
    );
  } catch {
    return false;
  }
};

// Middleware para prevenir ataques de inyección SQL básicos
export const preventSQLInjection = (req, res, next) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\b\s+['"]?\w+['"]?\s*=\s*['"]?\w+['"]?)/i,
    /(--|\/\*|\*\/|;)/,
    /(\b(WAITFOR|DELAY)\b)/i,
  ];

  const checkValue = (value) => {
    if (typeof value === "string") {
      return sqlPatterns.some((pattern) => pattern.test(value));
    }
    return false;
  };

  const checkObject = (obj) => {
    for (let key in obj) {
      if (checkValue(obj[key])) {
        return true;
      }
    }
    return false;
  };

  if (
    checkObject(req.body) ||
    checkObject(req.query) ||
    checkObject(req.params)
  ) {
    return res.status(400).json({
      code: "security_invalid_input",
    });
  }

  next();
};

// Validación de longitud de campos
export const validateFieldLength = (fieldName, maxLength) => {
  return (req, res, next) => {
    const value = req.body[fieldName];
    if (value && value.length > maxLength) {
      return res.status(400).json({
        code: "security_field_length",
        field: fieldName,
        max: maxLength,
      });
    }
    next();
  };
};

// Validación de formato de precio
export const validatePrice = (req, res, next) => {
  const { precio_producto } = req.body;

  if (precio_producto !== undefined) {
    const price = parseFloat(precio_producto);
    if (isNaN(price) || price < 0 || price > 999999.99) {
      return res.status(400).json({
        code: "security_invalid_price",
      });
    }
  }

  next();
};

// Validación de formato de fecha
export const validateDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Middleware para validar fechas
export const validateDateField = (fieldName) => {
  return (req, res, next) => {
    const dateValue = req.body[fieldName];
    if (dateValue && !validateDate(dateValue)) {
      return res.status(400).json({
        code: "security_invalid_date",
        field: fieldName,
      });
    }
    next();
  };
};
