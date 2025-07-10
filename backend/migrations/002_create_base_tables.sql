-- Migration: 002_create_base_tables.sql
-- Descripción: Crear todas las tablas base del sistema
-- Fecha: 2024-01-02

-- Usar la base de datos sabor_db
USE sabor_db;

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

CREATE TABLE clientes (
  id_cliente int NOT NULL AUTO_INCREMENT,
  nombre_cliente varchar(100) NOT NULL,
  email_cliente varchar(100) NOT NULL UNIQUE,
  telefono_cliente varchar(15),
  contraseña_cliente varchar(255) NOT NULL,
  imagen_cliente varchar(255),
  fecha_registro timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  activo boolean NOT NULL DEFAULT FALSE,
  email_verificado boolean NOT NULL DEFAULT FALSE,
  PRIMARY KEY (id_cliente)
);

CREATE TABLE mensajes_contacto (
  id_mensaje INT NOT NULL AUTO_INCREMENT,
  id_cliente INT NULL,
  nombre VARCHAR(100) NULL,
  email VARCHAR(100) NULL,
  mensaje TEXT NOT NULL,
  fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_mensaje),
  CONSTRAINT fk_mensajes_cliente FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para códigos de verificación de email
CREATE TABLE codigos_verificacion (
  id_codigo int NOT NULL AUTO_INCREMENT,
  id_cliente int NOT NULL,
  codigo varchar(6) NOT NULL,
  fecha_creacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion timestamp NOT NULL,
  usado boolean NOT NULL DEFAULT FALSE,
  PRIMARY KEY (id_codigo),
  CONSTRAINT fk_codigos_verificacion_cliente FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente) ON DELETE CASCADE
);

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
  id_cliente int NOT NULL,
  id_empleado int NULL,
  id_mesa int,
  id_estado int NOT NULL,
  fecha_pedido timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  total_pedido decimal(10,2) NOT NULL DEFAULT 0.00,
  metodo_pago ENUM('efectivo','tarjeta','transferencia') DEFAULT NULL,
  notas text,
  PRIMARY KEY (id_pedido),
  CONSTRAINT fk_pedidos_clientes FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente) ON DELETE RESTRICT,
  CONSTRAINT fk_pedidos_empleados FOREIGN KEY (id_empleado) REFERENCES empleados (id_empleado) ON DELETE RESTRICT,
  CONSTRAINT fk_pedidos_mesas FOREIGN KEY (id_mesa) REFERENCES mesas (id_mesa) ON DELETE SET NULL,
  CONSTRAINT fk_pedidos_estados FOREIGN KEY (id_estado) REFERENCES estados (id_estado) ON DELETE RESTRICT
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

-- Registrar esta migration como ejecutada
INSERT IGNORE INTO migration_history (migration_file, status) VALUES 
('002_create_base_tables.sql', 'success'); 