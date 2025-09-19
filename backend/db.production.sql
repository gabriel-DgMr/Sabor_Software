-- Configuración de base de datos para producción
-- Este archivo contiene optimizaciones específicas para entornos de producción

-- Configurar el motor de almacenamiento y charset
SET default_storage_engine = InnoDB;
SET NAMES utf8mb4;
SET character_set_client = utf8mb4;

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS sabor_production_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE sabor_production_db;

-- Configuraciones de rendimiento para producción
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB
SET GLOBAL innodb_log_file_size = 268435456; -- 256MB
SET GLOBAL innodb_flush_log_at_trx_commit = 1; -- Máxima durabilidad
SET GLOBAL sync_binlog = 1; -- Máxima durabilidad
SET GLOBAL max_connections = 200;
SET GLOBAL query_cache_size = 67108864; -- 64MB
SET GLOBAL slow_query_log = 1;
SET GLOBAL long_query_time = 2;

-- Crear usuario específico para la aplicación con permisos limitados
CREATE USER IF NOT EXISTS 'sabor_app'@'%' IDENTIFIED BY 'secure_app_password_2024!';
GRANT SELECT, INSERT, UPDATE, DELETE ON sabor_production_db.* TO 'sabor_app'@'%';
GRANT CREATE TEMPORARY TABLES ON sabor_production_db.* TO 'sabor_app'@'%';
FLUSH PRIVILEGES;

-- Crear índices adicionales para optimizar consultas frecuentes
-- (Estos se ejecutarán después de que las tablas sean creadas)

-- Índices para tabla usuarios
ALTER TABLE usuarios ADD INDEX idx_email (email);
ALTER TABLE usuarios ADD INDEX idx_estado (estado);
ALTER TABLE usuarios ADD INDEX idx_rol (rol);
ALTER TABLE usuarios ADD INDEX idx_fecha_creacion (fecha_creacion);

-- Índices para tabla productos
ALTER TABLE productos ADD INDEX idx_categoria (id_categoria);
ALTER TABLE productos ADD INDEX idx_estado (estado);
ALTER TABLE productos ADD INDEX idx_precio (precio_producto);
ALTER TABLE productos ADD INDEX idx_nombre (nombre_producto);

-- Índices para tabla pedidos
ALTER TABLE pedidos ADD INDEX idx_usuario (id_usuario);
ALTER TABLE pedidos ADD INDEX idx_estado (estado_pedido);
ALTER TABLE pedidos ADD INDEX idx_fecha (fecha_pedido);
ALTER TABLE pedidos ADD INDEX idx_mesa (numero_mesa);
ALTER TABLE pedidos ADD INDEX idx_total (total_pedido);

-- Índices para tabla reservas
ALTER TABLE reservas ADD INDEX idx_usuario (id_usuario);
ALTER TABLE reservas ADD INDEX idx_fecha (fecha_reserva);
ALTER TABLE reservas ADD INDEX idx_estado (estado);
ALTER TABLE reservas ADD INDEX idx_mesa (numero_mesa);

-- Índices para tabla detalle_pedidos
ALTER TABLE detalle_pedidos ADD INDEX idx_pedido (id_pedido);
ALTER TABLE detalle_pedidos ADD INDEX idx_producto (id_producto);

-- Índices para tabla calificaciones
ALTER TABLE calificaciones ADD INDEX idx_usuario (id_usuario);
ALTER TABLE calificaciones ADD INDEX idx_producto (id_producto);
ALTER TABLE calificaciones ADD INDEX idx_pedido (id_pedido);
ALTER TABLE calificaciones ADD INDEX idx_fecha (fecha_calificacion);

-- Índices para tabla contacto
ALTER TABLE contacto ADD INDEX idx_fecha (fecha_mensaje);
ALTER TABLE contacto ADD INDEX idx_email (email);

-- Índices para tabla domicilios
ALTER TABLE domicilios ADD INDEX idx_pedido (id_pedido);
ALTER TABLE domicilios ADD INDEX idx_estado (estado);
ALTER TABLE domicilios ADD INDEX idx_fecha (fecha_entrega);

-- Crear tabla de sesiones para manejo de sesiones en producción
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
    expires INT(11) UNSIGNED NOT NULL,
    data MEDIUMTEXT COLLATE utf8mb4_bin,
    PRIMARY KEY (session_id),
    INDEX idx_expires (expires)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de logs de auditoría
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(64) NOT NULL,
    operation ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    record_id INT,
    old_values JSON,
    new_values JSON,
    user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_table_operation (table_name, operation),
    INDEX idx_timestamp (timestamp),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de intentos de login fallidos para seguridad
CREATE TABLE IF NOT EXISTS failed_login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    email VARCHAR(100),
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    INDEX idx_ip_time (ip_address, attempt_time),
    INDEX idx_email_time (email, attempt_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de IPs bloqueadas
CREATE TABLE IF NOT EXISTS blocked_ips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL UNIQUE,
    reason VARCHAR(255),
    blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    blocked_until TIMESTAMP NULL,
    is_permanent BOOLEAN DEFAULT FALSE,
    INDEX idx_ip (ip_address),
    INDEX idx_blocked_until (blocked_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de configuración de aplicación
CREATE TABLE IF NOT EXISTS app_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar configuraciones iniciales
INSERT INTO app_settings (setting_key, setting_value, description) VALUES
('maintenance_mode', 'false', 'Activar/desactivar modo mantenimiento'),
('max_login_attempts', '5', 'Máximo número de intentos de login'),
('login_lockout_time', '900', 'Tiempo de bloqueo en segundos (15 minutos)'),
('session_timeout', '86400', 'Tiempo de expiración de sesión en segundos (24 horas)'),
('file_upload_max_size', '5242880', 'Tamaño máximo de archivo en bytes (5MB)'),
('rate_limit_requests', '100', 'Número máximo de requests por ventana'),
('rate_limit_window', '900', 'Ventana de rate limiting en segundos (15 minutos)')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Procedimientos almacenados para operaciones comunes

-- Procedimiento para limpiar intentos de login antiguos
DELIMITER $$
CREATE PROCEDURE CleanOldLoginAttempts()
BEGIN
    DELETE FROM failed_login_attempts 
    WHERE attempt_time < DATE_SUB(NOW(), INTERVAL 24 HOUR);
END$$

-- Procedimiento para obtener estadísticas de rendimiento
CREATE PROCEDURE GetPerformanceStats()
BEGIN
    SELECT 
        'Total Usuarios' as metric, COUNT(*) as value FROM usuarios
    UNION ALL
    SELECT 
        'Pedidos Hoy' as metric, COUNT(*) as value 
        FROM pedidos WHERE DATE(fecha_pedido) = CURDATE()
    UNION ALL
    SELECT 
        'Productos Activos' as metric, COUNT(*) as value 
        FROM productos WHERE estado = 'activo'
    UNION ALL
    SELECT 
        'Reservas Activas' as metric, COUNT(*) as value 
        FROM reservas WHERE estado = 'confirmada' AND fecha_reserva >= CURDATE();
END$$

-- Procedimiento para backup de datos críticos
CREATE PROCEDURE BackupCriticalData()
BEGIN
    -- Crear tabla de respaldo temporal con datos críticos
    CREATE TEMPORARY TABLE backup_summary AS
    SELECT 
        'usuarios' as table_name, COUNT(*) as record_count, NOW() as backup_time
        FROM usuarios
    UNION ALL
    SELECT 
        'productos' as table_name, COUNT(*) as record_count, NOW() as backup_time
        FROM productos
    UNION ALL
    SELECT 
        'pedidos' as table_name, COUNT(*) as record_count, NOW() as backup_time
        FROM pedidos;
    
    SELECT * FROM backup_summary;
END$$

DELIMITER ;

-- Triggers para auditoría automática en tablas críticas

-- Trigger para usuarios
DELIMITER $$
CREATE TRIGGER usuarios_audit_insert AFTER INSERT ON usuarios
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (table_name, operation, record_id, new_values)
    VALUES ('usuarios', 'INSERT', NEW.id, JSON_OBJECT(
        'nombre', NEW.nombre,
        'email', NEW.email,
        'rol', NEW.rol,
        'estado', NEW.estado
    ));
END$$

CREATE TRIGGER usuarios_audit_update AFTER UPDATE ON usuarios
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (table_name, operation, record_id, old_values, new_values)
    VALUES ('usuarios', 'UPDATE', NEW.id, 
        JSON_OBJECT('nombre', OLD.nombre, 'email', OLD.email, 'rol', OLD.rol, 'estado', OLD.estado),
        JSON_OBJECT('nombre', NEW.nombre, 'email', NEW.email, 'rol', NEW.rol, 'estado', NEW.estado)
    );
END$$

-- Trigger para productos
CREATE TRIGGER productos_audit_update AFTER UPDATE ON productos
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (table_name, operation, record_id, old_values, new_values)
    VALUES ('productos', 'UPDATE', NEW.id, 
        JSON_OBJECT('nombre_producto', OLD.nombre_producto, 'precio_producto', OLD.precio_producto, 'estado', OLD.estado),
        JSON_OBJECT('nombre_producto', NEW.nombre_producto, 'precio_producto', NEW.precio_producto, 'estado', NEW.estado)
    );
END$$

DELIMITER ;

-- Crear evento para limpieza automática de logs antiguos
SET GLOBAL event_scheduler = ON;

DELIMITER $$
CREATE EVENT IF NOT EXISTS cleanup_old_data
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    -- Limpiar intentos de login antiguos (más de 7 días)
    DELETE FROM failed_login_attempts 
    WHERE attempt_time < DATE_SUB(NOW(), INTERVAL 7 DAY);
    
    -- Limpiar logs de auditoría antiguos (más de 90 días)
    DELETE FROM audit_logs 
    WHERE timestamp < DATE_SUB(NOW(), INTERVAL 90 DAY);
    
    -- Limpiar sesiones expiradas
    DELETE FROM sessions 
    WHERE expires < UNIX_TIMESTAMP();
    
    -- Desbloquear IPs temporalmente bloqueadas que ya expiraron
    DELETE FROM blocked_ips 
    WHERE blocked_until IS NOT NULL 
    AND blocked_until < NOW() 
    AND is_permanent = FALSE;
END$$
DELIMITER ;

-- Configurar permisos finales
GRANT EXECUTE ON PROCEDURE sabor_production_db.CleanOldLoginAttempts TO 'sabor_app'@'%';
GRANT EXECUTE ON PROCEDURE sabor_production_db.GetPerformanceStats TO 'sabor_app'@'%';

-- Optimizar todas las tablas
OPTIMIZE TABLE usuarios, productos, pedidos, reservas, detalle_pedidos, calificaciones, contacto, domicilios;

-- Analizar tablas para mejores planes de consulta
ANALYZE TABLE usuarios, productos, pedidos, reservas, detalle_pedidos, calificaciones, contacto, domicilios;
