import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '../../.env') });

// Validar variables de entorno requeridas
const requiredEnvVars = [
    'DB_PASSWORD',
    'DB_HOST',
    'DB_USER',
    'DB_NAME',
    'PORT',
    'NODE_ENV',
    'JWT_SECRET',
    'COOKIE_SECRET',
    'EMAIL_USER',
    'EMAIL_PASSWORD'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    throw new Error(
        `Faltan las siguientes variables de entorno requeridas: ${missingEnvVars.join(', ')}`
    );
}

export const config = {
    // Configuración del servidor
    server: {
        port: process.env.PORT || 3000,
        mode: process.env.NODE_ENV || 'development'
    },

    // Configuración de la base de datos
    db: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'sabor_db',
        port: process.env.DB_PORT || 3306
    },

    // Configuración de JWT
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },

    // Configuración de CORS
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
    },

    // Configuración de cookies
    cookie: {
        secret: process.env.COOKIE_SECRET
    },

    // Configuración de correo electrónico
    email: {
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD
    },

    // URL del frontend
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
};

