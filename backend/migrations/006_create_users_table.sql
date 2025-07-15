-- Migration 006: Create users table for normalization
-- Description: Creates a unified users table to eliminate duplication between clientes and empleados

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NULL,
    telefono VARCHAR(15) NULL,
    imagen VARCHAR(255) NULL,
    tipo_usuario ENUM('cliente', 'empleado', 'administrador') NOT NULL,
    activo TINYINT NOT NULL DEFAULT 1,
    email_verificado TINYINT NOT NULL DEFAULT 0,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Additional fields for employees
    direccion VARCHAR(255) NULL,
    id_rol INT NULL,
    fecha_contratacion TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_users_email (email),
    INDEX idx_users_tipo (tipo_usuario),
    INDEX idx_users_activo (activo),
    INDEX idx_users_email_tipo (email, tipo_usuario),
    
    -- Foreign key for employee roles
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create audit table for users
CREATE TABLE IF NOT EXISTS users_audit (
    id_audit INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    changed_by INT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_audit_user (id_user),
    INDEX idx_audit_action (action),
    INDEX idx_audit_date (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create backup tables for rollback
CREATE TABLE IF NOT EXISTS clientes_backup_campos AS 
SELECT id_cliente, nombre_cliente, email_cliente, telefono_cliente, 
       contraseña_cliente, imagen_cliente, fecha_registro, fecha_modificacion, 
       activo, email_verificado
FROM clientes;

CREATE TABLE IF NOT EXISTS empleados_backup_campos AS 
SELECT id_empleado, id_rol, nombre_empleado, correo_empleado, 
       password_empleado, telefono_empleado, direccion_empleado, 
       imagen_empleado, fecha_contratacion, fecha_modificacion, activo
FROM empleados;

-- Create audit triggers for users table
DELIMITER //

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS users_audit_insert //
DROP TRIGGER IF EXISTS users_audit_update //
DROP TRIGGER IF EXISTS users_audit_delete //

CREATE TRIGGER users_audit_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO users_audit (id_user, action, new_values, changed_at)
    VALUES (NEW.id_user, 'INSERT', 
            JSON_OBJECT('email', NEW.email, 'nombre', NEW.nombre, 'tipo_usuario', NEW.tipo_usuario),
            NOW());
END //

CREATE TRIGGER users_audit_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO users_audit (id_user, action, old_values, new_values, changed_at)
    VALUES (OLD.id_user, 'UPDATE', 
            JSON_OBJECT('email', OLD.email, 'nombre', OLD.nombre, 'tipo_usuario', OLD.tipo_usuario),
            JSON_OBJECT('email', NEW.email, 'nombre', NEW.nombre, 'tipo_usuario', NEW.tipo_usuario),
            NOW());
END //

CREATE TRIGGER users_audit_delete
AFTER DELETE ON users
FOR EACH ROW
BEGIN
    INSERT INTO users_audit (id_user, action, old_values, changed_at)
    VALUES (OLD.id_user, 'DELETE', 
            JSON_OBJECT('email', OLD.email, 'nombre', OLD.nombre, 'tipo_usuario', OLD.tipo_usuario),
            NOW());
END //

DELIMITER ; 