-- Migration: 000_migration_control.sql
-- Descripción: Crear tabla de control para seguimiento de migrations ejecutadas
-- Fecha: 2024-01-00

-- ========================
-- TABLA DE CONTROL DE MIGRATIONS
-- ========================

-- Usar la base de datos sabor_db_1
USE sabor_db_1;

-- Crear tabla de control de migrations si no existe
CREATE TABLE IF NOT EXISTS migration_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  migration_file VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('success', 'error') DEFAULT 'success',
  error_message TEXT NULL
);

-- Registrar esta migration como ejecutada
INSERT IGNORE INTO migration_history (migration_file, status) VALUES 
('000_migration_control.sql', 'success'); 