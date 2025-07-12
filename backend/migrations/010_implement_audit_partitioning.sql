-- Migration 010: Implement automatic monthly partitioning for users_audit table (Safe Version)
-- Description: Creates automated monthly partitions with 2 months advance for better performance
-- Note: Event Scheduler must be enabled manually by a DB admin

-- Create backup of current audit data
CREATE TABLE IF NOT EXISTS users_audit_backup AS SELECT * FROM users_audit;

-- Drop the existing users_audit table
DROP TABLE IF EXISTS users_audit;

-- Create new partitioned users_audit table
CREATE TABLE users_audit (
    id_audit INT AUTO_INCREMENT,
    id_user INT NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    changed_by INT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id_audit, changed_at),
    INDEX idx_audit_user (id_user),
    INDEX idx_audit_action (action),
    INDEX idx_audit_date (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
PARTITION BY RANGE (UNIX_TIMESTAMP(changed_at)) (
    PARTITION p_202412 VALUES LESS THAN (UNIX_TIMESTAMP('2025-01-01 00:00:00')),
    PARTITION p_202501 VALUES LESS THAN (UNIX_TIMESTAMP('2025-02-01 00:00:00')),
    PARTITION p_202502 VALUES LESS THAN (UNIX_TIMESTAMP('2025-03-01 00:00:00')),
    PARTITION p_202503 VALUES LESS THAN (UNIX_TIMESTAMP('2025-04-01 00:00:00')),
    PARTITION p_202504 VALUES LESS THAN (UNIX_TIMESTAMP('2025-05-01 00:00:00'))
);

-- Restore audit data from backup if exists
INSERT INTO users_audit (id_user, action, old_values, new_values, changed_by, changed_at)
SELECT id_user, action, old_values, new_values, changed_by, changed_at 
FROM users_audit_backup
WHERE EXISTS (SELECT 1 FROM users_audit_backup LIMIT 1);

-- Create stored procedure to generate future partitions
DELIMITER //

CREATE PROCEDURE sp_create_audit_partitions()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE partition_name VARCHAR(20);
    DECLARE partition_date DATE;
    DECLARE next_partition_date DATE;
    DECLARE partition_timestamp INT;
    DECLARE sql_stmt TEXT;
    DECLARE partition_exists INT DEFAULT 0;
    
    -- Get current date and calculate future partitions (2 months ahead)
    SET partition_date = DATE_FORMAT(CURDATE() + INTERVAL 1 MONTH, '%Y-%m-01');
    
    -- Create partitions for next 3 months
    WHILE partition_date <= DATE_ADD(CURDATE(), INTERVAL 3 MONTH) DO
        -- Generate partition name (format: p_YYYYMM)
        SET partition_name = CONCAT('p_', DATE_FORMAT(partition_date, '%Y%m'));
        
        -- Calculate next month's first day for the partition upper bound
        SET next_partition_date = DATE_ADD(partition_date, INTERVAL 1 MONTH);
        SET partition_timestamp = UNIX_TIMESTAMP(next_partition_date);
        
        -- Check if partition already exists
        SELECT COUNT(*) INTO partition_exists 
        FROM information_schema.partitions 
        WHERE table_schema = DATABASE() 
        AND table_name = 'users_audit' 
        AND partition_name = partition_name;
        
        -- Create partition if it doesn't exist
        IF partition_exists = 0 THEN
            SET sql_stmt = CONCAT(
                'ALTER TABLE users_audit ADD PARTITION (',
                'PARTITION ', partition_name, 
                ' VALUES LESS THAN (', partition_timestamp, '))'
            );
            
            SET @sql = sql_stmt;
            PREPARE stmt FROM @sql;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;
            
            -- Log partition creation if migration_log table exists
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'migration_log') THEN
                INSERT INTO migration_log (operation, message, executed_at) 
                VALUES ('PARTITION_CREATE', CONCAT('Created partition: ', partition_name), NOW());
            END IF;
        END IF;
        
        -- Move to next month
        SET partition_date = DATE_ADD(partition_date, INTERVAL 1 MONTH);
    END WHILE;
    
END //

CREATE PROCEDURE sp_cleanup_old_audit_partitions()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE partition_name VARCHAR(20);
    DECLARE partition_date DATE;
    DECLARE sql_stmt TEXT;
    DECLARE cur CURSOR FOR 
        SELECT p.partition_name 
        FROM information_schema.partitions p
        WHERE p.table_schema = DATABASE() 
        AND p.table_name = 'users_audit'
        AND p.partition_name REGEXP '^p_[0-9]{6}$'
        AND STR_TO_DATE(CONCAT(SUBSTRING(p.partition_name, 3), '01'), '%Y%m%d') < DATE_SUB(CURDATE(), INTERVAL 12 MONTH);
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO partition_name;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Drop old partition (older than 12 months)
        SET sql_stmt = CONCAT('ALTER TABLE users_audit DROP PARTITION ', partition_name);
        
        SET @sql = sql_stmt;
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        -- Log partition cleanup if migration_log table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'migration_log') THEN
            INSERT INTO migration_log (operation, message, executed_at) 
            VALUES ('PARTITION_DROP', CONCAT('Dropped old partition: ', partition_name), NOW());
        END IF;
        
    END LOOP;
    
    CLOSE cur;
END //

DELIMITER ;

-- Create migration log table if it doesn't exist
CREATE TABLE IF NOT EXISTS migration_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    operation VARCHAR(50) NOT NULL,
    message TEXT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_operation (operation),
    INDEX idx_date (executed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create the initial partitions
CALL sp_create_audit_partitions();

-- Recreate the audit triggers for the new partitioned table
DELIMITER //

-- Drop existing triggers
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

-- Create views for easier partition management
CREATE VIEW v_audit_partition_info AS
SELECT 
    p.partition_name,
    p.partition_ordinal_position,
    p.partition_description,
    p.table_rows,
    ROUND(p.data_length / 1024 / 1024, 2) as size_mb,
    STR_TO_DATE(CONCAT(SUBSTRING(p.partition_name, 3), '01'), '%Y%m%d') as partition_month
FROM information_schema.partitions p
WHERE p.table_schema = DATABASE() 
AND p.table_name = 'users_audit'
AND p.partition_name IS NOT NULL
ORDER BY p.partition_ordinal_position;

-- Create helper functions for partition management
DELIMITER //

CREATE FUNCTION fn_get_audit_partition_for_date(audit_date DATE)
RETURNS VARCHAR(20)
READS SQL DATA
DETERMINISTIC
BEGIN
    RETURN CONCAT('p_', DATE_FORMAT(audit_date, '%Y%m'));
END //

CREATE PROCEDURE sp_audit_partition_stats()
BEGIN
    SELECT 
        COUNT(*) as total_partitions,
        MIN(partition_month) as oldest_partition,
        MAX(partition_month) as newest_partition,
        SUM(table_rows) as total_rows,
        SUM(size_mb) as total_size_mb
    FROM v_audit_partition_info;
    
    SELECT * FROM v_audit_partition_info;
END //

DELIMITER ;

-- Insert success log
INSERT INTO migration_log (operation, message, executed_at) 
VALUES ('MIGRATION_COMPLETE', 'Audit table partitioning implemented successfully (Safe Version)', NOW());

-- Instructions for enabling Event Scheduler (requires SUPER privileges)
SELECT '=== MANUAL SETUP REQUIRED ===' AS notice;
SELECT 'The following commands must be run by a database administrator with SUPER privileges:' AS instructions;
SELECT 'SET GLOBAL event_scheduler = ON;' AS step_1;
SELECT 'Then create the following events:' AS step_2;

-- Show the EVENT creation statements for manual execution
SELECT '
CREATE EVENT ev_create_audit_partitions
ON SCHEDULE EVERY 1 MONTH
STARTS CONCAT(DATE_FORMAT(LAST_DAY(CURDATE()) + INTERVAL 1 DAY, "%Y-%m-%d"), " 02:00:00")
DO
BEGIN
    CALL sp_create_audit_partitions();
END;
' AS event_1_create_partitions;

SELECT '
CREATE EVENT ev_cleanup_old_audit_partitions
ON SCHEDULE EVERY 1 MONTH
STARTS CONCAT(DATE_FORMAT(LAST_DAY(CURDATE()) + INTERVAL 1 DAY, "%Y-%m-%d"), " 03:00:00")
DO
BEGIN
    CALL sp_cleanup_old_audit_partitions();
END;
' AS event_2_cleanup_partitions;

-- Show partition information
SELECT 'Audit table partitioning completed successfully (Manual Event Setup Required)' as status;
CALL sp_audit_partition_stats(); 