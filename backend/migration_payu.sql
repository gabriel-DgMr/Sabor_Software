-- Migración para soporte de PayU y campos adicionales en pedidos
-- Ejecutar este script en la base de datos

-- Agregar nuevos campos a la tabla pedidos
ALTER TABLE pedidos 
ADD COLUMN tipo_servicio ENUM('mesa', 'domicilio') DEFAULT 'mesa' AFTER metodo_pago,
ADD COLUMN direccion_entrega TEXT DEFAULT NULL AFTER tipo_servicio,
ADD COLUMN detalle_direccion VARCHAR(255) DEFAULT NULL AFTER direccion_entrega,
ADD COLUMN referencia_pago VARCHAR(255) DEFAULT NULL AFTER detalle_direccion,
ADD COLUMN recomendaciones TEXT DEFAULT NULL AFTER referencia_pago;

-- Actualizar el ENUM de metodo_pago para incluir PayU
ALTER TABLE pedidos 
MODIFY COLUMN metodo_pago ENUM('efectivo','tarjeta','transferencia','payu') DEFAULT NULL;

-- Crear índice para referencia de pago para búsquedas rápidas
CREATE INDEX idx_pedidos_referencia_pago ON pedidos(referencia_pago);

-- Mostrar la estructura actualizada
DESCRIBE pedidos;

