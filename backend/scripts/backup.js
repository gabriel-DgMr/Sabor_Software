#!/usr/bin/env node

import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { config } from "../src/config/config.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Script de backup de base de datos
 */

class DatabaseBackup {
  constructor() {
    this.backupDir = path.join(__dirname, "../../backup");
    this.ensureBackupDir();
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log(`📁 Directorio de backup creado: ${this.backupDir}`);
    }
  }

  generateBackupFileName() {
    const now = new Date();
    const timestamp = now
      .toISOString()
      .replace(/[:.]/g, "-")
      .replace("T", "_")
      .split(".")[0];

    return `sabor_backup_${timestamp}.sql`;
  }

  async createBackup() {
    try {
      const fileName = this.generateBackupFileName();
      const filePath = path.join(this.backupDir, fileName);

      const mysqldumpCmd = [
        "mysqldump",
        `-h${config.db.host}`,
        `-P${config.db.port}`,
        `-u${config.db.user}`,
        `-p${config.db.password}`,
        "--single-transaction",
        "--routines",
        "--triggers",
        config.db.database,
      ].join(" ");

      console.log("🔄 Iniciando backup de base de datos...");

      const { stdout, stderr } = await execAsync(
        `${mysqldumpCmd} > "${filePath}"`,
      );

      if (stderr && !stderr.includes("Warning")) {
        throw new Error(stderr);
      }

      const stats = fs.statSync(filePath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      console.log(`✅ Backup completado: ${fileName}`);
      console.log(`📊 Tamaño del archivo: ${fileSizeMB} MB`);
      console.log(`📍 Ubicación: ${filePath}`);

      return filePath;
    } catch (error) {
      console.error("❌ Error creando backup:", error.message);
      throw error;
    }
  }

  async cleanOldBackups(keepDays = 7) {
    try {
      const files = fs.readdirSync(this.backupDir);
      const now = Date.now();
      const maxAge = keepDays * 24 * 60 * 60 * 1000; // días en millisegundos

      let deletedCount = 0;

      for (const file of files) {
        if (file.startsWith("sabor_backup_") && file.endsWith(".sql")) {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);

          if (now - stats.mtime.getTime() > maxAge) {
            fs.unlinkSync(filePath);
            deletedCount++;
            console.log(`🗑️  Backup antiguo eliminado: ${file}`);
          }
        }
      }

      if (deletedCount === 0) {
        console.log("✅ No hay backups antiguos para eliminar");
      } else {
        console.log(`✅ ${deletedCount} backups antiguos eliminados`);
      }
    } catch (error) {
      console.error("⚠️  Error limpiando backups antiguos:", error.message);
    }
  }

  async listBackups() {
    try {
      const files = fs.readdirSync(this.backupDir);
      const backups = files
        .filter(
          (file) => file.startsWith("sabor_backup_") && file.endsWith(".sql"),
        )
        .map((file) => {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            size: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
            date: stats.mtime.toISOString().split("T")[0],
          };
        })
        .sort((a, b) => b.name.localeCompare(a.name));

      if (backups.length === 0) {
        console.log("📋 No se encontraron backups");
        return;
      }

      console.log("📋 Backups disponibles:");
      console.log("─".repeat(60));
      backups.forEach((backup) => {
        console.log(`${backup.name} | ${backup.size} | ${backup.date}`);
      });
    } catch (error) {
      console.error("❌ Error listando backups:", error.message);
    }
  }

  async run() {
    try {
      const action = process.argv[2] || "create";

      switch (action) {
        case "create":
          await this.createBackup();
          await this.cleanOldBackups();
          break;
        case "list":
          await this.listBackups();
          break;
        case "clean":
          const days = parseInt(process.argv[3]) || 7;
          await this.cleanOldBackups(days);
          break;
        default:
          console.log("Uso: node backup.js [create|list|clean] [days]");
          console.log("  create - Crear nuevo backup (por defecto)");
          console.log("  list   - Listar backups existentes");
          console.log(
            "  clean  - Limpiar backups antiguos (por defecto 7 días)",
          );
      }
    } catch (error) {
      console.error("💥 Error en backup:", error.message);
      process.exit(1);
    }
  }
}

// Ejecutar backup si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const backup = new DatabaseBackup();
  backup.run();
}

export default DatabaseBackup;
