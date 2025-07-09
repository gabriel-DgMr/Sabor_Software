-- Migration: 005_create_indexes.sql
-- Descripción: Crear índices para optimizar las consultas en la base de datos
-- Fecha: 2024-01-05

-- Usar la base de datos sabor_db_1
USE sabor_db_1;

-- ========================
-- ÍNDICES
-- ========================

-- Índice para búsquedas por categoría en productos
CREATE INDEX idx_productos_categoria ON productos(id_categoria);

-- Índice para búsquedas por cliente en pedidos
CREATE INDEX idx_pedidos_cliente ON pedidos(id_cliente);

-- Índice para búsquedas por empleado en pedidos
CREATE INDEX idx_pedidos_empleado ON pedidos(id_empleado);

-- Índice para búsquedas por estado en pedidos
CREATE INDEX idx_pedidos_estado ON pedidos(id_estado);

-- Índice para búsquedas por fecha en reservaciones
CREATE INDEX idx_reservaciones_fecha ON reservaciones(fecha_reservacion);

-- Registrar esta migration como ejecutada
INSERT IGNORE INTO migration_history (migration_file, status) VALUES 
('005_create_indexes.sql', 'success'); 