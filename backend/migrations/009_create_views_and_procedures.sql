-- Migration 009: Create views and procedures after normalization
-- Description: Creates compatibility views and procedures that depend on user_id columns

-- Create views for compatibility
CREATE VIEW vista_clientes_completa AS
SELECT 
    c.id_cliente,
    u.id_user,
    u.email,
    u.nombre as nombre_cliente,
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
    u.telefono as telefono_empleado,
    u.direccion,
    u.imagen,
    u.activo,
    u.fecha_contratacion,
    u.fecha_modificacion
FROM empleados e
JOIN users u ON e.user_id = u.id_user
WHERE u.tipo_usuario IN ('empleado', 'administrador');

-- Stored procedures for common operations
DELIMITER //

CREATE PROCEDURE sp_crear_usuario_completo(
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(255),
    IN p_nombre VARCHAR(100),
    IN p_apellido VARCHAR(100),
    IN p_telefono VARCHAR(15),
    IN p_tipo_usuario ENUM('cliente', 'empleado', 'administrador'),
    IN p_id_rol INT,
    IN p_direccion VARCHAR(255),
    OUT p_user_id INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Insert into users table
    INSERT INTO users (email, password, nombre, apellido, telefono, tipo_usuario, id_rol, direccion)
    VALUES (p_email, p_password, p_nombre, p_apellido, p_telefono, p_tipo_usuario, p_id_rol, p_direccion);
    
    SET p_user_id = LAST_INSERT_ID();
    
    -- Insert into appropriate table
    IF p_tipo_usuario = 'cliente' THEN
        INSERT INTO clientes (user_id) VALUES (p_user_id);
    ELSE
        INSERT INTO empleados (user_id, id_rol) VALUES (p_user_id, p_id_rol);
    END IF;
    
    COMMIT;
END //

DELIMITER ;

-- Log the migration
INSERT INTO migration_history (migration_file, executed_at, status) 
VALUES ('009_create_views_and_procedures.sql', NOW(), 'completed'); 