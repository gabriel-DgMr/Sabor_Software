-- Migration: 004_create_triggers.sql
-- Descripción: Crear triggers para automatizar operaciones en la base de datos
-- Fecha: 2024-01-04

-- ========================
-- TRIGGERS
-- ========================

DELIMITER //

-- Trigger para calcular precio unitario y subtotal antes de insertar detalle de pedido
CREATE TRIGGER before_detalle_pedido_insert
BEFORE INSERT ON detalle_pedidos
FOR EACH ROW
BEGIN
  DECLARE precio DECIMAL(10,2);
  SELECT precio_producto INTO precio FROM productos WHERE id_producto = NEW.id_producto;
  SET NEW.precio_unitario = precio;
  SET NEW.subtotal = precio * NEW.cantidad;
END//

-- Trigger para actualizar total del pedido y stock después de insertar detalle
CREATE TRIGGER after_detalle_pedido_insert
AFTER INSERT ON detalle_pedidos
FOR EACH ROW
BEGIN
  UPDATE pedidos SET total_pedido = total_pedido + NEW.subtotal WHERE id_pedido = NEW.id_pedido;
  UPDATE productos SET stock = stock - NEW.cantidad WHERE id_producto = NEW.id_producto;
END//

-- Trigger para restaurar stock y total cuando se elimina un detalle de pedido
CREATE TRIGGER before_detalle_pedido_delete
BEFORE DELETE ON detalle_pedidos
FOR EACH ROW
BEGIN
  UPDATE pedidos SET total_pedido = total_pedido - OLD.subtotal WHERE id_pedido = OLD.id_pedido;
  UPDATE productos SET stock = stock + OLD.cantidad WHERE id_producto = OLD.id_producto;
END//

DELIMITER ; 