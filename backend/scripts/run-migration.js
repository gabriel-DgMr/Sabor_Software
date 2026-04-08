import mysql from "mysql2/promise";
import { config } from "../src/core/config/config.js";
import fs from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  const connection = await mysql.createConnection({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    port: config.db.port,
  });

  try {
    console.log("Conectado a la base de datos...");
    const sqlPath = join(__dirname, "add-mensaje-to-detalle-pedidos.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    console.log("Ejecutando migración...");
    await connection.query(sql);
    console.log("Migración completada con éxito.");
  } catch (error) {
    if (error.code === "ER_DUP_COLUMN_NAME") {
      console.log("La columna 'mensaje' ya existe.");
    } else {
      console.error("Error durante la migración:", error);
      process.exit(1);
    }
  } finally {
    await connection.end();
  }
}

runMigration();
