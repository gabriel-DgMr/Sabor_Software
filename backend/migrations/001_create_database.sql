-- Migration: 001_create_database.sql
-- Descripción: Crear base de datos sabor_db_1
-- Fecha: 2024-01-01

-- Crear base de datos
DROP DATABASE IF EXISTS sabor_db_1;
CREATE DATABASE sabor_db_1 
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE sabor_db_1; 