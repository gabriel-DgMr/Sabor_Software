-- Migration 007: Migrate data from clientes and empleados to users table
-- Description: Transfers existing data to the new unified users table

-- First, add user_id column to existing tables
-- Note: These will fail if columns already exist, but that's expected
ALTER TABLE clientes ADD COLUMN user_id INT NULL;
ALTER TABLE empleados ADD COLUMN user_id INT NULL;

-- Add foreign key constraints
ALTER TABLE clientes ADD CONSTRAINT fk_clientes_users 
    FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE;
ALTER TABLE empleados ADD CONSTRAINT fk_empleados_users 
    FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE;

-- Update pedidos table to reference users instead of clientes
ALTER TABLE pedidos ADD COLUMN user_id INT NULL;
ALTER TABLE pedidos ADD CONSTRAINT fk_pedidos_users 
    FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE;

-- Update reservaciones table to reference users instead of clientes
ALTER TABLE reservaciones ADD COLUMN user_id INT NULL;
ALTER TABLE reservaciones ADD CONSTRAINT fk_reservaciones_users 
    FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE;

-- Update codigos_verificacion table to reference users instead of clientes
ALTER TABLE codigos_verificacion ADD COLUMN user_id INT NULL;
ALTER TABLE codigos_verificacion ADD CONSTRAINT fk_codigos_users 
    FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE;

-- Update mensajes_contacto table to reference users instead of clientes
ALTER TABLE mensajes_contacto ADD COLUMN user_id INT NULL;
ALTER TABLE mensajes_contacto ADD CONSTRAINT fk_mensajes_users 
    FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE;

-- Migrate clientes data to users table
INSERT INTO users (
    email, password, nombre, telefono, imagen, tipo_usuario, 
    activo, email_verificado, fecha_registro, fecha_modificacion
)
SELECT 
    email_cliente,
    contraseña_cliente,
    nombre_cliente,
    telefono_cliente,
    imagen_cliente,
    'cliente',
    activo,
    email_verificado,
    fecha_registro,
    fecha_modificacion
FROM clientes
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE users.email = clientes.email_cliente
);

-- Update clientes table with user_id references
UPDATE clientes c
JOIN users u ON c.email_cliente = u.email AND u.tipo_usuario = 'cliente'
SET c.user_id = u.id_user;

-- Migrate empleados data to users table
INSERT INTO users (
    email, password, nombre, telefono, imagen, tipo_usuario, 
    activo, direccion, id_rol, fecha_contratacion, fecha_modificacion
)
SELECT 
    e.correo_empleado,
    e.password_empleado,
    e.nombre_empleado,
    e.telefono_empleado,
    e.imagen_empleado,
    CASE 
        WHEN r.nombre_rol = 'Administrador' THEN 'administrador'
        ELSE 'empleado'
    END,
    e.activo,
    e.direccion_empleado,
    e.id_rol,
    e.fecha_contratacion,
    e.fecha_modificacion
FROM empleados e
JOIN roles r ON e.id_rol = r.id_rol
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE users.email = e.correo_empleado
);

-- Update empleados table with user_id references
UPDATE empleados e
JOIN users u ON e.correo_empleado = u.email AND u.tipo_usuario IN ('empleado', 'administrador')
SET e.user_id = u.id_user;

-- Update related tables to use user_id instead of id_cliente

-- Update pedidos table
UPDATE pedidos p
JOIN clientes c ON p.id_cliente = c.id_cliente
SET p.user_id = c.user_id
WHERE c.user_id IS NOT NULL;

-- Update reservaciones table
UPDATE reservaciones r
JOIN clientes c ON r.id_cliente = c.id_cliente
SET r.user_id = c.user_id
WHERE c.user_id IS NOT NULL;

-- Update codigos_verificacion table
UPDATE codigos_verificacion cv
JOIN clientes c ON cv.id_cliente = c.id_cliente
SET cv.user_id = c.user_id
WHERE c.user_id IS NOT NULL;

-- Update mensajes_contacto table
UPDATE mensajes_contacto mc
JOIN clientes c ON mc.id_cliente = c.id_cliente
SET mc.user_id = c.user_id
WHERE c.user_id IS NOT NULL;

-- Verification queries to ensure data integrity
SELECT 'Clientes migrados correctamente' as status, COUNT(*) as total 
FROM clientes WHERE user_id IS NOT NULL;

SELECT 'Empleados migrados correctamente' as status, COUNT(*) as total 
FROM empleados WHERE user_id IS NOT NULL;

SELECT 'Pedidos actualizados' as status, COUNT(*) as total 
FROM pedidos WHERE user_id IS NOT NULL;

SELECT 'Reservaciones actualizadas' as status, COUNT(*) as total 
FROM reservaciones WHERE user_id IS NOT NULL;

SELECT 'Usuarios totales en tabla users' as status, COUNT(*) as total 
FROM users; 