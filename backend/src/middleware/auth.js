import jwt from 'jsonwebtoken';
import * as userModel from '../models/userModel.js';

// Validar que JWT_SECRET esté configurado
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET es requerido. Configurar en variables de entorno.');
}

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
        
        // Verificar y decodificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Validar que el token contenga la información necesaria
        if (!decoded.id || !decoded.email || !decoded.tipo_usuario) {
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
            tipo_usuario: decoded.tipo_usuario,
            // Mantener compatibilidad con rol para código existente
            rol: decoded.tipo_usuario === 'administrador' ? 'admin' : decoded.tipo_usuario
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

// Middleware para verificar que el usuario existe y está activo
export const checkUserActive = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                message: 'No autorizado - Usuario no autenticado',
                code: 'USER_NOT_AUTHENTICATED'
            });
        }

        // Verificar que el usuario existe y está activo en la base de datos
        const isActiveAndVerified = await userModel.isUserActiveAndVerified(req.user.id);
        
        if (!isActiveAndVerified) {
            return res.status(401).json({ 
                message: 'No autorizado - Usuario inactivo o no verificado',
                code: 'USER_INACTIVE'
            });
        }

        next();
    } catch (error) {
        console.error('Error verificando usuario activo:', error);
        return res.status(500).json({ 
            message: 'Error interno del servidor',
            code: 'INTERNAL_ERROR'
        });
    }
};

// Middleware para verificar tipos de usuario (actualizado para nueva estructura)
export const checkUserType = (allowedTypes) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                message: 'No autorizado - Usuario no autenticado',
                code: 'USER_NOT_AUTHENTICATED'
            });
        }

        if (!Array.isArray(allowedTypes)) {
            allowedTypes = [allowedTypes];
        }

        if (!allowedTypes.includes(req.user.tipo_usuario)) {
            return res.status(403).json({ 
                message: 'No autorizado - Tipo de usuario no permitido',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }

        next();
    };
};

// Middleware para verificar roles (manteniendo compatibilidad)
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

        // Mapear tipos de usuario a roles para compatibilidad
        const userRole = req.user.tipo_usuario === 'administrador' ? 'admin' : req.user.tipo_usuario;

        if (!roles.includes(userRole)) {
            return res.status(403).json({ 
                message: 'No autorizado - Permisos insuficientes',
                code: 'INSUFFICIENT_PERMISSIONS'
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
        if (req.user.tipo_usuario === 'administrador' || req.user.id.toString() === resourceId.toString()) {
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

        // Definir permisos por tipo de usuario
        const userTypePermissions = {
            administrador: ['read', 'write', 'delete', 'manage_users', 'manage_products', 'manage_orders', 'manage_employees'],
            empleado: ['read', 'write', 'manage_products', 'manage_orders'],
            cliente: ['read', 'write_own', 'create_orders', 'view_own_orders']
        };

        const userPermissions = userTypePermissions[req.user.tipo_usuario] || [];
        
        if (!userPermissions.includes(permission)) {
            return res.status(403).json({ 
                message: 'No autorizado - Permisos insuficientes',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }

        next();
    };
};

// Middleware para verificar que el usuario puede acceder a datos de cliente
export const checkClientAccess = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                message: 'No autorizado - Usuario no autenticado',
                code: 'USER_NOT_AUTHENTICATED'
            });
        }

        // Los administradores y empleados pueden acceder a todos los datos de clientes
        if (req.user.tipo_usuario === 'administrador' || req.user.tipo_usuario === 'empleado') {
            return next();
        }

        // Los clientes solo pueden acceder a sus propios datos
        if (req.user.tipo_usuario === 'cliente') {
            const clienteData = await userModel.getClienteByUserId(req.user.id);
            if (!clienteData) {
                return res.status(404).json({ 
                    message: 'Cliente no encontrado',
                    code: 'CLIENT_NOT_FOUND'
                });
            }
            
            // Agregar información del cliente al request
            req.cliente = clienteData;
            return next();
        }

        return res.status(403).json({ 
            message: 'No autorizado - Acceso denegado',
            code: 'ACCESS_DENIED'
        });

    } catch (error) {
        console.error('Error verificando acceso de cliente:', error);
        return res.status(500).json({ 
            message: 'Error interno del servidor',
            code: 'INTERNAL_ERROR'
        });
    }
};

// Middleware para verificar que el usuario puede acceder a datos de empleado
export const checkEmployeeAccess = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                message: 'No autorizado - Usuario no autenticado',
                code: 'USER_NOT_AUTHENTICATED'
            });
        }

        // Solo administradores y empleados pueden acceder a datos de empleados
        if (req.user.tipo_usuario === 'administrador' || req.user.tipo_usuario === 'empleado') {
            
            // Si es empleado, verificar que existe en la base de datos
            if (req.user.tipo_usuario === 'empleado') {
                const empleadoData = await userModel.getEmpleadoByUserId(req.user.id);
                if (!empleadoData) {
                    return res.status(404).json({ 
                        message: 'Empleado no encontrado',
                        code: 'EMPLOYEE_NOT_FOUND'
                    });
                }
                req.empleado = empleadoData;
            }
            
            return next();
        }

        return res.status(403).json({ 
            message: 'No autorizado - Acceso denegado',
            code: 'ACCESS_DENIED'
        });

    } catch (error) {
        console.error('Error verificando acceso de empleado:', error);
        return res.status(500).json({ 
            message: 'Error interno del servidor',
            code: 'INTERNAL_ERROR'
        });
    }
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
            logData.userType = req.user.tipo_usuario;
        }

        // Solo log en desarrollo o errores
        if (process.env.NODE_ENV === 'development' || res.statusCode >= 400) {
            console.log('Auth attempt:', logData);
        }
    });

    next();
};

// Middleware opcional para autenticación (no falla si no hay token)
export const authenticateTokenOptional = (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return next(); // Continuar sin autenticación
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.id && decoded.email && decoded.tipo_usuario) {
            req.user = {
                id: decoded.id,
                email: decoded.email,
                tipo_usuario: decoded.tipo_usuario,
                rol: decoded.tipo_usuario === 'administrador' ? 'admin' : decoded.tipo_usuario
            };
        }

        next();
    } catch (error) {
        // En caso de error, simplemente continuar sin autenticación
        next();
    }
};

// Middleware para refrescar token si está próximo a expirar
export const refreshTokenIfNeeded = (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentTime = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = decoded.exp - currentTime;

        // Si el token expira en menos de 30 minutos, generar uno nuevo
        if (timeUntilExpiry < 1800) { // 30 minutos
            const newToken = jwt.sign(
                { 
                    id: decoded.id, 
                    email: decoded.email, 
                    tipo_usuario: decoded.tipo_usuario 
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Enviar el nuevo token en el header de respuesta
            res.setHeader('X-New-Token', newToken);
        }

        next();
    } catch (error) {
        // En caso de error, simplemente continuar
        next();
    }
}; 