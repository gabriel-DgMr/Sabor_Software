import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    try {
        // Obtener el token del header o de las cookies
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                message: 'No autorizado - Token no proporcionado' 
            });
        }

        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        
        // Agregar la información del usuario al request
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ 
            message: 'No autorizado - Token inválido' 
        });
    }
};

// Middleware para verificar roles
export const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                message: 'No autorizado - Usuario no autenticado' 
            });
        }

        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({ 
                message: 'No autorizado - Rol no permitido' 
            });
        }

        next();
    };
}; 