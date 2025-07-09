import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import crypto from 'crypto';

// ✅ MEJORADO: Configuración de logger seguro
const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf((info) => {
        // Remover información sensible de los logs
        const sanitized = sanitizeLogData(info);
        return JSON.stringify(sanitized);
    })
);

// ✅ MEJORADO: Función para limpiar datos sensibles de los logs
function sanitizeLogData(data) {
    const sensitiveFields = [
        'password', 'contraseña', 'contraseña_cliente', 'token', 'secret', 
        'authorization', 'cookie', 'session', 'jwt', 'hash', 'salt'
    ];
    
    const sanitized = { ...data };
    
    // Recursivamente limpiar objetos
    function cleanObject(obj) {
        if (typeof obj !== 'object' || obj === null) return obj;
        
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
            if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
                cleaned[key] = '[REDACTED]';
            } else if (typeof value === 'object') {
                cleaned[key] = cleanObject(value);
            } else {
                cleaned[key] = value;
            }
        }
        return cleaned;
    }
    
    return cleanObject(sanitized);
}

// ✅ MEJORADO: Configuración de transports
const transports = [
    // Console transport para desarrollo
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
    }),
    
    // Archivo para logs generales
    new DailyRotateFile({
        filename: 'logs/app-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'info'
    }),
    
    // Archivo específico para errores
    new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        level: 'error'
    }),
    
    // Archivo específico para eventos de seguridad
    new DailyRotateFile({
        filename: 'logs/security-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '90d',
        level: 'warn'
    })
];

// ✅ MEJORADO: Logger principal
const logger = winston.createLogger({
    format: logFormat,
    transports: transports,
    exitOnError: false
});

// ✅ MEJORADO: Función para crear loggers específicos por módulo
export const createSecureLogger = (module) => {
    return {
        info: (message, meta = {}) => {
            logger.info(message, { module, ...meta });
        },
        warn: (message, meta = {}) => {
            logger.warn(message, { module, ...meta });
        },
        error: (message, meta = {}) => {
            logger.error(message, { module, ...meta });
        },
        debug: (message, meta = {}) => {
            logger.debug(message, { module, ...meta });
        },
        // ✅ MEJORADO: Logger específico para eventos de seguridad
        security: (message, meta = {}) => {
            logger.warn(message, { 
                module, 
                security: true, 
                timestamp: new Date().toISOString(),
                ...meta 
            });
        }
    };
};

// ✅ MEJORADO: Función para hash de identificadores sensibles
export const hashSensitiveData = (data) => {
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 8);
};

// ✅ MEJORADO: Función para loggear intentos de autenticación
export const logAuthAttempt = (type, success, details = {}) => {
    const authLogger = createSecureLogger('auth');
    
    const logData = {
        type, // 'login', 'register', 'verify', 'logout'
        success,
        timestamp: new Date().toISOString(),
        ip: details.ip,
        userAgent: details.userAgent,
        userId: details.userId ? hashSensitiveData(details.userId) : null,
        email: details.email ? hashSensitiveData(details.email) : null,
        ...details
    };
    
    if (success) {
        authLogger.info(`${type} exitoso`, logData);
    } else {
        authLogger.security(`${type} fallido`, logData);
    }
};

// ✅ MEJORADO: Función para loggear eventos de seguridad críticos
export const logSecurityEvent = (event, details = {}) => {
    const securityLogger = createSecureLogger('security');
    
    const logData = {
        event,
        severity: details.severity || 'medium',
        timestamp: new Date().toISOString(),
        ip: details.ip,
        userAgent: details.userAgent,
        userId: details.userId ? hashSensitiveData(details.userId) : null,
        ...details
    };
    
    securityLogger.security(`Evento de seguridad: ${event}`, logData);
};

export default logger; 