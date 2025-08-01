// Configuración de seguridad
export const securityConfig = {
  // Configuración de JWT
  jwt: {
    secret:
      process.env.JWT_SECRET ||
      "your-super-secret-jwt-key-change-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    issuer: process.env.JWT_ISSUER || "sabor-app",
    audience: process.env.JWT_AUDIENCE || "sabor-users",
  },

  // Configuración de cookies
  cookies: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    path: "/",
  },

  // Configuración de rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana
    message: "Demasiadas solicitudes desde esta IP",
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Configuración de autenticación
  auth: {
    loginAttempts: 5,
    lockoutTime: 15 * 60 * 1000, // 15 minutos
    passwordMinLength: 8,
    passwordMaxLength: 128,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
  },

  // Configuración de archivos
  files: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    uploadPath: "./public/uploads/",
    tempPath: "./temp/",
  },

  // Configuración de CORS
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    maxAge: 86400, // 24 horas
  },

  // Configuración de headers de seguridad
  headers: {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
  },

  // Configuración de validación
  validation: {
    email: {
      maxLength: 100,
      minLength: 5,
    },
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: true,
    },
    name: {
      maxLength: 50,
      minLength: 2,
    },
    phone: {
      pattern: /^\d{10}$/,
      maxLength: 10,
    },
    price: {
      min: 0,
      max: 999999.99,
      decimals: 2,
    },
  },

  // Configuración de logging
  logging: {
    level: process.env.LOG_LEVEL || "info",
    format: "combined",
    file: "./logs/app.log",
    maxSize: "10m",
    maxFiles: 5,
  },

  // Configuración de base de datos
  database: {
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
  },
};

// Constantes de seguridad
export const SECURITY_CONSTANTS = {
  // Tokens
  TOKEN_TYPES: {
    ACCESS: "access",
    REFRESH: "refresh",
    RESET: "reset",
  },

  // Roles
  ROLES: {
    ADMIN: "admin",
    MANAGER: "manager",
    USER: "user",
  },

  // Permisos
  PERMISSIONS: {
    READ: "read",
    WRITE: "write",
    DELETE: "delete",
    MANAGE_USERS: "manage_users",
    MANAGE_PRODUCTS: "manage_products",
    MANAGE_ORDERS: "manage_orders",
  },

  // Estados
  STATUS: {
    ACTIVE: "active",
    INACTIVE: "inactive",
    SUSPENDED: "suspended",
    PENDING: "pending",
  },

  // Tipos de archivo
  FILE_TYPES: {
    IMAGE: "image",
    DOCUMENT: "document",
    VIDEO: "video",
  },

  // Códigos de error
  ERROR_CODES: {
    UNAUTHORIZED: "UNAUTHORIZED",
    FORBIDDEN: "FORBIDDEN",
    NOT_FOUND: "NOT_FOUND",
    VALIDATION_ERROR: "VALIDATION_ERROR",
    INTERNAL_ERROR: "INTERNAL_ERROR",
    RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  },
};

// Función para validar configuración de seguridad
export const validateSecurityConfig = () => {
  const errors = [];

  // Validar JWT secret
  if (
    !securityConfig.jwt.secret ||
    securityConfig.jwt.secret ===
      "your-super-secret-jwt-key-change-in-production"
  ) {
    errors.push("JWT_SECRET debe ser configurado en producción");
  }

  // Validar CORS origin
  if (!securityConfig.cors.origin) {
    errors.push("CORS_ORIGIN debe ser configurado");
  }

  // Validar que el entorno sea seguro en producción
  if (process.env.NODE_ENV === "production") {
    if (!process.env.JWT_SECRET) {
      errors.push("JWT_SECRET es requerido en producción");
    }
    if (!process.env.COOKIE_SECRET) {
      errors.push("COOKIE_SECRET es requerido en producción");
    }
    if (securityConfig.cookies.secure !== true) {
      errors.push("Cookies deben ser seguras en producción");
    }
  }

  return errors;
};

// Función para obtener configuración según el entorno
export const getSecurityConfig = (env = process.env.NODE_ENV) => {
  const config = { ...securityConfig };

  if (env === "production") {
    config.cookies.secure = true;
    config.cors.origin = process.env.CORS_ORIGIN;
    config.jwt.secret = process.env.JWT_SECRET;
  } else if (env === "development") {
    config.cookies.secure = false;
    config.logging.level = "debug";
  }

  return config;
};
