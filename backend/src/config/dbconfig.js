// Conexion a base de datos mySQL
import mysql from "mysql2/promise";
import { config } from "./config.js";

export const dbConfig = {
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  port: config.db.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Función para crear conexiones individuales usando variables de entorno
export const createConnection = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  return connection;
};

// Pool de conexiones reutilizable (mantiene la funcionalidad existente)
export const pool = mysql.createPool(dbConfig);
