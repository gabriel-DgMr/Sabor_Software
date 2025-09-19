#!/usr/bin/env node

import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import { config } from "../src/config/config.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Script de migración de base de datos
 */

class DatabaseMigrator {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        port: config.db.port,
        multipleStatements: true,
      });

      console.log("✅ Conectado a MySQL");
    } catch (error) {
      console.error("❌ Error conectando a MySQL:", error.message);
      process.exit(1);
    }
  }

  async createDatabase() {
    try {
      await this.connection.execute(
        `CREATE DATABASE IF NOT EXISTS \`${config.db.database}\``,
      );
      await this.connection.execute(`USE \`${config.db.database}\``);
      console.log(
        `✅ Base de datos '${config.db.database}' creada/seleccionada`,
      );
    } catch (error) {
      console.error("❌ Error creando base de datos:", error.message);
      throw error;
    }
  }

  async runMigration(filePath, description) {
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Archivo de migración no encontrado: ${filePath}`);
        return;
      }

      const sql = fs.readFileSync(filePath, "utf8");
      await this.connection.execute(sql);
      console.log(`✅ ${description} ejecutada correctamente`);
    } catch (error) {
      console.error(`❌ Error ejecutando ${description}:`, error.message);
      throw error;
    }
  }

  async checkTables() {
    try {
      const [rows] = await this.connection.execute("SHOW TABLES");
      console.log(`✅ Base de datos contiene ${rows.length} tablas`);

      if (rows.length > 0) {
        console.log("📋 Tablas encontradas:");
        rows.forEach((row) => {
          const tableName = Object.values(row)[0];
          console.log(`   - ${tableName}`);
        });
      }
    } catch (error) {
      console.error("❌ Error verificando tablas:", error.message);
    }
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
      console.log("✅ Conexión cerrada");
    }
  }

  async migrate() {
    try {
      await this.connect();
      await this.createDatabase();

      // Ejecutar migración principal
      const schemaPath = path.join(__dirname, "../db.sql");
      await this.runMigration(schemaPath, "Migración de esquema principal");

      // Ejecutar migración de PayU si existe
      const payuMigrationPath = path.join(__dirname, "../migration_payu.sql");
      await this.runMigration(payuMigrationPath, "Migración de PayU");

      await this.checkTables();

      console.log("🎉 Migración completada exitosamente");
    } catch (error) {
      console.error("💥 Error durante la migración:", error.message);
      process.exit(1);
    } finally {
      await this.close();
    }
  }
}

// Ejecutar migración si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const migrator = new DatabaseMigrator();
  migrator.migrate();
}

export default DatabaseMigrator;
