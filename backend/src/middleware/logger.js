import fs from "fs";
import path from "path";
import morgan from "morgan";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Configuración avanzada de logging para producción
 */

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Función para obtener fecha actual en formato YYYY-MM-DD
const getCurrentDate = () => {
  return new Date().toISOString().split("T")[0];
};

// Función para rotar logs diariamente
const getLogFileName = (type) => {
  const date = getCurrentDate();
  return path.join(logsDir, `${type}-${date}.log`);
};

// Stream de escritura para logs de acceso
const accessLogStream = {
  write: (message) => {
    const logFile = getLogFileName("access");
    fs.appendFileSync(logFile, message);
  },
};

// Stream de escritura para logs de error
const errorLogStream = {
  write: (message) => {
    const logFile = getLogFileName("error");
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
  },
};

// Stream de escritura para logs de seguridad
const securityLogStream = {
  write: (message) => {
    const logFile = getLogFileName("security");
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
  },
};

// Formato personalizado de logs para producción
morgan.token("real-ip", (req) => {
  return (
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null)
  );
});

morgan.token("user-id", (req) => {
  return req.user ? req.user.id : "anonymous";
});

// Formato detallado para producción
const productionFormat =
  ':real-ip - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

// Formato simplificado para desarrollo
const developmentFormat =
  ":method :url :status :response-time ms - :res[content-length]";

// Configuración de morgan según el entorno
export const accessLogger = morgan(
  process.env.NODE_ENV === "production" ? productionFormat : developmentFormat,
  {
    stream:
      process.env.NODE_ENV === "production" ? accessLogStream : process.stdout,
    skip: (req, res) => {
      // Saltar logs de health checks en producción
      if (process.env.NODE_ENV === "production") {
        return (
          req.url.includes("/health") ||
          req.url.includes("/ready") ||
          req.url.includes("/live")
        );
      }
      return false;
    },
  },
);

// Logger de errores personalizado
export const errorLogger = {
  log: (error, req = null, additionalInfo = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: "ERROR",
      message: error.message || error,
      stack: error.stack || null,
      url: req ? req.url : null,
      method: req ? req.method : null,
      ip: req
        ? req.headers["x-forwarded-for"] || req.connection.remoteAddress
        : null,
      userAgent: req ? req.headers["user-agent"] : null,
      userId: req && req.user ? req.user.id : null,
      ...additionalInfo,
    };

    const logMessage = JSON.stringify(logEntry);

    // Escribir a archivo en producción
    if (process.env.NODE_ENV === "production") {
      errorLogStream.write(logMessage);
    }

    // Siempre mostrar en consola
    console.error("🚨 ERROR:", logMessage);
  },
};

// Logger de seguridad
export const securityLogger = {
  log: (event, req = null, additionalInfo = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: "SECURITY",
      event: event,
      ip: req
        ? req.headers["x-forwarded-for"] || req.connection.remoteAddress
        : null,
      userAgent: req ? req.headers["user-agent"] : null,
      userId: req && req.user ? req.user.id : null,
      url: req ? req.url : null,
      method: req ? req.method : null,
      ...additionalInfo,
    };

    const logMessage = JSON.stringify(logEntry);

    // Escribir a archivo
    if (process.env.NODE_ENV === "production") {
      securityLogStream.write(logMessage);
    }

    // Mostrar en consola si es crítico
    if (
      [
        "BRUTE_FORCE",
        "SQL_INJECTION",
        "XSS_ATTEMPT",
        "UNAUTHORIZED_ACCESS",
      ].includes(event)
    ) {
      console.warn("🔒 SECURITY ALERT:", logMessage);
    }
  },
};

// Logger general de aplicación
export const appLogger = {
  info: (message, additionalInfo = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: "INFO",
      message,
      ...additionalInfo,
    };

    if (process.env.NODE_ENV !== "production") {
      console.log("ℹ️ INFO:", JSON.stringify(logEntry));
    }
  },

  warn: (message, additionalInfo = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: "WARN",
      message,
      ...additionalInfo,
    };

    console.warn("⚠️ WARNING:", JSON.stringify(logEntry));
  },

  debug: (message, additionalInfo = {}) => {
    if (
      process.env.NODE_ENV === "development" ||
      process.env.LOG_LEVEL === "debug"
    ) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: "DEBUG",
        message,
        ...additionalInfo,
      };

      console.debug("🐛 DEBUG:", JSON.stringify(logEntry));
    }
  },
};

// Función para limpiar logs antiguos (ejecutar diariamente)
export const cleanOldLogs = (daysToKeep = 30) => {
  try {
    const files = fs.readdirSync(logsDir);
    const now = Date.now();
    const maxAge = daysToKeep * 24 * 60 * 60 * 1000;

    files.forEach((file) => {
      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);

      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        appLogger.info(`Old log file deleted: ${file}`);
      }
    });
  } catch (error) {
    errorLogger.log(error, null, { context: "log_cleanup" });
  }
};

export default {
  accessLogger,
  errorLogger,
  securityLogger,
  appLogger,
  cleanOldLogs,
};
