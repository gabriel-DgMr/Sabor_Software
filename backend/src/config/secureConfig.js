import dotenv from "dotenv";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ MEJORADO: Cargar variables de entorno con validación
const envFile = join(__dirname, "../../.env");
const envResult = dotenv.config({ path: envFile });

if (envResult.error) {
  throw new Error(`Error cargando archivo .env: ${envResult.error.message}`);
}

// ✅ MEJORADO: Validador de variables de entorno
class EnvValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  // Validar que una variable exista
  required(name, description = "") {
    if (!process.env[name]) {
      this.errors.push(`${name} es requerido ${description}`);
    }
    return this;
  }

  // Validar que una variable sea un número
  number(name, min = null, max = null) {
    const value = process.env[name];
    if (value && isNaN(Number(value))) {
      this.errors.push(`${name} debe ser un número válido`);
    }
    if (min !== null && Number(value) < min) {
      this.errors.push(`${name} debe ser mayor o igual a ${min}`);
    }
    if (max !== null && Number(value) > max) {
      this.errors.push(`${name} debe ser menor o igual a ${max}`);
    }
    return this;
  }

  // Validar que una variable sea una URL válida
  url(name) {
    const value = process.env[name];
    if (value) {
      try {
        new URL(value);
      } catch {
        this.errors.push(`${name} debe ser una URL válida`);
      }
    }
    return this;
  }

  // Validar que una variable sea un email válido
  email(name) {
    const value = process.env[name];
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      this.errors.push(`${name} debe ser un email válido`);
    }
    return this;
  }

  // Validar longitud mínima
  minLength(name, min) {
    const value = process.env[name];
    if (value && value.length < min) {
      this.errors.push(`${name} debe tener al menos ${min} caracteres`);
    }
    return this;
  }

  // Validar que no contenga valores por defecto inseguros
  notDefault(name, defaultValues) {
    const value = process.env[name];
    if (value && defaultValues.includes(value)) {
      this.warnings.push(`${name} está usando un valor por defecto inseguro`);
    }
    return this;
  }

  // Validar que sea un valor de una lista
  oneOf(name, validValues) {
    const value = process.env[name];
    if (value && !validValues.includes(value)) {
      this.errors.push(`${name} debe ser uno de: ${validValues.join(", ")}`);
    }
    return this;
  }

  // Validar variable opcional (no genera error si no existe)
  optional(name, description = "") {
    // Para variables opcionales, solo generamos warnings si NO están definidas
    if (!process.env[name] && description) {
      this.warnings.push(`${name} es opcional ${description}`);
    }
    return this;
  }

  // Obtener resultados de validación
  validate() {
    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    };
  }
}

// ✅ MEJORADO: Validar variables de entorno críticas
const validator = new EnvValidator();

const validation = validator
  // Base de datos
  .required("DB_HOST", "- Host de la base de datos")
  .required("DB_USER", "- Usuario de la base de datos")
  .required("DB_PASSWORD", "- Contraseña de la base de datos")
  .required("DB_NAME", "- Nombre de la base de datos")
  .number("DB_PORT", 1, 65535)

  // Servidor
  .required("PORT", "- Puerto del servidor")
  .number("PORT", 1, 65535)
  .required("NODE_ENV", "- Entorno de ejecución")
  .oneOf("NODE_ENV", ["development", "production", "test"])

  // JWT
  .required("JWT_SECRET", "- Clave secreta para JWT")
  .minLength("JWT_SECRET", 32)
  .notDefault("JWT_SECRET", [
    "secret_key",
    "your-jwt-secret-key-here",
    "your-super-secret-jwt-key-change-in-production",
  ])

  // Cookies
  .required("COOKIE_SECRET", "- Clave secreta para cookies")
  .minLength("COOKIE_SECRET", 32)
  .notDefault("COOKIE_SECRET", [
    "cookie-secret",
    "your-cookie-secret-here",
    "your-session-secret-key-here",
  ])

  // Email
  .required("EMAIL_USER", "- Usuario de email")
  .email("EMAIL_USER")
  .required("EMAIL_PASSWORD", "- Contraseña de email")
  .optional("EMAIL_FROM", "- Dirección de remitente")
  .optional("EMAIL_SERVICE", "- Servicio de email")
  .optional("EMAIL_TIMEOUT", "- Timeout de email")
  .optional("EMAIL_SECURE", "- Usar SSL para email")
  .optional("EMAIL_REQUIRE_TLS", "- Requerir TLS para email")

  // URLs
  .url("CORS_ORIGIN")
  .url("FRONTEND_URL")

  .validate();

if (!validation.isValid) {
  console.error("❌ Errores de configuración:");
  validation.errors.forEach((error) => console.error(`  - ${error}`));
  process.exit(1);
}

if (validation.warnings.length > 0) {
  console.warn("⚠️  :" + envFile);
  console.warn("⚠️  Advertencias de configuración:");
  validation.warnings.forEach((warning) => console.warn(`  - ${warning}`));
}

// ✅ MEJORADO: Configuración segura
export const secureConfig = {
  // Configuración del servidor
  server: {
    port: parseInt(process.env.PORT, 10),
    host: process.env.HOST || "localhost",
    mode: process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === "production",
    isDevelopment: process.env.NODE_ENV === "development",
    isTest: process.env.NODE_ENV === "test",
  },

  // Configuración de base de datos
  database: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
    acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT, 10) || 60000,
    timeout: parseInt(process.env.DB_TIMEOUT, 10) || 60000,
    reconnect: process.env.DB_RECONNECT !== "false",
  },

  // ✅ MEJORADO: Configuración JWT mejorada
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "15m", // ✅ Reducido a 15 minutos
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    algorithm: process.env.JWT_ALGORITHM || "HS256",
    issuer: process.env.JWT_ISSUER || "sabor-app",
    audience: process.env.JWT_AUDIENCE || "sabor-users",
    clockTolerance: parseInt(process.env.JWT_CLOCK_TOLERANCE, 10) || 10, // segundos
  },

  // ✅ MEJORADO: Configuración de cookies mejorada
  cookies: {
    secret: process.env.COOKIE_SECRET,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: parseInt(process.env.COOKIE_MAX_AGE, 10) || 15 * 60 * 1000, // 15 minutos
    path: "/",
    domain: process.env.COOKIE_DOMAIN || undefined,
    signed: true,
  },

  // ✅ MEJORADO: Configuración de CORS mejorada
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "X-CSRF-Token",
      "X-Requested-With",
    ],
    exposedHeaders: ["X-Total-Count", "X-Rate-Limit-*"],
    maxAge: parseInt(process.env.CORS_MAX_AGE, 10) || 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  },

  // ✅ MEJORADO: Configuración de Rate Limiting
  rateLimit: {
    // Rate limiting general
    global: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 15 * 60 * 1000, // 15 minutos
      max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        error: "Demasiadas solicitudes desde esta IP",
        code: "RATE_LIMIT_EXCEEDED",
      },
    },

    // Rate limiting para autenticación
    auth: {
      windowMs:
        parseInt(process.env.AUTH_RATE_LIMIT_WINDOW, 10) || 15 * 60 * 1000,
      max: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 5,
      skipSuccessfulRequests: true,
      skipFailedRequests: false,
    },

    // Rate limiting para registro
    register: {
      windowMs:
        parseInt(process.env.REGISTER_RATE_LIMIT_WINDOW, 10) || 60 * 60 * 1000,
      max: parseInt(process.env.REGISTER_RATE_LIMIT_MAX, 10) || 3,
    },

    // Rate limiting para recuperación de contraseña
    passwordReset: {
      windowMs:
        parseInt(process.env.PASSWORD_RESET_RATE_LIMIT_WINDOW, 10) ||
        60 * 60 * 1000,
      max: parseInt(process.env.PASSWORD_RESET_RATE_LIMIT_MAX, 10) || 3,
    },
  },

  // ✅ MEJORADO: Configuración de email
  email: {
    service: process.env.EMAIL_SERVICE || "gmail",
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    timeout: parseInt(process.env.EMAIL_TIMEOUT, 10) || 10000,
    secure: process.env.EMAIL_SECURE !== "false",
    requireTLS: process.env.EMAIL_REQUIRE_TLS !== "false",
  },

  // ✅ MEJORADO: Configuración de archivos
  files: {
    maxSize: parseInt(process.env.FILE_MAX_SIZE, 10) || 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: (
      process.env.FILE_ALLOWED_TYPES ||
      "image/jpeg,image/jpg,image/png,image/webp"
    ).split(","),
    uploadPath: process.env.FILE_UPLOAD_PATH || "./public/uploads/",
    tempPath: process.env.FILE_TEMP_PATH || "./temp/",
    maxFiles: parseInt(process.env.FILE_MAX_FILES, 10) || 5,
  },

  // ✅ MEJORADO: URLs y hosts
  urls: {
    frontend: process.env.FRONTEND_URL || "http://localhost:5173",
    backend: process.env.BACKEND_URL || `http://localhost:${process.env.PORT}`,
    api: process.env.API_URL || `http://localhost:${process.env.PORT}/api`,
  },

  // ✅ MEJORADO: Headers de seguridad
  security: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        mediaSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === "production",
      },
    },

    hsts: {
      maxAge: parseInt(process.env.HSTS_MAX_AGE, 10) || 31536000, // 1 año
      includeSubDomains: process.env.HSTS_INCLUDE_SUBDOMAINS !== "false",
      preload: process.env.HSTS_PRELOAD !== "false",
    },

    frameguard: {
      action: process.env.FRAMEGUARD_ACTION || "deny",
    },
  },

  // ✅ MEJORADO: Configuración de logging
  logging: {
    level:
      process.env.LOG_LEVEL ||
      (process.env.NODE_ENV === "production" ? "info" : "debug"),
    format: process.env.LOG_FORMAT || "json",
    file: process.env.LOG_FILE || "logs/app.log",
    errorFile: process.env.LOG_ERROR_FILE || "logs/error.log",
    securityFile: process.env.LOG_SECURITY_FILE || "logs/security.log",
    maxSize: process.env.LOG_MAX_SIZE || "20m",
    maxFiles: process.env.LOG_MAX_FILES || "14d",
    compress: process.env.LOG_COMPRESS !== "false",
  },

  // ✅ MEJORADO: Configuración de sesiones
  session: {
    maxAge: parseInt(process.env.SESSION_MAX_AGE, 10) || 15 * 60 * 1000, // 15 minutos
    extendOnActivity: process.env.SESSION_EXTEND_ON_ACTIVITY !== "false",
    maxConcurrentSessions:
      parseInt(process.env.SESSION_MAX_CONCURRENT, 10) || 3,
    trackLocation: process.env.SESSION_TRACK_LOCATION !== "false",
  },

  // ✅ MEJORADO: Configuración de validación
  validation: {
    password: {
      minLength: parseInt(process.env.PASSWORD_MIN_LENGTH, 10) || 8,
      maxLength: parseInt(process.env.PASSWORD_MAX_LENGTH, 10) || 128,
      requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== "false",
      requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== "false",
      requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS !== "false",
      requireSymbols: process.env.PASSWORD_REQUIRE_SYMBOLS !== "false",
      minSymbols: parseInt(process.env.PASSWORD_MIN_SYMBOLS, 10) || 1,
    },

    email: {
      maxLength: parseInt(process.env.EMAIL_MAX_LENGTH, 10) || 100,
      minLength: parseInt(process.env.EMAIL_MIN_LENGTH, 10) || 5,
      allowedDomains: process.env.EMAIL_ALLOWED_DOMAINS
        ? process.env.EMAIL_ALLOWED_DOMAINS.split(",")
        : null,
    },

    phone: {
      pattern: process.env.PHONE_PATTERN || "^\\d{10}$",
      maxLength: parseInt(process.env.PHONE_MAX_LENGTH, 10) || 15,
    },
  },
};

// ✅ MEJORADO: Función para generar secretos seguros
export const generateSecureSecret = (length = 64) => {
  return crypto.randomBytes(length).toString("hex");
};

// ✅ MEJORADO: Función para validar configuración en runtime
export const validateRuntimeConfig = () => {
  const issues = [];

  // Validar que JWT_SECRET sea suficientemente seguro
  if (secureConfig.jwt.secret.length < 32) {
    issues.push("JWT_SECRET debe tener al menos 32 caracteres");
  }

  // Validar configuración de producción
  if (secureConfig.server.isProduction) {
    if (!secureConfig.cookies.secure) {
      issues.push("Las cookies deben ser seguras en producción");
    }

    if (secureConfig.cors.origin === "http://localhost:5173") {
      issues.push("CORS_ORIGIN debe configurarse para producción");
    }

    if (!secureConfig.urls.frontend.startsWith("https://")) {
      issues.push("FRONTEND_URL debe usar HTTPS en producción");
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
};

// ✅ MEJORADO: Validar configuración en tiempo de ejecución
const runtimeValidation = validateRuntimeConfig();
if (!runtimeValidation.isValid) {
  console.error("❌ Problemas de configuración en tiempo de ejecución:");
  runtimeValidation.issues.forEach((issue) => console.error(`  - ${issue}`));

  if (secureConfig.server.isProduction) {
    process.exit(1);
  }
}

// ✅ MEJORADO: Exportar configuración como default
export default secureConfig;
