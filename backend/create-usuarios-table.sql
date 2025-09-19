-- Crear tabla usuarios faltante
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario int NOT NULL AUTO_INCREMENT,
  id_rol int NOT NULL,
  nombre_usuario varchar(100) NOT NULL,
  correo_usuario varchar(100) NOT NULL UNIQUE,
  contraseña_usuario varchar(255) NOT NULL,
  telefono_usuario varchar(10) NOT NULL,
  imagen_usuario varchar(255),
  fecha_registro timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_active timestamp NULL DEFAULT NULL,
  activo boolean NOT NULL DEFAULT TRUE,
  email_verificado boolean NOT NULL DEFAULT FALSE,
  PRIMARY KEY (id_usuario),
  CONSTRAINT fk_usuarios_roles FOREIGN KEY (id_rol) REFERENCES roles (id_rol) ON DELETE RESTRICT
);
