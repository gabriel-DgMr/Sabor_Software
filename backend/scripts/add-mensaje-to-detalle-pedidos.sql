-- Script para agregar la columna mensaje a detalle_pedidos
ALTER TABLE detalle_pedidos ADD COLUMN mensaje TEXT AFTER subtotal;
