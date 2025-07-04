import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ 
                message: 'No autorizado - Token no proporcionado',
                code: 'TOKEN_MISSING'
            });
        }

        // Verificar que el token tenga el formato correcto
        if (typeof token !== 'string' || token.length < 10) {
            return res.status(401).json({ 
                message: 'No autorizado - Formato de token inválido',
                code: 'TOKEN_INVALID_FORMAT'
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        
        // Validar que el token contenga la información necesaria
        if (!decoded.id || !decoded.email || !decoded.rol) {
            return res.status(401).json({ 
                message: 'No autorizado - Token malformado',
                code: 'TOKEN_MALFORMED'
            });
        }

        // Verificar que el token no haya expirado (verificación adicional)
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < currentTime) {
            return res.status(401).json({ 
                message: 'No autorizado - Token expirado',
                code: 'TOKEN_EXPIRED'
            });
        }

        // Agregar la información del usuario al request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            rol: decoded.rol,
            nombre: decoded.nombre || null
        };

        next();
    } catch (error) {
        console.error('Error en autenticación:', error.message);
        
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
        } else {
            return res.status(500).json({ 
                message: 'Error interno del servidor',
                code: 'INTERNAL_ERROR'
            });
        }
    }
};

// Middleware para verificar roles
export const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                message: 'No autorizado - Usuario no autenticado',
                code: 'USER_NOT_AUTHENTICATED'
            });
        }

        if (!Array.isArray(roles)) {
            roles = [roles];
        }

        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({ 
                message: 'No autorizado - Rol no permitido',
                code: 'INSUFFICIENT_PERMISSIONS',
                requiredRoles: roles,
                userRole: req.user.rol
            });
        }

        next();
    };
};

// Middleware para verificar que el usuario es propietario del recurso
export const checkOwnership = (resourceIdField = 'id') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                message: 'No autorizado - Usuario no autenticado',
                code: 'USER_NOT_AUTHENTICATED'
            });
        }

        const resourceId = req.params[resourceIdField] || req.body[resourceIdField];
        
        if (!resourceId) {
            return res.status(400).json({ 
                message: 'ID del recurso no proporcionado',
                code: 'RESOURCE_ID_MISSING'
            });
        }

        // Permitir acceso si es admin o si es el propietario del recurso
        if (req.user.rol === 'admin' || req.user.id.toString() === resourceId.toString()) {
            return next();
        }

        return res.status(403).json({ 
            message: 'No autorizado - No tienes permisos para acceder a este recurso',
            code: 'RESOURCE_ACCESS_DENIED'
        });
    };
};

// Middleware para verificar permisos específicos
export const checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                message: 'No autorizado - Usuario no autenticado',
                code: 'USER_NOT_AUTHENTICATED'
            });
        }

        // Definir permisos por rol
        const rolePermissions = {
            admin: ['read', 'write', 'delete', 'manage_users', 'manage_products', 'manage_orders'],
            manager: ['read', 'write', 'manage_products', 'manage_orders'],
            user: ['read', 'write_own']
        };

        const userPermissions = rolePermissions[req.user.rol] || [];
        
        if (!userPermissions.includes(permission)) {
            return res.status(403).json({ 
                message: 'No autorizado - Permiso insuficiente',
                code: 'INSUFFICIENT_PERMISSIONS',
                requiredPermission: permission,
                userPermissions: userPermissions
            });
        }

        next();
    };
};

// Middleware para verificar que el usuario está activo
export const checkUserActive = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            message: 'No autorizado - Usuario no autenticado',
            code: 'USER_NOT_AUTHENTICATED'
        });
    }

    // Aquí podrías verificar en la base de datos si el usuario está activo
    // Por ahora, asumimos que si tiene token válido está activo
    next();
};

// Middleware para logging de autenticación
export const logAuthAttempt = (req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logData = {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress,
            timestamp: new Date().toISOString()
        };

        if (req.user) {
            logData.userId = req.user.id;
            logData.userEmail = req.user.email;
            logData.userRole = req.user.rol;
        }

        console.log('Auth Log:', JSON.stringify(logData));
    });

    next();
}; 