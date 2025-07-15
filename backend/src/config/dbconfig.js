// Conexion a base de datos mySQL
import { config } from './config.js';

export const dbConfig = {
  host: config.db.host,
  user: config.db.user, 
  password: config.db.password,
  database: config.db.database,
  port: config.db.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};