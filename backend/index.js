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
import webhookRoutes from "./src/routes/webhookRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import domicilioRoutes from "./src/routes/domicilioRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================
// Seguridad con Helmet
// ============================
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

// ============================
// Configuración CORS
// ============================
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    maxAge: 86400, // 24 horas
  }),
);

// ============================
// Middlewares globales
// ============================
app.use(createRateLimiter());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser(config.cookie.secret));
app.use(sanitizeInput);
app.use(preventSQLInjection);

// Delay random para prevenir timing attacks en auth
app.use("/api/auth", (req, res, next) => {
  const delay = Math.random() * 100 + 50; // 50-150ms
  setTimeout(next, delay);
});

// ============================
// Rutas API
// ============================
app.use("/api/auth", authRateLimiter, authRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/reservas", reservaRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/horarios", horarioRoutes);
app.use("/api", mensajeContactoRoutes);
app.use("/api/mercadopago", mercadopagoRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/domicilios", domicilioRoutes);

// ============================
// Archivos estáticos seguros
// ============================
app.use(
  "/uploads",
  express.static(path.join(__dirname, "public/uploads"), {
    setHeaders: (res, filePath) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");

      if (
        filePath.endsWith(".js") ||
        filePath.endsWith(".php") ||
        filePath.endsWith(".exe")
      ) {
        res.setHeader("Content-Type", "text/plain");
      }

      res.setHeader("X-Content-Type-Options", "nosniff");

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

// ============================
// Middlewares de error
// ============================
app.use(notFoundHandler);
app.use(errorHandler);

// ============================
// Iniciar servidor
// ============================
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(
    `Servidor corriendo en puerto ${PORT} en modo ${config.server.mode}`,
  );
  console.log("Configuración de seguridad activada");
});

export default app;