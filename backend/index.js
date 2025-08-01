import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './src/config/config.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';
import { 
    createRateLimiter, 
    authRateLimiter, 
    registerRateLimiter,
    sanitizeInput,
    preventSQLInjection 
} from './src/middleware/security.js';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import clienteRoutes from './src/routes/clienteRoutes.js';
import empleadoRoutes from './src/routes/empleadoRoutes.js';
import productoRoutes from './src/routes/productoRoutes.js';
import categoriaRoutes from './src/routes/categoriaRoutes.js';
import reservaRoutes from './src/routes/reservaRoutes.js';
import pedidoRoutes from './src/routes/pedidoRoutes.js';
import horarioRoutes from './src/routes/horarioRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import helmet from 'helmet';
import mensajeContactoRoutes from './src/routes/contactoRoutes.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de seguridad con Helmet (modificada para permitir imágenes)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:", "http://localhost:3000"],
            fontSrc: ["'self'", "data:"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Configuración de CORS más permisiva para desarrollo
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400 // 24 horas
}));

// Rate limiting general
app.use(createRateLimiter());

// Middlewares básicos
app.use(express.json({ limit: '10mb' })); // Limitar tamaño de JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.cookie.secret));

// Sanitización de datos de entrada
app.use(sanitizeInput);

// Prevención de inyección SQL básica
app.use(preventSQLInjection);

// Middleware para prevenir ataques de enumeración de usuarios (aplicado a todas las rutas de auth)
app.use('/api/auth', (req, res, next) => {
    // Agregar delay aleatorio para prevenir timing attacks
    const delay = Math.random() * 100 + 50; // 50-150ms
    setTimeout(next, delay);
});

// Rutas con rate limiting específico
app.use('/api/auth', authRateLimiter, authRoutes);

// Rutas de usuarios, clientes y empleados
app.use('/api/users', userRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/empleados', empleadoRoutes);

// Rutas de productos con validaciones adicionales
app.use('/api/productos', productoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/horarios', horarioRoutes);
app.use('/api', mensajeContactoRoutes);

// Servir archivos estáticos con validaciones de seguridad
// Ruta principal para uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'), {
    setHeaders: (res, filePath) => {
        // Headers de CORS para imágenes
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        // Prevenir ejecución de archivos
        if (filePath.endsWith('.js') || filePath.endsWith('.php') || filePath.endsWith('.exe')) {
            res.setHeader('Content-Type', 'text/plain');
        }
        
        // Headers de seguridad para archivos estáticos
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        // Permitir acceso a imágenes
        if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 año
            res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        }
    }
}));

app.use('/uploads/productos', express.static(path.join(__dirname, '../public/uploads/productos'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js') || filePath.endsWith('.php') || filePath.endsWith('.exe')) {
            res.setHeader('Content-Type', 'text/plain');
        }
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
    }
}));

// Middlewares de error
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
const PORT = config.server.port;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT} en modo ${config.server.mode}`);
    console.log('Configuración de seguridad activada');
});

export default app;
