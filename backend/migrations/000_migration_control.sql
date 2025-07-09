-- Migration: 000_migration_control.sql
-- Descripción: Crear tabla de control para seguimiento de migrations ejecutadas
-- Fecha: 2024-01-00

-- ========================
-- TABLA DE CONTROL DE MIGRATIONS
-- ========================

CREATE TABLE IF NOT EXISTS migration_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  migration_file VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('success', 'error') DEFAULT 'success',
  error_message TEXT NULL
); 