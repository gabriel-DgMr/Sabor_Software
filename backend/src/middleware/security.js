import rateLimit from "express-rate-limit";
import helmet from "helmet";
import xss from "xss-clean";
import hpp from "hpp";
import validator from "validator";
import { securityLogger } from "./logger.js";

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
    // Configurar trust proxy de manera segura para Railway
    trustProxy: process.env.NODE_ENV === "production" ? 1 : false,
  });
};

// Rate limiter específico para autenticación (más restrictivo en producción)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === "production" ? 5 : 100, // máximo 5 intentos en producción
  message: {
    message:
      "Demasiados intentos de inicio de sesión. Inténtalo de nuevo en 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Configurar trust proxy de manera segura para Railway
  trustProxy: process.env.NODE_ENV === "production" ? 1 : false,
  handler: (req, res, next, options) => {
    // Log de seguridad para intentos de fuerza bruta
    if (process.env.NODE_ENV === "production") {
      securityLogger.log("BRUTE_FORCE_ATTEMPT", req, {
        endpoint: req.originalUrl,
        attempts: req.rateLimit.current,
      });
    }
    res.status(429).json(options.message);
  },
});

// Rate limiter para registro (más restrictivo en producción)
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: process.env.NODE_ENV === "production" ? 3 : 100, // máximo 3 registros por hora en producción
  message: {
    message: "Demasiados intentos de registro. Inténtalo de nuevo en 1 hora.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Configurar trust proxy de manera segura para Railway
  trustProxy: process.env.NODE_ENV === "production" ? 1 : false,
});

// Rate limiter para mensajes de contacto (máx 3 por día por IP)
export const contactoRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 3,
  message: {
    message: "Solo puedes enviar 3 mensajes de contacto por día desde esta IP.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Configurar trust proxy de manera segura para Railway
  trustProxy: process.env.NODE_ENV === "production" ? 1 : false,
});

// Configuración de Helmet para headers de seguridad
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["self"],
      styleSrc: ["self", "unsafe-inline"],
      scriptSrc: ["self"],
      imgSrc: ["self", "data:", "blob:", "https:"],
      formAction: [
        "self",
        "https://checkout.payulatam.com",
        "https://sandbox.checkout.payulatam.com",
      ],
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

// Middleware para detectar y bloquear IPs sospechosas
export const ipBlockingMiddleware = (req, res, next) => {
  const clientIP =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  // Lista de IPs bloqueadas (en producción esto debería venir de una base de datos)
  const blockedIPs = process.env.BLOCKED_IPS
    ? process.env.BLOCKED_IPS.split(",")
    : [];

  if (blockedIPs.includes(clientIP)) {
    return res.status(403).json({
      code: "security_ip_blocked",
      message: "Access denied from this IP address",
    });
  }

  next();
};

// Middleware para validar headers de seguridad requeridos
export const validateSecurityHeaders = (req, res, next) => {
  // En producción, verificar headers importantes
  if (process.env.NODE_ENV === "production") {
    const userAgent = req.headers["user-agent"];

    // Bloquear requests sin User-Agent (posibles bots maliciosos)
    if (!userAgent || userAgent.length < 10) {
      return res.status(400).json({
        code: "security_invalid_headers",
        message: "Invalid request headers",
      });
    }

    // Detectar User-Agents sospechosos
    const suspiciousAgents = [
      "curl",
      "wget",
      "python-requests",
      "bot",
      "crawler",
    ];
    const isSuspicious = suspiciousAgents.some((agent) =>
      userAgent.toLowerCase().includes(agent),
    );

    if (isSuspicious && !req.url.includes("/api/health")) {
      securityLogger.log("SUSPICIOUS_USER_AGENT", req, {
        userAgent: userAgent,
      });
    }
  }

  next();
};

// Middleware para limitar el tamaño del payload
export const payloadSizeLimit = (maxSizeInMB = 10) => {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers["content-length"]);
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    if (contentLength > maxSizeInBytes) {
      return res.status(413).json({
        code: "security_payload_too_large",
        maxSize: maxSizeInMB,
      });
    }

    next();
  };
};

// Middleware para detectar intentos de path traversal
export const pathTraversalProtection = (req, res, next) => {
  const suspiciousPatterns = [
    /\.\./,
    /\/\.\./,
    /\.\.\\/,
    /\.\.\//,
    /\.\.%2f/i,
    /\.\.%5c/i,
    /%2e%2e/i,
  ];

  const checkPath = (path) => {
    return suspiciousPatterns.some((pattern) => pattern.test(path));
  };

  if (
    checkPath(req.url) ||
    (req.body &&
      typeof req.body === "object" &&
      Object.values(req.body).some(
        (value) => typeof value === "string" && checkPath(value),
      ))
  ) {
    securityLogger.log("PATH_TRAVERSAL_ATTEMPT", req);

    return res.status(400).json({
      code: "security_invalid_path",
      message: "Invalid path detected",
    });
  }

  next();
};

// Configuración de seguridad para producción
export const productionSecurityConfig = {
  // Configurar trust proxy de manera segura para Railway (solo confiar en 1 proxy)
  trustProxy: process.env.NODE_ENV === "production" ? 1 : false,

  // Headers de seguridad adicionales
  securityHeaders: {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    "Strict-Transport-Security":
      process.env.NODE_ENV === "production"
        ? "max-age=31536000; includeSubDomains; preload"
        : undefined,
  },
};
