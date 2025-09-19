import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./src/config/config.js";
import {
  errorHandler,
  notFoundHandler,
} from "./src/middleware/errorHandler.js";
import {
  helmetConfig,
  createRateLimiter,
  authRateLimiter,
  registerRateLimiter,
  sanitizeInput,
  preventSQLInjection,
} from "./src/middleware/security.js";
import authRoutes from "./src/routes/authRoutes.js";
import productoRoutes from "./src/routes/productoRoutes.js";
import categoriaRoutes from "./src/routes/categoriaRoutes.js";
import reservaRoutes from "./src/routes/reservaRoutes.js";
import pedidoRoutes from "./src/routes/pedidoRoutes.js";
import horarioRoutes from "./src/routes/horarioRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import helmet from "helmet";
import mensajeContactoRoutes from "./src/routes/contactoRoutes.js";
import mercadopagoRoutes from "./src/routes/mercadopagoRoutes.js";
import payuRoutes from "./src/routes/payuRoutes.js";
import webhookRoutes from "./src/routes/webhookRoutes.js";
import calificacionRoutes from "./src/routes/calificacionRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import healthRoutes from "./src/routes/healthRoutes.js";

// NUEVO: Importa las rutas de domicilios
import domicilioRoutes from "./src/routes/domicilioRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de seguridad con Helmet (modificada para permitir imágenes)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "'data:'", "'https:'", "'http://localhost:3000'"],
        fontSrc: ["'self'", "'data:'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// Configuración de CORS dinámico para desarrollo y producción
const corsOptions = {
  origin: (origin, callback) => {
    // Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Lista de orígenes permitidos
    const allowedOrigins = [
      "http://localhost:5173", // Desarrollo frontend
      "http://localhost:3000", // Desarrollo backend
      "http://localhost:4173", // Preview frontend
    ];

    // En producción, agregar URLs de Railway y CORS_ORIGIN
    if (process.env.NODE_ENV === "production") {
      if (process.env.RAILWAY_STATIC_URL) {
        allowedOrigins.push(process.env.RAILWAY_STATIC_URL);
      }
      if (process.env.CORS_ORIGIN) {
        allowedOrigins.push(process.env.CORS_ORIGIN);
      }
      if (process.env.FRONTEND_URL) {
        allowedOrigins.push(process.env.FRONTEND_URL);
      }
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  maxAge: 86400, // 24 horas
};

app.use(cors(corsOptions));

// Rate limiting general
app.use(createRateLimiter());

// Middlewares básicos
app.use(express.json({ limit: "10mb" })); // Limitar tamaño de JSON
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser(config.cookie.secret));

// Sanitización de datos de entrada
app.use(sanitizeInput);

// Prevención de inyección SQL básica
app.use(preventSQLInjection);

// Middleware para prevenir ataques de enumeración de clientes (aplicado a todas las rutas de auth)
app.use("/api/auth", (req, res, next) => {
  // Agregar delay aleatorio para prevenir timing attacks
  const delay = Math.random() * 100 + 50; // 50-150ms
  setTimeout(next, delay);
});

// Rutas con rate limiting específico
app.use("/api/auth", authRateLimiter, authRoutes);

// Rutas de productos con validaciones adicionales
app.use("/api/productos", productoRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/reservas", reservaRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/horarios", horarioRoutes);
app.use("/api", mensajeContactoRoutes);
app.use("/api/mercadopago", mercadopagoRoutes);
app.use("/api/payu", payuRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/calificaciones", calificacionRoutes);
app.use("/api/dashboard", dashboardRoutes);

// NUEVO: Ruta para historial de domicilios
app.use("/api/domicilios", domicilioRoutes);

// Health check routes (sin autenticación para monitoreo)
app.use("/api", healthRoutes);

// Servir archivos estáticos con validaciones de seguridad
// Ruta principal para uploads
app.use(
  "/uploads",
  express.static(path.join(__dirname, "public/uploads"), {
    setHeaders: (res, filePath) => {
      // Headers de CORS para imágenes
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");

      // Prevenir ejecución de archivos
      if (
        filePath.endsWith(".js") ||
        filePath.endsWith(".php") ||
        filePath.endsWith(".exe")
      ) {
        res.setHeader("Content-Type", "text/plain");
      }

      // Headers de seguridad para archivos estáticos
      res.setHeader("X-Content-Type-Options", "nosniff");

      // Permitir acceso a imágenes
      if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 año
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      }
    },
  }),
);

app.use(
  "/uploads/productos",
  express.static(path.join(__dirname, "../public/uploads/productos"), {
    setHeaders: (res, filePath) => {
      if (
        filePath.endsWith(".js") ||
        filePath.endsWith(".php") ||
        filePath.endsWith(".exe")
      ) {
        res.setHeader("Content-Type", "text/plain");
      }
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("X-Frame-Options", "DENY");
    },
  }),
);

// Servir archivos estáticos del frontend React
app.use(
  express.static(path.join(__dirname, "public/dist"), {
    index: false, // No servir index.html automáticamente
    setHeaders: (res, filePath) => {
      // Configurar headers para archivos estáticos
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      } else if (
        filePath.match(
          /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/,
        )
      ) {
        res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 año
      }
    },
  }),
);

// Ruta para servir el index.html del frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/dist/index.html"));
});

// Middlewares de error
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || config.server.port || 3000;

// Configurar trust proxy de manera segura para Railway
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1); // Solo confiar en el primer proxy (Railway)
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Servidor corriendo en puerto ${PORT} en modo ${config.server.mode}`,
  );
  console.log("Configuración de seguridad activada");

  // Log adicional para Railway
  if (process.env.RAILWAY_ENVIRONMENT) {
    console.log(
      `🚄 Desplegado en Railway - Environment: ${process.env.RAILWAY_ENVIRONMENT}`,
    );
    console.log(`🌐 URL: ${process.env.RAILWAY_STATIC_URL || "No disponible"}`);
  }
});

export default app;
