-- Migration: 001_create_database.sql
-- Descripción: Crear base de datos sabor_db
-- Fecha: 2024-01-01

-- Crear base de datos
-- En Docker, la base de datos ya existe, por lo que solo la usamos
CREATE DATABASE IF NOT EXISTS sabor_db 
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE sabor_db;

-- Registrar esta migration como ejecutada
INSERT IGNORE INTO migration_history (migration_file, status) VALUES 
('001_create_database.sql', 'success'); 