-- Migration: 003_insert_initial_data.sql
-- Descripción: Insertar datos iniciales en las tablas del sistema
-- Fecha: 2024-01-03

-- ========================
-- INSERCIÓN DE DATOS BASE
-- ========================

-- Insertar categorías
INSERT INTO categorias (nombre_categoria, descripcion_categoria) VALUES
('Entradas', 'Platos ligeros para iniciar la comida'),
('Platos fuertes', 'Comidas principales que sacian el apetito'),
('Bebidas', 'Bebidas frías, calientes, alcohólicas y no alcohólicas'),
('Postres', 'Opciones dulces para finalizar la comida'),
('Ensaladas', 'Platos frescos con vegetales y aderezos variados'),
('Combos', 'Combinaciones de productos a precio especial');

-- Insertar estados
INSERT INTO estados (id_estado, nombre_estado) VALUES 
(1, 'CARRITO'), 
(2, 'PENDIENTE'), 
(3, 'COMPLETADO'), 
(4, 'CANCELADO'), 
(5, 'EN PREPARACION');

-- Insertar mesas
INSERT INTO mesas (capacidad_mesa, estado_mesa) VALUES
(4, 'disponible'),
(2, 'disponible'),
(6, 'disponible'),
(4, 'disponible'),
(2, 'disponible'),
(4, 'disponible'),
(8, 'disponible'),
(4, 'disponible'),
(2, 'disponible'),
(6, 'disponible'),
(4, 'disponible'),
(2, 'disponible'),
(4, 'disponible'),
(6, 'disponible'),
(4, 'disponible'),
(2, 'disponible'),
(8, 'disponible'),
(4, 'disponible'),
(2, 'disponible'),
(4, 'disponible'),
(6, 'disponible'),
(4, 'disponible'),
(2, 'disponible'),
(4, 'disponible'),
(8, 'disponible'),
(4, 'disponible'),
(2, 'disponible'),
(6, 'disponible'),
(4, 'disponible'),
(2, 'disponible');

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

-- Migración automática de descripciones de productos a la tabla de traducciones (español)
INSERT INTO producto_traducciones (producto_id, idioma, descripcion)
SELECT id_producto, 'es', descripcion_producto FROM productos;

-- Insertar traducciones al inglés
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