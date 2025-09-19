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
 * Script completo de configuración de base de datos para producción
 */

class DatabaseSetup {
  constructor() {
    this.connection = null;
    this.rootConnection = null;
  }

  async connectAsRoot() {
    try {
      // Intentar conectar como root para configuraciones iniciales
      this.rootConnection = await mysql.createConnection({
        host: config.db.host,
        user: "root",
        password: process.env.DB_ROOT_PASSWORD || config.db.password,
        port: config.db.port,
        multipleStatements: true,
      });

      console.log("✅ Conectado a MySQL como root");
      return true;
    } catch (error) {
      console.log(
        "⚠️  No se pudo conectar como root, usando credenciales de aplicación",
      );
      return false;
    }
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

  async setupProductionDatabase() {
    try {
      const isProduction = process.env.NODE_ENV === "production";
      console.log(
        `🔧 Configurando base de datos para ${isProduction ? "PRODUCCIÓN" : "DESARROLLO"}`,
      );

      // Leer y ejecutar script de producción
      const productionScriptPath = path.join(__dirname, "../db.production.sql");
      if (fs.existsSync(productionScriptPath)) {
        console.log("📄 Ejecutando script de configuración de producción...");
        const productionScript = fs.readFileSync(productionScriptPath, "utf8");

        const connection = this.rootConnection || this.connection;

        // Dividir el script en comandos individuales y ejecutarlos uno por uno
        const commands = productionScript
          .split(";")
          .map((cmd) => cmd.trim())
          .filter((cmd) => cmd.length > 0 && !cmd.startsWith("--"));

        for (const command of commands) {
          if (command.trim()) {
            await connection.execute(command);
          }
        }

        console.log("✅ Script de producción ejecutado correctamente");
      }

      // Ejecutar script principal de esquema solo si es necesario
      const schemaPath = path.join(__dirname, "../db.sql");
      if (fs.existsSync(schemaPath) && !isProduction) {
        console.log("📄 Ejecutando script de esquema principal...");
        const schemaScript = fs.readFileSync(schemaPath, "utf8");
        await this.connection.execute(`USE \`${config.db.database}\``);
        await this.connection.execute(schemaScript);
        console.log("✅ Esquema principal ejecutado correctamente");
      } else if (isProduction) {
        console.log(
          "📊 Saltando script de esquema en producción (base de datos ya configurada)",
        );
      }

      // Ejecutar migración de PayU si existe y no es producción
      const payuMigrationPath = path.join(__dirname, "../migration_payu.sql");
      if (fs.existsSync(payuMigrationPath) && !isProduction) {
        console.log("📄 Ejecutando migración de PayU...");
        const payuScript = fs.readFileSync(payuMigrationPath, "utf8");
        await this.connection.execute(payuScript);
        console.log("✅ Migración de PayU ejecutada correctamente");
      } else if (isProduction) {
        console.log(
          "📊 Saltando migración de PayU en producción (base de datos ya configurada)",
        );
      }
    } catch (error) {
      console.error("❌ Error configurando base de datos:", error.message);
      throw error;
    }
  }

  async optimizeForProduction() {
    try {
      console.log("⚡ Aplicando optimizaciones para producción...");

      const optimizations = [
        // Configuraciones de rendimiento
        "SET GLOBAL innodb_buffer_pool_size = 1073741824",
        "SET GLOBAL max_connections = 200",
        "SET GLOBAL query_cache_size = 67108864",
        "SET GLOBAL slow_query_log = 1",
        "SET GLOBAL long_query_time = 2",

        // Configuraciones de seguridad
        "SET GLOBAL local_infile = 0",
        "SET GLOBAL secure_file_priv = '/var/lib/mysql-files/'",
      ];

      for (const optimization of optimizations) {
        try {
          await (this.rootConnection || this.connection).execute(optimization);
        } catch (error) {
          console.log(
            `⚠️  No se pudo aplicar: ${optimization} - ${error.message}`,
          );
        }
      }

      console.log("✅ Optimizaciones aplicadas");
    } catch (error) {
      console.error("⚠️  Error aplicando optimizaciones:", error.message);
    }
  }

  async createBackupUser() {
    try {
      if (!this.rootConnection) {
        console.log(
          "⚠️  Se necesitan permisos de root para crear usuario de backup",
        );
        return;
      }

      console.log("👤 Creando usuario de backup...");

      const backupPassword =
        process.env.DB_BACKUP_PASSWORD || "backup_secure_password_2024!";

      await this.rootConnection.execute(`
        CREATE USER IF NOT EXISTS 'sabor_backup'@'localhost' IDENTIFIED BY '${backupPassword}';
        GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER ON ${config.db.database}.* TO 'sabor_backup'@'localhost';
        FLUSH PRIVILEGES;
      `);

      console.log("✅ Usuario de backup creado correctamente");
      console.log(
        `📝 Credenciales de backup: sabor_backup / ${backupPassword}`,
      );
    } catch (error) {
      console.error("⚠️  Error creando usuario de backup:", error.message);
    }
  }

  async verifySetup() {
    try {
      console.log("🔍 Verificando configuración...");

      // Verificar tablas
      const [tables] = await this.connection.execute(`
        SELECT TABLE_NAME, TABLE_ROWS, DATA_LENGTH, INDEX_LENGTH 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = '${config.db.database}'
      `);

      console.log(`📊 Base de datos contiene ${tables.length} tablas:`);
      tables.forEach((table) => {
        const sizeMB = (
          (table.DATA_LENGTH + table.INDEX_LENGTH) /
          1024 /
          1024
        ).toFixed(2);
        console.log(
          `   - ${table.TABLE_NAME}: ${table.TABLE_ROWS} filas, ${sizeMB} MB`,
        );
      });

      // Verificar índices
      const [indexes] = await this.connection.execute(`
        SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME 
        FROM information_schema.STATISTICS 
        WHERE TABLE_SCHEMA = '${config.db.database}' 
        AND INDEX_NAME != 'PRIMARY'
        ORDER BY TABLE_NAME, INDEX_NAME
      `);

      console.log(`📈 Índices creados: ${indexes.length}`);

      // Verificar procedimientos almacenados
      const [procedures] = await this.connection.execute(`
        SELECT ROUTINE_NAME, ROUTINE_TYPE 
        FROM information_schema.ROUTINES 
        WHERE ROUTINE_SCHEMA = '${config.db.database}'
      `);

      console.log(`⚙️  Procedimientos/Funciones: ${procedures.length}`);

      // Verificar triggers
      const [triggers] = await this.connection.execute(`
        SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE 
        FROM information_schema.TRIGGERS 
        WHERE TRIGGER_SCHEMA = '${config.db.database}'
      `);

      console.log(`🎯 Triggers de auditoría: ${triggers.length}`);

      // Verificar eventos programados
      const [events] = await this.connection.execute(`
        SELECT EVENT_NAME, STATUS, EVENT_TYPE 
        FROM information_schema.EVENTS 
        WHERE EVENT_SCHEMA = '${config.db.database}'
      `);

      console.log(`📅 Eventos programados: ${events.length}`);
    } catch (error) {
      console.error("❌ Error verificando configuración:", error.message);
    }
  }

  async runHealthCheck() {
    try {
      console.log("🏥 Ejecutando verificación de salud de la base de datos...");

      // Verificar conectividad
      await this.connection.execute("SELECT 1");
      console.log("✅ Conectividad: OK");

      // Verificar rendimiento básico
      const start = Date.now();
      await this.connection.execute(`SELECT COUNT(*) FROM usuarios`);
      const queryTime = Date.now() - start;
      console.log(`✅ Rendimiento: ${queryTime}ms (consulta básica)`);

      // Verificar espacio en disco
      const [diskUsage] = await this.connection.execute(`
        SELECT 
          ROUND(SUM(DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS total_size_mb,
          ROUND(SUM(DATA_FREE) / 1024 / 1024, 2) AS free_space_mb
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = '${config.db.database}'
      `);

      if (diskUsage[0]) {
        console.log(
          `💾 Uso de disco: ${diskUsage[0].total_size_mb} MB usados, ${diskUsage[0].free_space_mb} MB libres`,
        );
      }

      // Verificar configuraciones críticas
      const [variables] = await this.connection.execute(`
        SHOW VARIABLES WHERE Variable_name IN (
          'max_connections', 
          'innodb_buffer_pool_size', 
          'query_cache_size',
          'slow_query_log'
        )
      `);

      console.log("⚙️  Configuraciones actuales:");
      variables.forEach((variable) => {
        console.log(`   - ${variable.Variable_name}: ${variable.Value}`);
      });
    } catch (error) {
      console.error("❌ Error en verificación de salud:", error.message);
    }
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
      console.log("✅ Conexión de aplicación cerrada");
    }
    if (this.rootConnection) {
      await this.rootConnection.end();
      console.log("✅ Conexión root cerrada");
    }
  }

  async run() {
    try {
      const action = process.argv[2] || "setup";

      // Conectar como root si es posible
      const hasRootAccess = await this.connectAsRoot();

      // Conectar con credenciales de aplicación
      await this.connect();

      switch (action) {
        case "setup":
          await this.setupProductionDatabase();
          if (hasRootAccess) {
            await this.optimizeForProduction();
            await this.createBackupUser();
          }
          await this.verifySetup();
          break;

        case "verify":
          await this.verifySetup();
          break;

        case "health":
          await this.runHealthCheck();
          break;

        case "optimize":
          if (hasRootAccess) {
            await this.optimizeForProduction();
          } else {
            console.log("⚠️  Se necesitan permisos de root para optimizar");
          }
          break;

        default:
          console.log("Uso: node db-setup.js [setup|verify|health|optimize]");
          console.log("  setup   - Configuración completa (por defecto)");
          console.log("  verify  - Verificar configuración existente");
          console.log("  health  - Verificación de salud de la base de datos");
          console.log("  optimize - Aplicar optimizaciones de rendimiento");
      }

      console.log("🎉 Configuración de base de datos completada");
    } catch (error) {
      console.error("💥 Error en configuración:", error.message);
      process.exit(1);
    } finally {
      await this.close();
    }
  }
}

// Ejecutar configuración si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const dbSetup = new DatabaseSetup();
  dbSetup.run();
}

export default DatabaseSetup;
