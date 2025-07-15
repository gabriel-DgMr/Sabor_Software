import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { createSecureLogger } from '../utils/logger.js';
import { tokenBlacklist } from '../utils/tokenBlacklist.js';

const logger = createSecureLogger('auth');

// ✅ MEJORADO: Rate limiting más estricto para autenticación
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login por IP
  message: {
    message: 'Demasiados intentos de inicio de sesión. Inténtalo de nuevo en 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Excluir rutas que no sean login
    return !req.path.includes('/login');
  }
});

// ✅ MEJORADO: Rate limiting para verificación de códigos
export const verificationRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 3, // máximo 3 intentos de verificación
  message: {
    message: 'Demasiados intentos de verificación. Inténtalo de nuevo en 5 minutos.',
    code: 'VERIFICATION_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ✅ MEJORADO: Middleware de autenticación con mejores prácticas
export const authenticateTokenSecure = (req, res, next) => {
  const startTime = Date.now();
    
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        
    if (!token) {
      logger.warn('Token no proporcionado', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method
      });
            
      return res.status(401).json({ 
        message: 'No autorizado - Token no proporcionado',
        code: 'TOKEN_MISSING'
      });
    }

    // ✅ MEJORADO: Verificar si el token está en la lista negra
    if (tokenBlacklist.isBlacklisted(token)) {
      logger.warn('Token en lista negra usado', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        tokenHash: hashToken(token)
      });
            
      return res.status(401).json({ 
        message: 'No autorizado - Token inválido',
        code: 'TOKEN_BLACKLISTED'
      });
    }

    // ✅ MEJORADO: Validación más estricta del formato del token
    if (typeof token !== 'string' || token.length < 20 || token.length > 500) {
      logger.warn('Token con formato inválido', {
        ip: req.ip,
        tokenLength: token.length,
        tokenType: typeof token
      });
            
      return res.status(401).json({ 
        message: 'No autorizado - Formato de token inválido',
        code: 'TOKEN_INVALID_FORMAT'
      });
    }
        
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'], // ✅ MEJORADO: Especificar algoritmo
      issuer: process.env.JWT_ISSUER || 'sabor-app',
      audience: process.env.JWT_AUDIENCE || 'sabor-users'
    });
        
    // ✅ MEJORADO: Validación más estricta de la estructura del token
    if (!decoded.id || !decoded.email || !decoded.rol || !decoded.iat || !decoded.exp) {
      logger.warn('Token malformado', {
        ip: req.ip,
        tokenFields: Object.keys(decoded),
        userId: decoded.id
      });
            
      return res.status(401).json({ 
        message: 'No autorizado - Token malformado',
        code: 'TOKEN_MALFORMED'
      });
    }

    // ✅ MEJORADO: Verificar que el token no sea demasiado antiguo
    const tokenAge = Date.now() - (decoded.iat * 1000);
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
        
    if (tokenAge > maxAge) {
      logger.warn('Token muy antiguo', {
        ip: req.ip,
        userId: decoded.id,
        tokenAge: tokenAge,
        maxAge: maxAge
      });
            
      return res.status(401).json({ 
        message: 'No autorizado - Token expirado',
        code: 'TOKEN_TOO_OLD'
      });
    }

    // ✅ MEJORADO: Agregar información adicional al request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol,
      nombre: decoded.nombre || null,
      tokenIat: decoded.iat,
      tokenExp: decoded.exp
    };

    // ✅ MEJORADO: Log de autenticación exitosa
    logger.info('Autenticación exitosa', {
      userId: decoded.id,
      userEmail: decoded.email,
      userRole: decoded.rol,
      ip: req.ip,
      path: req.path,
      method: req.method,
      duration: Date.now() - startTime
    });

    next();
        
  } catch (error) {
    const duration = Date.now() - startTime;
        
    logger.error('Error en autenticación', {
      error: error.message,
      errorType: error.name,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      duration: duration
    });
        
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'No autorizado - Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        message: 'No autorizado - Token inválido',
        code: 'TOKEN_INVALID'
      });
    } else if (error.name === 'NotBeforeError') {
      return res.status(401).json({ 
        message: 'No autorizado - Token no válido todavía',
        code: 'TOKEN_NOT_ACTIVE'
      });
    } else {
      return res.status(500).json({ 
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }
};

// ✅ MEJORADO: Middleware para verificar roles con auditoría
export const checkRoleSecure = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn('Usuario no autenticado intentando acceso', {
        ip: req.ip,
        path: req.path,
        method: req.method
      });
            
      return res.status(401).json({ 
        message: 'No autorizado - Usuario no autenticado',
        code: 'USER_NOT_AUTHENTICATED'
      });
    }

    if (!Array.isArray(roles)) {
      roles = [roles];
    }

    if (!roles.includes(req.user.rol)) {
      logger.warn('Acceso denegado por rol', {
        userId: req.user.id,
        userRole: req.user.rol,
        requiredRoles: roles,
        ip: req.ip,
        path: req.path,
        method: req.method
      });
            
      return res.status(403).json({ 
        message: 'No autorizado - Permisos insuficientes',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    logger.info('Acceso autorizado por rol', {
      userId: req.user.id,
      userRole: req.user.rol,
      requiredRoles: roles,
      ip: req.ip,
      path: req.path,
      method: req.method
    });

    next();
  };
};

// ✅ MEJORADO: Función para crear hash del token (para logs seguros)
function hashToken(token) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(token).digest('hex').substring(0, 8);
}

// ✅ MEJORADO: Middleware para invalidar tokens
export const logoutSecure = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
  if (token) {
    // Agregar token a la lista negra
    tokenBlacklist.add(token);
        
    logger.info('Token invalidado por logout', {
      userId: req.user?.id,
      tokenHash: hashToken(token),
      ip: req.ip
    });
  }
    
  // Limpiar cookie
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
    
  next();
};

// ✅ MEJORADO: Middleware para detectar sesiones concurrentes
export const detectConcurrentSessions = (req, res, next) => {
  // Implementar lógica para detectar múltiples sesiones del mismo usuario
  // Esto requeriría una tabla de sesiones activas en la base de datos
  next();
}; 