#!/usr/bin/env node

import { config } from "../src/config/config.js";
import DatabaseSetup from "./db-setup.js";
import { appLogger } from "../src/middleware/logger.js";

/**
 * Script de inicialización específico para Railway
 * Se ejecuta automáticamente en el primer despliegue
 */

class RailwayInitializer {
  constructor() {
    this.isRailway = !!process.env.RAILWAY_ENVIRONMENT;
    this.isFirstDeploy = !process.env.DB_INITIALIZED;
  }

  async checkRailwayEnvironment() {
    if (!this.isRailway) {
      appLogger.warn("Este script está optimizado para Railway");
      return false;
    }

    appLogger.info("🚄 Detectado entorno Railway");
    appLogger.info(`📍 Environment: ${process.env.RAILWAY_ENVIRONMENT}`);
    appLogger.info(
      `🌐 Static URL: ${process.env.RAILWAY_STATIC_URL || "No disponible"}`,
    );

    return true;
  }

  async waitForDatabase() {
    const maxAttempts = 30;
    let attempt = 1;

    appLogger.info("⏳ Esperando que la base de datos esté disponible...");

    while (attempt <= maxAttempts) {
      try {
        const mysql = await import("mysql2/promise");
        const connection = await mysql.createConnection({
          host: config.db.host,
          user: config.db.user,
          password: config.db.password,
          port: config.db.port,
          connectTimeout: 5000,
        });

        await connection.execute("SELECT 1");
        await connection.end();

        appLogger.info("✅ Base de datos disponible");
        return true;
      } catch (error) {
        appLogger.info(
          `Intento ${attempt}/${maxAttempts} - Base de datos no disponible: ${error.message}`,
        );

        if (attempt === maxAttempts) {
          appLogger.warn(
            "⚠️ Base de datos no disponible después de múltiples intentos. Continuando sin verificación de DB.",
          );
          return; // Continuar sin fallar
        }

        await new Promise((resolve) => setTimeout(resolve, 5000));
        attempt++;
      }
    }
  }

  async initializeDatabase() {
    if (!this.isFirstDeploy) {
      appLogger.info(
        "📊 Base de datos ya inicializada, saltando configuración",
      );
      return;
    }

    appLogger.info("🔧 Inicializando base de datos para Railway...");

    try {
      const dbSetup = new DatabaseSetup();
      await dbSetup.run();

      // Marcar como inicializada (esto se puede hacer via Railway API o variable de entorno)
      appLogger.info("✅ Base de datos inicializada correctamente");
    } catch (error) {
      appLogger.error("❌ Error inicializando base de datos:", error);
      throw error;
    }
  }

  async setupRailwaySpecificConfig() {
    appLogger.info("⚙️  Configurando ajustes específicos de Railway...");

    // Configurar CORS con URL de Railway
    if (process.env.RAILWAY_STATIC_URL && !process.env.CORS_ORIGIN) {
      process.env.CORS_ORIGIN = process.env.RAILWAY_STATIC_URL;
      process.env.FRONTEND_URL = process.env.RAILWAY_STATIC_URL;
      appLogger.info(
        `🌐 CORS configurado automáticamente: ${process.env.RAILWAY_STATIC_URL}`,
      );
    }

    // Configurar trust proxy
    process.env.TRUST_PROXY = "true";

    // Configurar logging para Railway
    if (!process.env.LOG_LEVEL) {
      process.env.LOG_LEVEL = "info";
    }

    appLogger.info("✅ Configuración específica de Railway completada");
  }

  async healthCheck() {
    appLogger.info("🏥 Ejecutando verificación de salud...");

    try {
      // Verificar conexión a base de datos
      const mysql = await import("mysql2/promise");
      const connection = await mysql.createConnection({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
        port: config.db.port,
      });

      const [rows] = await connection.execute(
        "SELECT COUNT(*) as count FROM usuarios",
      );
      await connection.end();

      appLogger.info(
        `✅ Base de datos operativa - ${rows[0].count} usuarios registrados`,
      );

      // Verificar variables de entorno críticas
      const criticalVars = ["JWT_SECRET", "COOKIE_SECRET", "DB_PASSWORD"];
      const missingVars = criticalVars.filter(
        (varName) => !process.env[varName],
      );

      if (missingVars.length > 0) {
        appLogger.warn(
          `⚠️  Variables de entorno faltantes: ${missingVars.join(", ")}`,
        );
      } else {
        appLogger.info("✅ Variables de entorno críticas configuradas");
      }
    } catch (error) {
      appLogger.error("❌ Error en verificación de salud:", error);
      throw error;
    }
  }

  async run() {
    try {
      appLogger.info("🚀 Iniciando configuración para Railway...");

      // Verificar entorno Railway
      const isRailway = await this.checkRailwayEnvironment();

      if (isRailway) {
        // Esperar a que la base de datos esté disponible
        await this.waitForDatabase();

        // Configurar ajustes específicos de Railway
        await this.setupRailwaySpecificConfig();

        // Inicializar base de datos si es necesario
        await this.initializeDatabase();
      }

      // Verificación final de salud
      await this.healthCheck();

      appLogger.info("🎉 Inicialización de Railway completada exitosamente");
    } catch (error) {
      appLogger.error("💥 Error durante la inicialización de Railway:", error);

      // En Railway, es mejor fallar rápido si hay problemas críticos
      if (this.isRailway) {
        process.exit(1);
      }

      throw error;
    }
  }
}

// Ejecutar inicialización si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const initializer = new RailwayInitializer();
  initializer.run().catch((error) => {
    console.error("Error en inicialización:", error);
    process.exit(1);
  });
}

export default RailwayInitializer;
