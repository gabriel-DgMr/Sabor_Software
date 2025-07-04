import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        console.log('JWT_SECRET en uso:', process.env.JWT_SECRET);
        console.log('Token recibido:', token);
        if (!token) {
            console.log('No se proporcionó token');
            return res.status(401).json({ message: 'No autorizado - Token no proporcionado' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        console.log('Token decodificado:', decoded);
        req.user = decoded;
        console.log('Pasando al siguiente middleware/controlador');
        next();
    } catch (error) {
        console.error('Error al verificar token:', error);
        return res.status(403).json({ message: 'No autorizado - Token inválido', detalle: error.message });
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