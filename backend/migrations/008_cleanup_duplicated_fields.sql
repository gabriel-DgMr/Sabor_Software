-- Migration 008: Clean up duplicated fields from clientes and empleados tables
-- Description: Removes duplicated fields that are now managed by the users table

-- Drop old foreign key constraints first
ALTER TABLE pedidos DROP FOREIGN KEY fk_pedidos_clientes;
ALTER TABLE reservaciones DROP FOREIGN KEY fk_reservaciones_clientes;
ALTER TABLE codigos_verificacion DROP FOREIGN KEY fk_codigos_clientes;
ALTER TABLE codigos_verificacion DROP FOREIGN KEY fk_codigos_verificacion_cliente;
ALTER TABLE mensajes_contacto DROP FOREIGN KEY fk_mensajes_clientes;

-- Make user_id NOT NULL after data migration
ALTER TABLE clientes MODIFY COLUMN user_id INT NOT NULL;
ALTER TABLE empleados MODIFY COLUMN user_id INT NOT NULL;

-- Drop duplicated columns from clientes table
ALTER TABLE clientes 
DROP COLUMN nombre_cliente,
DROP COLUMN email_cliente,
DROP COLUMN telefono_cliente,
DROP COLUMN contraseña_cliente,
DROP COLUMN imagen_cliente,
DROP COLUMN fecha_registro,
DROP COLUMN fecha_modificacion,
DROP COLUMN activo,
DROP COLUMN email_verificado;

-- Drop duplicated columns from empleados table
ALTER TABLE empleados 
DROP COLUMN nombre_empleado,
DROP COLUMN correo_empleado,
DROP COLUMN password_empleado,
DROP COLUMN telefono_empleado,
DROP COLUMN direccion_empleado,
DROP COLUMN imagen_empleado,
DROP COLUMN fecha_contratacion,
DROP COLUMN fecha_modificacion,
DROP COLUMN activo;

-- Make user_id NOT NULL in related tables
ALTER TABLE pedidos MODIFY COLUMN user_id INT NOT NULL;
ALTER TABLE reservaciones MODIFY COLUMN user_id INT NOT NULL;
ALTER TABLE codigos_verificacion MODIFY COLUMN user_id INT NOT NULL;
ALTER TABLE mensajes_contacto MODIFY COLUMN user_id INT NOT NULL;

-- Drop old cliente_id columns from related tables
ALTER TABLE pedidos DROP COLUMN id_cliente;
ALTER TABLE reservaciones DROP COLUMN id_cliente;
ALTER TABLE codigos_verificacion DROP COLUMN id_cliente;
ALTER TABLE mensajes_contacto DROP COLUMN id_cliente;

-- Add new indexes for better performance
CREATE INDEX idx_clientes_user_id ON clientes(user_id);
CREATE INDEX idx_empleados_user_id ON empleados(user_id);
CREATE INDEX idx_pedidos_user_id ON pedidos(user_id);
CREATE INDEX idx_reservaciones_user_id ON reservaciones(user_id);
CREATE INDEX idx_codigos_user_id ON codigos_verificacion(user_id);
CREATE INDEX idx_mensajes_user_id ON mensajes_contacto(user_id);

-- Update the views to work with new structure
DROP VIEW IF EXISTS vista_clientes_completa;
DROP VIEW IF EXISTS vista_empleados_completa;

CREATE VIEW vista_clientes_completa AS
SELECT 
    c.id_cliente,
    u.id_user,
    u.email,
    u.nombre as nombre_cliente,
    u.apellido,
    u.telefono,
    u.imagen,
    u.activo,
    u.email_verificado,
    u.fecha_registro,
    u.fecha_modificacion
FROM clientes c
JOIN users u ON c.user_id = u.id_user
WHERE u.tipo_usuario = 'cliente';

CREATE VIEW vista_empleados_completa AS
SELECT 
    e.id_empleado,
    u.id_user,
    e.id_rol,
    u.email as correo_empleado,
    u.nombre as nombre_empleado,
    u.apellido,
    u.telefono as telefono_empleado,
    u.direccion,
    u.imagen,
    u.activo,
    u.fecha_contratacion,
    u.fecha_modificacion
FROM empleados e
JOIN users u ON e.user_id = u.id_user
WHERE u.tipo_usuario IN ('empleado', 'administrador');

-- Create additional useful views
CREATE VIEW vista_usuarios_completa AS
SELECT 
    u.id_user,
    u.email,
    u.nombre,
    u.apellido,
    u.telefono,
    u.imagen,
    u.tipo_usuario,
    u.activo,
    u.email_verificado,
    u.fecha_registro,
    u.fecha_modificacion,
    u.direccion,
    u.id_rol,
    u.fecha_contratacion,
    CASE 
        WHEN u.tipo_usuario = 'cliente' THEN c.id_cliente
        ELSE NULL
    END as id_cliente,
    CASE 
        WHEN u.tipo_usuario IN ('empleado', 'administrador') THEN e.id_empleado
        ELSE NULL
    END as id_empleado
FROM users u
LEFT JOIN clientes c ON u.id_user = c.user_id
LEFT JOIN empleados e ON u.id_user = e.user_id;

-- Create procedure to validate data integrity
DELIMITER //

CREATE PROCEDURE sp_validate_migration()
BEGIN
    DECLARE total_users INT;
    DECLARE total_clientes INT;
    DECLARE total_empleados INT;
    DECLARE orphaned_clientes INT;
    DECLARE orphaned_empleados INT;
    
    -- Count totals
    SELECT COUNT(*) INTO total_users FROM users;
    SELECT COUNT(*) INTO total_clientes FROM clientes;
    SELECT COUNT(*) INTO total_empleados FROM empleados;
    
    -- Check for orphaned records
    SELECT COUNT(*) INTO orphaned_clientes 
    FROM clientes c 
    LEFT JOIN users u ON c.user_id = u.id_user 
    WHERE u.id_user IS NULL;
    
    SELECT COUNT(*) INTO orphaned_empleados 
    FROM empleados e 
    LEFT JOIN users u ON e.user_id = u.id_user 
    WHERE u.id_user IS NULL;
    
    -- Display results
    SELECT 
        total_users as 'Total Users',
        total_clientes as 'Total Clientes',
        total_empleados as 'Total Empleados',
        orphaned_clientes as 'Orphaned Clientes',
        orphaned_empleados as 'Orphaned Empleados';
    
    -- Check if migration is successful
    IF orphaned_clientes > 0 OR orphaned_empleados > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Migration validation failed: orphaned records found';
    ELSE
        SELECT 'Migration validation successful' as status;
    END IF;
END //

DELIMITER ;

-- Run validation
CALL sp_validate_migration();

-- Final verification queries
SELECT 'Estructura tabla clientes' as verificacion;
DESCRIBE clientes;

SELECT 'Estructura tabla empleados' as verificacion;
DESCRIBE empleados;

SELECT 'Estructura tabla users' as verificacion;
DESCRIBE users;

SELECT 'Conteo final de registros' as verificacion;
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM clientes) as total_clientes,
    (SELECT COUNT(*) FROM empleados) as total_empleados,
    (SELECT COUNT(*) FROM pedidos WHERE user_id IS NOT NULL) as pedidos_con_user_id,
    (SELECT COUNT(*) FROM reservaciones WHERE user_id IS NOT NULL) as reservaciones_con_user_id; 