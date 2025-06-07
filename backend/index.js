import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './src/config/config.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';
import authRoutes from './src/routes/authRoutes.js';
import productoRoutes from './src/routes/productoRoutes.js';
import categoriaRoutes from './src/routes/categoriaRoutes.js';
import reservaRoutes from './src/routes/reservaRoutes.js';
import pedidoRoutes from './src/routes/pedidoRoutes.js';
import horarioRoutes from './src/routes/horarioRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware para loggear requests (temporal)
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

// Middlewares
app.use(express.json());
app.use(cookieParser(config.cookie.secret));
app.use(cors({
    origin: config.cors.origin,
    credentials: true
}));

// Rutas
console.log('Setting up routes...');
console.log('Horario routes:', horarioRoutes.stack.map(layer => layer.route)); // Loggea las rutas definidas en horarioRoutes
app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/horarios', horarioRoutes);

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/uploads/productos', express.static(path.join(__dirname, '../public/uploads/productos')));

// Middlewares de error
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT} en modo ${config.nodeEnv}`);
});

export default app;
