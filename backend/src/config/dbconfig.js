// Conexion a base de datos mySQL
import mysql from "mysql2/promise";
import { config } from "./config.js";

// Configuración de conexión mejorada para producción
export const dbConfig = {
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  port: config.db.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Configuraciones adicionales para producción
  acquireTimeout: 10000,
  // Configuraciones específicas para Railway/Producción
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  // Configuración de timeout para conexiones lentas
  connectTimeout: 10000,
  // Configuración de charset
  charset: "utf8mb4",
};

// Función para crear conexiones individuales usando variables de entorno
export const createConnection = async () => {
  const connection = await mysql.createConnection({
    host: process.env.MYSQLHOST || process.env.DB_HOST,
    port: process.env.MYSQLPORT || process.env.DB_PORT,
    user: process.env.MYSQLUSER || process.env.DB_USER,
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQLDATABASE || process.env.DB_NAME,
    // Configuraciones adicionales para producción
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
    connectTimeout: 10000,
    charset: "utf8mb4",
  });
  return connection;
};

// Pool de conexiones reutilizable (mantiene la funcionalidad existente)
export const pool = mysql.createPool(dbConfig);

// Exportar como default para compatibilidad con healthcheck
const defaultDb = {
  execute: async (query, params) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(query, params);
      return [rows];
    } finally {
      connection.release();
    }
  },
};

export default defaultDb;
