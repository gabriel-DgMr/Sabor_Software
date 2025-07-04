-- Script de creación de base de datos Sabor
-- Autor: Sistema Sabor
-- Fecha: 2025
-- Descripción: Script para crear la estructura inicial de la base de datos

-- Validar y crear la base de datos
DROP DATABASE IF EXISTS sabor_db_1;
CREATE DATABASE sabor_db_1 
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sabor_db_1;

-- Crear tablas base
CREATE TABLE categorias (
  id_categoria int NOT NULL AUTO_INCREMENT,
  nombre_categoria varchar(255) NOT NULL,
  descripcion_categoria varchar(255),
  fecha_creacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO categorias (nombre_categoria, descripcion_categoria) VALUES
('Entradas', 'Platos ligeros para iniciar la comida'),
('Platos fuertes', 'Comidas principales que sacian el apetito'),
('Bebidas', 'Bebidas frías, calientes, alcohólicas y no alcohólicas'),
('Postres', 'Opciones dulces para finalizar la comida'),
('Ensaladas', 'Platos frescos con vegetales y aderezos variados'),
('Combos', 'Combinaciones de productos a precio especial');

CREATE TABLE estados (
  id_estado int NOT NULL AUTO_INCREMENT, 
  nombre_estado varchar(100) NOT NULL,
  fecha_creacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO estados (id_estado, nombre_estado) VALUES 
(1, 'PENDIENTE'),
(2, 'COMPLETADO'),
(3, 'CANCELADO'),
(4, 'EN PREPARACION');

CREATE TABLE mesas (
  id_mesa int NOT NULL AUTO_INCREMENT,
  capacidad_mesa int NOT NULL,
  estado_mesa ENUM('disponible','ocupada','reservada','mantenimiento') NOT NULL DEFAULT 'disponible',
  fecha_creacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_mesa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO mesas (id_mesa, capacidad_mesa, estado_mesa) VALUES (1, 4, 'disponible');

CREATE TABLE roles (
  id_rol int NOT NULL AUTO_INCREMENT,
  nombre_rol varchar(50) NOT NULL,
  fecha_creacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE clientes (
  id_cliente int NOT NULL AUTO_INCREMENT,
  nombre_cliente varchar(100) NOT NULL,
  email_cliente varchar(100) NOT NULL UNIQUE,
  telefono_cliente varchar(15),
  contraseña_cliente varchar(255) NOT NULL,
  imagen_cliente varchar(255),
  fecha_registro timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  activo boolean NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id_cliente)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE empleados (
  id_empleado int NOT NULL AUTO_INCREMENT,
  id_rol int NOT NULL,
  nombre_empleado varchar(100) NOT NULL,
  correo_empleado varchar(100) NOT NULL UNIQUE,
  password_empleado varchar(255) NOT NULL,
  telefono_empleado varchar(15) NOT NULL,
  direccion_empleado varchar(255),
  imagen_empleado varchar(255),
  fecha_contratacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  activo boolean NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id_empleado),
  CONSTRAINT fk_empleados_roles FOREIGN KEY (id_rol) REFERENCES roles (id_rol) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE productos (
  id_producto int NOT NULL AUTO_INCREMENT,
  id_categoria int NOT NULL,
  nombre_producto varchar(100) NOT NULL,
  precio_producto decimal(10,2) NOT NULL,
  stock int NOT NULL DEFAULT 0,
  stock_minimo int NOT NULL DEFAULT 5,
  descripcion_producto text,
  imagen_producto varchar(255),
  fecha_creacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  activo boolean NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id_producto),
  CONSTRAINT fk_productos_categorias FOREIGN KEY (id_categoria) REFERENCES categorias (id_categoria) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO productos (
  id_categoria,
  nombre_producto,
  precio_producto,
  stock,
  stock_minimo,
  descripcion_producto,
  imagen_producto
) VALUES
(2, 'Bandeja Paisa', 25000, 0, 5, 'Un plato típico colombiano que celebra la abundancia y el sabor de la región. Nuestra bandeja paisa incluye arroz blanco, frijoles rojos caldosos, carne molida, chicharrón crocante, huevo frito, plátano maduro, arepa, aguacate y morcilla. Una experiencia completa y auténtica en cada bocado.', 'bandejapaisa_platosfuertes.png'),
(1, 'Arepa con Queso', 10000, 0, 5, 'Entrada tradicional y reconfortante. Arepa de maíz blanco, asada al punto perfecto y rellena con queso derretido. Crujiente por fuera, suave y cremosa por dentro. Ideal para empezar con sabor colombiano.', 'arepaconqueso_entradas.png'),
(2, 'Sancocho Trifásico', 25000, 0, 5, 'Una sopa reconfortante que mezcla carnes de res, cerdo y pollo con yuca, plátano verde, papa, mazorca y cilantro, perfecta para compartir en familia .', 'sancochotrifásico_platosfuertes.jpg'),
(2, 'Ajiaco Santafereño', 25000, 0, 5, 'Típico de Bogotá, este caldo espeso se prepara con pollo, tres tipos de papa (criolla, pastusa y sabanera), mazorca y guascas. Se sirve acompañado de arroz blanco, aguacate, alcaparras y crema de leche, ofreciendo una experiencia de sabores únicos.', 'ajiacosantafereño_platosfuertes.png'),
(2, 'Lechona Tolimense', 25000, 0, 5, 'Delicia tradicional del Tolima, consiste en un cerdo entero relleno de arroz, arvejas y especias, horneado lentamente hasta lograr una piel crujiente. Se sirve con arepa blanca y es infaltable en celebraciones especiales.', 'lechonatolimense_platosfuertes.png'),
(1, 'Natilla con Buñuelos', 10000, 0, 5, 'Postre típico de la Navidad colombiana. La natilla se elabora con fécula de maíz, leche y panela, mientras que los buñuelos son esponjosas bolitas fritas de queso. Juntos, representan el dulce cierre de nuestras festividades.', 'natillaconbuñuelos_entradas.png');
CREATE TABLE pedidos (
  id_pedido int NOT NULL AUTO_INCREMENT,
  id_cliente int NOT NULL,
  id_empleado int NOT NULL,
  id_estado int NOT NULL,
  fecha_pedido timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  total_pedido decimal(10,2) NOT NULL DEFAULT 0.00,
  metodo_pago ENUM('efectivo','tarjeta','transferencia') NOT NULL,
  notas text,
  PRIMARY KEY (id_pedido),
  CONSTRAINT fk_pedidos_clientes FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente) ON DELETE RESTRICT,
  CONSTRAINT fk_pedidos_empleados FOREIGN KEY (id_empleado) REFERENCES empleados (id_empleado) ON DELETE RESTRICT,
  CONSTRAINT fk_pedidos_estados FOREIGN KEY (id_estado) REFERENCES estados (id_estado) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE detalle_pedidos (
  id_detalle int NOT NULL AUTO_INCREMENT,
  id_pedido int NOT NULL,
  id_producto int NOT NULL,
  cantidad int NOT NULL,
  precio_unitario decimal(10,2) NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  PRIMARY KEY (id_detalle),
  CONSTRAINT fk_detalles_pedidos FOREIGN KEY (id_pedido) REFERENCES pedidos (id_pedido) ON DELETE CASCADE,
  CONSTRAINT fk_detalles_productos FOREIGN KEY (id_producto) REFERENCES productos (id_producto) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reservaciones (
  id_reservacion int NOT NULL AUTO_INCREMENT,
  id_cliente int NOT NULL,
  id_mesa int NOT NULL,
  id_estado int NOT NULL,
  fecha_reservacion date NOT NULL,
  hora_reservacion time NOT NULL,
  numero_personas int NOT NULL,
  fecha_creacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  notas text,
  PRIMARY KEY (id_reservacion),
  CONSTRAINT fk_reservaciones_clientes FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente) ON DELETE RESTRICT,
  CONSTRAINT fk_reservaciones_mesas FOREIGN KEY (id_mesa) REFERENCES mesas (id_mesa) ON DELETE RESTRICT,
  CONSTRAINT fk_reservaciones_estados FOREIGN KEY (id_estado) REFERENCES estados (id_estado) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE configuracion_horarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dia_semana ENUM('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'),
    hora_inicio TIME,
    hora_fin TIME,
    capacidad_maxima INT,
    activo BOOLEAN DEFAULT true
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE excepciones_horarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fecha DATE,
    hora_inicio TIME,
    hora_fin TIME,
    capacidad_maxima INT,
    motivo VARCHAR(255),
    activo BOOLEAN DEFAULT true
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO configuracion_horarios (dia_semana, hora_inicio, hora_fin, capacidad_maxima) VALUES
('LUNES', '12:00', '13:00', 4),
('LUNES', '13:00', '14:00', 4),
('LUNES', '14:00', '15:00', 4),
('LUNES', '19:00', '20:00', 4),
('LUNES', '20:00', '21:00', 4),
('LUNES', '21:00', '22:00', 4),

('MARTES', '12:00', '13:00', 4),
('MARTES', '13:00', '14:00', 4),
('MARTES', '14:00', '15:00', 4),
('MARTES', '19:00', '20:00', 4),
('MARTES', '20:00', '21:00', 4),
('MARTES', '21:00', '22:00', 4),

('MIERCOLES', '12:00', '13:00', 4),
('MIERCOLES', '13:00', '14:00', 4),
('MIERCOLES', '14:00', '15:00', 4),
('MIERCOLES', '19:00', '20:00', 4),
('MIERCOLES', '20:00', '21:00', 4),
('MIERCOLES', '21:00', '22:00', 4),

('JUEVES', '12:00', '13:00', 4),
('JUEVES', '13:00', '14:00', 4),
('JUEVES', '14:00', '15:00', 4),
('JUEVES', '19:00', '20:00', 4),
('JUEVES', '20:00', '21:00', 4),
('JUEVES', '21:00', '22:00', 4),

('VIERNES', '12:00', '13:00', 4),
('VIERNES', '13:00', '14:00', 4),
('VIERNES', '14:00', '15:00', 4),
('VIERNES', '19:00', '20:00', 4),
('VIERNES', '20:00', '21:00', 4),
('VIERNES', '21:00', '22:00', 4),

('SABADO', '12:00', '13:00', 4),
('SABADO', '13:00', '14:00', 4),
('SABADO', '14:00', '15:00', 4),
('SABADO', '19:00', '20:00', 4),
('SABADO', '20:00', '21:00', 4),
('SABADO', '21:00', '22:00', 4),

('DOMINGO', '12:00', '13:00', 4),
('DOMINGO', '13:00', '14:00', 4),
('DOMINGO', '14:00', '15:00', 4),
('DOMINGO', '19:00', '20:00', 4),
('DOMINGO', '20:00', '21:00', 4),
('DOMINGO', '21:00', '22:00', 4); 

-- Triggers
DELIMITER //

CREATE TRIGGER before_detalle_pedido_insert
BEFORE INSERT ON detalle_pedidos
FOR EACH ROW
BEGIN
    DECLARE precio DECIMAL(10,2);
    
    -- Obtener precio actual del producto
    SELECT precio_producto INTO precio 
    FROM productos 
    WHERE id_producto = NEW.id_producto;
    
    -- Establecer precio y subtotal
    SET NEW.precio_unitario = precio;
    SET NEW.subtotal = precio * NEW.cantidad;
END//

CREATE TRIGGER after_detalle_pedido_insert
AFTER INSERT ON detalle_pedidos
FOR EACH ROW
BEGIN
    -- Actualizar total del pedido
    UPDATE pedidos 
    SET total_pedido = total_pedido + NEW.subtotal
    WHERE id_pedido = NEW.id_pedido;
    
    -- Actualizar stock del producto
    UPDATE productos 
    SET stock = stock - NEW.cantidad
    WHERE id_producto = NEW.id_producto;
END//

CREATE TRIGGER before_detalle_pedido_delete
BEFORE DELETE ON detalle_pedidos
FOR EACH ROW
BEGIN
    -- Actualizar total del pedido
    UPDATE pedidos 
    SET total_pedido = total_pedido - OLD.subtotal
    WHERE id_pedido = OLD.id_pedido;
    
    -- Restaurar stock del producto
    UPDATE productos 
    SET stock = stock + OLD.cantidad
    WHERE id_producto = OLD.id_producto;
END//

-- Índices para optimización de consultas
CREATE INDEX idx_productos_categoria ON productos(id_categoria);
CREATE INDEX idx_pedidos_cliente ON pedidos(id_cliente);
CREATE INDEX idx_pedidos_empleado ON pedidos(id_empleado);
CREATE INDEX idx_pedidos_estado ON pedidos(id_estado);
CREATE INDEX idx_reservaciones_fecha ON reservaciones(fecha_reservacion);