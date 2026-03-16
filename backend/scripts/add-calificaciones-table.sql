-- Crea la tabla de calificaciones si no existe
CREATE TABLE IF NOT EXISTS calificaciones_productos (
  id_calificacion INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_producto INT NOT NULL,
  id_pedido INT NOT NULL,
  calificacion DECIMAL(2,1) NOT NULL,
  comentario TEXT NULL,
  fecha_calificacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_calificacion),
  UNIQUE KEY uq_calificacion_usuario_producto_pedido (id_usuario, id_producto, id_pedido),
  KEY idx_calificacion_producto (id_producto),
  KEY idx_calificacion_usuario (id_usuario),
  KEY idx_calificacion_pedido (id_pedido),
  CONSTRAINT fk_calificacion_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_calificacion_producto FOREIGN KEY (id_producto) REFERENCES productos (id_producto) ON DELETE CASCADE,
  CONSTRAINT fk_calificacion_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos (id_pedido) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
