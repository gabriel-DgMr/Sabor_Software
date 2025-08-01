-- Create MySQL Events for automatic partition management
-- Must be run with SUPER privileges (root user)

USE sabor_db;

-- Drop existing events if they exist
DROP EVENT IF EXISTS ev_create_audit_partitions;
DROP EVENT IF EXISTS ev_cleanup_old_audit_partitions;

-- Create event to automatically create partitions monthly
DELIMITER //
CREATE EVENT ev_create_audit_partitions
ON SCHEDULE EVERY 1 MONTH
STARTS CONCAT(DATE_FORMAT(LAST_DAY(CURDATE()) + INTERVAL 1 DAY, '%Y-%m-%d'), ' 02:00:00')
DO
BEGIN
    CALL sp_create_audit_partitions();
END //

-- Create event to cleanup old partitions (keep 12 months)
CREATE EVENT ev_cleanup_old_audit_partitions
ON SCHEDULE EVERY 1 MONTH
STARTS CONCAT(DATE_FORMAT(LAST_DAY(CURDATE()) + INTERVAL 1 DAY, '%Y-%m-%d'), ' 03:00:00')
DO
BEGIN
    CALL sp_cleanup_old_audit_partitions();
END //
DELIMITER ;

-- Show created events
SELECT 
    event_name,
    interval_value,
    interval_field,
    status,
    last_executed
FROM information_schema.events 
WHERE event_schema = 'sabor_db'; 