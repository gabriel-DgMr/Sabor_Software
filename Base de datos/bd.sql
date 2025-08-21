-- Crear base de datos
DROP DATABASE IF EXISTS sabor_db_1;
CREATE DATABASE sabor_db_1 
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE sabor_db_1;

-- ========================
-- TABLAS BASE
-- ========================

CREATE TABLE categorias (
  id_categoria int NOT NULL AUTO_INCREMENT,
  nombre_categoria varchar(255) NOT NULL,
  descripcion_categoria varchar(255),
  fecha_creacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_categoria)
);

-- Tabla de traducciones para categorías
CREATE TABLE categoria_traducciones (
  id_traduccion INT PRIMARY KEY AUTO_INCREMENT,
  categoria_id INT NOT NULL,
  idioma VARCHAR(5) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion VARCHAR(255),
  FOREIGN KEY (categoria_id) REFERENCES categorias(id_categoria) ON DELETE CASCADE,
  UNIQUE KEY (categoria_id, idioma)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE estados (
  id_estado int NOT NULL AUTO_INCREMENT, 
  nombre_estado varchar(100) NOT NULL,
  fecha_creacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_estado)
);

CREATE TABLE mesas (
  id_mesa int NOT NULL AUTO_INCREMENT,
  capacidad_mesa int NOT NULL,
  estado_mesa ENUM('disponible','ocupada','reservada','mantenimiento') NOT NULL DEFAULT 'disponible',
  fecha_creacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_mesa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE roles (
  id_rol int NOT NULL AUTO_INCREMENT,
  nombre_rol varchar(50) NOT NULL,
  fecha_creacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_rol)
);

INSERT INTO roles (nombre_rol) VALUES
("Usuario"),
("Empleado"),
("Administrador");


CREATE TABLE usuarios (
  id_usuario int NOT NULL AUTO_INCREMENT,
  id_rol int NOT NULL ,
  nombre_usuario varchar(100) NOT NULL,
  correo_usuario varchar(100) NOT NULL UNIQUE,
  contraseña_usuario varchar(255) NOT NULL,
  telefono_usuario varchar(10) NOT NULL,
  imagen_usuario varchar(255),
  fecha_registro timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  activo boolean NOT NULL DEFAULT TRUE,
  email_verificado boolean NOT NULL DEFAULT FALSE,
  PRIMARY KEY (id_usuario),
  CONSTRAINT fk_empleados_roles FOREIGN KEY (id_rol) REFERENCES roles (id_rol) ON DELETE RESTRICT
);

CREATE TABLE mensajes_contacto (
  id_mensaje INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NULL,
  nombre VARCHAR(100) NULL,
  email VARCHAR(100) NULL,
  mensaje TEXT NOT NULL,
  fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_mensaje),
  CONSTRAINT fk_mensajes_cliente FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para códigos de verificación de email
CREATE TABLE codigos_verificacion (
  id_codigo int NOT NULL AUTO_INCREMENT,
  id_usuario int NOT NULL,
  codigo varchar(6) NOT NULL,
  fecha_creacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  usado boolean NOT NULL DEFAULT FALSE,
  PRIMARY KEY (id_codigo),
  CONSTRAINT fk_codigos_verificacion_cliente FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE
);

CREATE TABLE productos (
  id_producto int NOT NULL AUTO_INCREMENT,
  id_categoria int NOT NULL,
  nombre_producto varchar(100) NOT NULL,
  precio_producto decimal(10,2) NOT NULL,
  stock int NOT NULL DEFAULT 0,
  stock_minimo int NOT NULL DEFAULT 5,
  descripcion_producto text,
  imagen_producto varchar(255),
  calificacion decimal(2,1) DEFAULT 0,
  ventas int DEFAULT 0,
  fecha_creacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  activo boolean NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id_producto),
  CONSTRAINT fk_productos_categorias FOREIGN KEY (id_categoria) REFERENCES categorias (id_categoria) ON DELETE RESTRICT
);

CREATE TABLE producto_traducciones (
  id_traducciones INT PRIMARY KEY AUTO_INCREMENT,
  producto_id INT NOT NULL,
  idioma VARCHAR(5) NOT NULL,
  descripcion TEXT NOT NULL,
  FOREIGN KEY (producto_id) REFERENCES productos(id_producto) ON DELETE CASCADE,
  UNIQUE KEY (producto_id, idioma)
);

CREATE TABLE pedidos (
  id_pedido int NOT NULL AUTO_INCREMENT,
  id_usuario int NOT NULL,
  id_mesa int,
  id_estado int NOT NULL,
  fecha_pedido timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  total_pedido decimal(10,2) NOT NULL DEFAULT 0.00,
  metodo_pago ENUM('efectivo','tarjeta','transferencia') DEFAULT NULL,
  notas text,
  PRIMARY KEY (id_pedido),
  CONSTRAINT fk_pedidos_mesas FOREIGN KEY (id_mesa) REFERENCES mesas (id_mesa) ON DELETE SET NULL,
  CONSTRAINT fk_pedidos_estados FOREIGN KEY (id_estado) REFERENCES estados (id_estado) ON DELETE RESTRICT
);

CREATE TABLE pedido_usuarios (
  id_pedido INT NOT NULL,
  id_usuario INT NOT NULL,
  rol_en_pedido ENUM('cliente', 'empleado', 'administrador') NOT NULL,
  PRIMARY KEY (id_pedido, id_usuario),
  FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

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
);

CREATE TABLE reservaciones (
  id_reservacion int NOT NULL AUTO_INCREMENT,
  id_usuario int NOT NULL,
  id_mesa int NOT NULL,
  id_estado int NOT NULL,
  fecha_reservacion date NOT NULL,
  hora_reservacion time NOT NULL,
  numero_personas int NOT NULL,
  fecha_creacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  notas text,
  PRIMARY KEY (id_reservacion),
  CONSTRAINT fk_reservaciones_clientes FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE RESTRICT,
  CONSTRAINT fk_reservaciones_mesas FOREIGN KEY (id_mesa) REFERENCES mesas (id_mesa) ON DELETE RESTRICT,
  CONSTRAINT fk_reservaciones_estados FOREIGN KEY (id_estado) REFERENCES estados (id_estado) ON DELETE RESTRICT
);

CREATE TABLE configuracion_horarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dia_semana ENUM('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'),
    hora_inicio TIME,
    hora_fin TIME,
    capacidad_maxima INT,
    activo BOOLEAN DEFAULT true
);

CREATE TABLE excepciones_horarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fecha DATE,
    hora_inicio TIME,
    hora_fin TIME,
    capacidad_maxima INT,
    motivo VARCHAR(255),
    activo BOOLEAN DEFAULT true
);

-- ========================
-- INSERCIÓN DE DATOS BASE
-- ========================

INSERT INTO categorias (nombre_categoria, descripcion_categoria) VALUES
('Entradas', 'Platos ligeros para iniciar la comida'),
('Platos fuertes', 'Comidas principales que sacian el apetito'),
('Bebidas', 'Bebidas frías, calientes, alcohólicas y no alcohólicas'),
('Postres', 'Opciones dulces para finalizar la comida'),
('Ensaladas', 'Platos frescos con vegetales y aderezos variados'),
('Combos', 'Combinaciones de productos a precio especial');

-- Migrar datos existentes al español
INSERT INTO categoria_traducciones (categoria_id, idioma, nombre, descripcion)
SELECT 
  id_categoria, 
  'es', 
  nombre_categoria, 
  descripcion_categoria 
FROM categorias;

-- Insertar traducciones al inglés
INSERT INTO categoria_traducciones (categoria_id, idioma, nombre, descripcion) VALUES
(1, 'en', 'Appetizers', 'Light dishes to start the meal'),
(2, 'en', 'Main Dishes', 'Main meals that satisfy hunger'),
(3, 'en', 'Beverages', 'Cold, hot, alcoholic and non-alcoholic drinks'),
(4, 'en', 'Desserts', 'Sweet options to finish the meal'),
(5, 'en', 'Salads', 'Fresh dishes with vegetables and various dressings'),
(6, 'en', 'Combos', 'Product combinations at special prices');

INSERT INTO estados (id_estado, nombre_estado) VALUES 
(1, 'CARRITO'), (2, 'PENDIENTE'), (3, 'COMPLETADO'), (4, 'CANCELADO'), (5, 'EN PREPARACION');

INSERT INTO mesas (id_mesa, capacidad_mesa, estado_mesa) VALUES
(1, 4, 'disponible'),
(2, 4, 'disponible'),
(3, 4, 'disponible'),
(4, 4, 'disponible'),
(5, 4, 'disponible'),
(6, 4, 'disponible'),
(7, 4, 'disponible'),
(8, 4, 'disponible'),
(9, 4, 'disponible'),
(10, 4, 'disponible'),
(11, 4, 'disponible'),
(12, 4, 'disponible'),
(13, 4, 'disponible'),
(14, 4, 'disponible'),
(15, 4, 'disponible'),
(16, 4, 'disponible'),
(17, 4, 'disponible'),
(18, 4, 'disponible'),
(19, 4, 'disponible'),
(20, 4, 'disponible');

-- Insertar productos
INSERT INTO productos (
  id_categoria,
  nombre_producto,
  precio_producto,
  stock,
  stock_minimo,
  descripcion_producto,
  imagen_producto
) VALUES
(2, 'Bandeja Paisa', 25000, 50, 5, 'Un plato típico colombiano que celebra la abundancia y el sabor de la región. Nuestra bandeja paisa incluye arroz blanco, frijoles rojos caldosos, carne molida, chicharrón crocante, huevo frito, plátano maduro, arepa, aguacate y morcilla. Una experiencia completa y auténtica en cada bocado.', 'bandejapaisa_platosfuertes.png'),
(1, 'Arepa con Queso', 10000, 50, 5, 'Entrada tradicional y reconfortante. Arepa de maíz blanco, asada al punto perfecto y rellena con queso derretido. Crujiente por fuera, suave y cremosa por dentro. Ideal para empezar con sabor colombiano.', 'arepaconqueso_entradas.png'),
(2, 'Sancocho Trifásico', 25000, 50, 5, 'Una sopa reconfortante que mezcla carnes de res, cerdo y pollo con yuca, plátano verde, papa, mazorca y cilantro, perfecta para compartir en familia .', 'sancochotrifásico_platosfuertes.jpg'),
(2, 'Ajiaco Santafereño', 25000, 50, 5, 'Típico de Bogotá, este caldo espeso se prepara con pollo, tres tipos de papa (criolla, pastusa y sabanera), mazorca y guascas. Se sirve acompañado de arroz blanco, aguacate, alcaparras y crema de leche, ofreciendo una experiencia de sabores únicos.', 'ajiacosantafereño_platosfuertes.png'),
(2, 'Lechona Tolimense', 25000, 50, 5, 'Delicia tradicional del Tolima, consiste en un cerdo entero relleno de arroz, arvejas y especias, horneado lentamente hasta lograr una piel crujiente. Se sirve con arepa blanca y es infaltable en celebraciones especiales.', 'lechonatolimense_platosfuertes.png'),
(1, 'Natilla con Buñuelos', 10000, 50, 5, 'Postre típico de la Navidad colombiana. La natilla se elabora con fécula de maíz, leche y panela, mientras que los buñuelos son esponjosas bolitas fritas de queso. Juntos, representan el dulce cierre de nuestras festividades.', 'natillaconbuñuelos_entradas.png');

-- Migrar descripciones al español
INSERT INTO producto_traducciones (producto_id, idioma, descripcion)
SELECT id_producto, 'es', descripcion_producto FROM productos;

-- Traducciones al inglés
INSERT INTO producto_traducciones (producto_id, idioma, descripcion) VALUES
(1, 'en', 'A traditional Colombian dish that celebrates the abundance and flavor of the region. Our bandeja paisa includes white rice, stewed red beans, ground beef, crispy pork belly, fried egg, ripe plantain, arepa, avocado, and blood sausage. A complete and authentic experience in every bite.'),
(2, 'en', 'A traditional and comforting starter. White corn arepa, grilled to perfection and filled with melted cheese. Crunchy on the outside, soft and creamy on the inside. Ideal to start with Colombian flavor.'),
(3, 'en', 'A comforting soup that combines beef, pork, and chicken with cassava, green plantain, potato, corn on the cob, and cilantro. Perfect for sharing with family.'),
(4, 'en', 'Typical of Bogotá, this thick soup is made with chicken, three types of potatoes (criolla, pastusa, and sabanera), corn on the cob, and guascas. Served with white rice, avocado, capers, and cream, offering a unique flavor experience.'),
(5, 'en', 'A traditional delicacy from Tolima, consisting of a whole pig stuffed with rice, peas, and spices, slowly roasted until the skin is crispy. Served with white arepa and a must-have at special celebrations.'),
(6, 'en', 'A traditional Colombian Christmas dessert. Natilla is made with cornstarch, milk, and panela, while buñuelos are fluffy fried cheese balls. Together, they represent the sweet ending to our festivities.');

-- ========================
-- HORARIOS
-- ========================
INSERT INTO configuracion_horarios (dia_semana, hora_inicio, hora_fin, capacidad_maxima) VALUES
('LUNES', '12:00', '13:00', 20),
('LUNES', '13:00', '14:00', 20),
('LUNES', '14:00', '15:00', 20),
('LUNES', '19:00', '20:00', 20),
('LUNES', '20:00', '21:00', 20),
('LUNES', '21:00', '22:00', 20),

('MARTES', '12:00', '13:00', 20),
('MARTES', '13:00', '14:00', 20),
('MARTES', '14:00', '15:00', 20),
('MARTES', '19:00', '20:00', 20),
('MARTES', '20:00', '21:00', 20),
('MARTES', '21:00', '22:00', 20),

('MIERCOLES', '12:00', '13:00', 20),
('MIERCOLES', '13:00', '14:00', 20),
('MIERCOLES', '14:00', '15:00', 20),
('MIERCOLES', '19:00', '20:00', 20),
('MIERCOLES', '20:00', '21:00', 20),
('MIERCOLES', '21:00', '22:00', 20),

('JUEVES', '12:00', '13:00', 20),
('JUEVES', '13:00', '14:00', 20),
('JUEVES', '14:00', '15:00', 20),
('JUEVES', '19:00', '20:00', 20),
('JUEVES', '20:00', '21:00', 20),
('JUEVES', '21:00', '22:00', 20),

('VIERNES', '12:00', '13:00', 20),
('VIERNES', '13:00', '14:00', 20),
('VIERNES', '14:00', '15:00', 20),
('VIERNES', '19:00', '20:00', 20),
('VIERNES', '20:00', '21:00', 20),
('VIERNES', '21:00', '22:00', 20),

('SABADO', '12:00', '13:00', 20),
('SABADO', '13:00', '14:00', 20),
('SABADO', '14:00', '15:00', 20),
('SABADO', '19:00', '20:00', 20),
('SABADO', '20:00', '21:00', 20),
('SABADO', '21:00', '22:00', 20),

('DOMINGO', '12:00', '13:00', 20),
('DOMINGO', '13:00', '14:00', 20),
('DOMINGO', '14:00', '15:00', 20),
('DOMINGO', '19:00', '20:00', 20),
('DOMINGO', '20:00', '21:00', 20),
('DOMINGO', '21:00', '22:00', 20); 

-- ========================
-- TRIGGERS
-- ========================
DELIMITER //

CREATE TRIGGER before_detalle_pedido_insert
BEFORE INSERT ON detalle_pedidos
FOR EACH ROW
BEGIN
  DECLARE precio DECIMAL(10,2);
  SELECT precio_producto INTO precio FROM productos WHERE id_producto = NEW.id_producto;
  SET NEW.precio_unitario = precio;
  SET NEW.subtotal = precio * NEW.cantidad;
END//

CREATE TRIGGER after_detalle_pedido_insert
AFTER INSERT ON detalle_pedidos
FOR EACH ROW
BEGIN
  UPDATE pedidos SET total_pedido = total_pedido + NEW.subtotal WHERE id_pedido = NEW.id_pedido;
  UPDATE productos SET stock = stock - NEW.cantidad WHERE id_producto = NEW.id_producto;
END//

CREATE TRIGGER before_detalle_pedido_delete
BEFORE DELETE ON detalle_pedidos
FOR EACH ROW
BEGIN
  UPDATE pedidos SET total_pedido = total_pedido - OLD.subtotal WHERE id_pedido = OLD.id_pedido;
  UPDATE productos SET stock = stock + OLD.cantidad WHERE id_producto = OLD.id_producto;
END//

DELIMITER ;

-- ========================
-- ÍNDICES
-- ========================
CREATE INDEX idx_productos_categoria ON productos(id_categoria);
CREATE INDEX idx_pedidos_estado ON pedidos(id_estado);
CREATE INDEX idx_reservaciones_fecha ON reservaciones(fecha_reservacion);
CREATE INDEX idx_categoria_traducciones_idioma ON categoria_traducciones(idioma);
CREATE INDEX idx_categoria_traducciones_categoria ON categoria_traducciones(categoria_id);

-- ========================
-- AJUSTE DE STOCK PARA PRUEBAS
-- ========================

-- Permitir NULL en metodo_pago e id_empleado
ALTER TABLE pedidos 
  MODIFY metodo_pago ENUM('efectivo','tarjeta','transferencia') DEFAULT NULL;
  