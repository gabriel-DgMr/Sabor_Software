-- =============================================================================
-- DOCKER INIT - SISTEMA SABOR
-- =============================================================================
-- Script de inicialización específico para Docker que se ejecuta ANTES que las migrations
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor MySQL
-- =============================================================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS sabor_db_1 
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE sabor_db_1;

-- Crear tabla de control de migrations
CREATE TABLE IF NOT EXISTS migration_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  migration_file VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('success', 'error') DEFAULT 'success',
  error_message TEXT NULL
);

-- Configurar timezone
SET time_zone = 'America/Bogota';

-- Configurar SQL mode para compatibilidad
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- Log de inicialización
INSERT INTO migration_history (migration_file, status) VALUES 
('000_docker_init.sql', 'success');

-- =============================================================================
-- FINALIZADO - DOCKER INIT
-- ============================================================================= 