-- Script para agregar el estado "recibido" para domicilios
-- Ejecutar este script para agregar el nuevo estado a la tabla estados

-- Insertar el nuevo estado "recibido" con ID 6
INSERT INTO estados (id_estado, nombre_estado) 
VALUES (6, 'Recibido')
ON DUPLICATE KEY UPDATE 
  nombre_estado = VALUES(nombre_estado);

-- Verificar que el estado se insertó correctamente
SELECT * FROM estados WHERE id_estado = 6;
