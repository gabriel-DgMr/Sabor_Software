import { productoModel } from "../models/productoModel.js";
import { categoriaModel } from "../models/categoriaModel.js";
import { productoTraduccionModel } from "../models/productoModel.js";

export const productoController = {
  // Obtener todos los productos
  getAllProductos: async (req, res) => {
    try {
      const filtros = {
        categoria: req.query.categoria || "",
        busqueda: req.query.busqueda || "",
        orden: req.query.orden || "",
        idioma: req.query.lang || "es",
      };
      const productos = await productoModel.getAllProductos(filtros);
      res.json(productos);
      console.log("res.json(productos)");
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener los productos",
        error: error.message,
      });
    }
  },

  // Obtener producto por ID
  getProductoById: async (req, res) => {
    try {
      const producto = await productoModel.getProductoById(req.params.id);
      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      res.json(producto);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Crear nuevo producto
  createProducto: async (req, res) => {
    try {
      console.log("Body recibido:", req.body);
      console.log("Archivo recibido:", req.file);
      console.log("Headers recibidos:", req.headers);

      const {
        nombre_producto,
        descripcion_producto,
        precio_producto,
        id_categoria_producto,
        calificacion = 0,
        ventas = 0,
      } = req.body;

      // Validaciones adicionales de datos
      console.log("Datos extraídos:", {
        nombre_producto,
        descripcion_producto,
        precio_producto,
        id_categoria_producto,
        calificacion,
        ventas,
      });

      // Validaciones
      if (!nombre_producto || !precio_producto || !id_categoria_producto) {
        return res.status(400).json({
          error: "Faltan campos requeridos",
          recibidos: {
            nombre_producto,
            precio_producto,
            id_categoria_producto,
          },
        });
      }

      // Validar que se haya subido una imagen
      if (!req.file) {
        return res.status(400).json({ message: "La imagen es obligatoria" });
      }

      // Obtener el nombre de la categoría
      const categoria = await categoriaModel.getCategoriaById(
        id_categoria_producto,
      );
      if (!categoria) {
        return res.status(400).json({ message: "Categoría no encontrada" });
      }

      // Crear el producto con el nombre temporal de la imagen
      const productoData = {
        nombre_producto,
        descripcion_producto,
        precio_producto,
        id_categoria_producto,
        imagen_producto: req.file.filename,
        calificacion: parseFloat(calificacion),
        ventas: parseInt(ventas),
      };

      console.log("Nombre del archivo guardado en BD:", req.file.filename);
      console.log("Ruta completa del archivo:", req.file.path);

      console.log("Datos del producto a crear:", productoData);

      // Crear el producto en la base de datos
      const nuevoProductoId = await productoModel.createProducto(productoData);

      // Guardar traducción en inglés si viene en el body
      const { descripcion_en } = req.body;
      if (descripcion_en && descripcion_en.trim() !== "") {
        try {
          await productoTraduccionModel.upsertProductoTraduccion(
            nuevoProductoId,
            "en",
            descripcion_en,
          );
          console.log("Traducción guardada exitosamente");
        } catch (traduccionError) {
          console.error("Error guardando traducción:", traduccionError);
          // No fallar la creación del producto por error en traducción
        }
      }

      // Enviar respuesta exitosa
      res.status(201).json({
        message: "Producto creado exitosamente",
        productoId: nuevoProductoId,
      });
    } catch (error) {
      console.error("Error en createProducto:", error);
      console.error("Stack trace:", error.stack);

      // Limpiar archivo subido en caso de error
      if (req.file && req.file.path) {
        try {
          const fs = await import("fs/promises");
          await fs.unlink(req.file.path);
          console.log("Archivo limpiado después del error:", req.file.path);
        } catch (cleanupError) {
          console.error("Error limpiando archivo:", cleanupError);
        }
      }

      res.status(500).json({
        message: "Error interno del servidor",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Error al crear el producto",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  },

  // Actualizar producto
  updateProducto: async (req, res) => {
    try {
      const {
        nombre_producto,
        descripcion_producto,
        precio_producto,
        id_categoria_producto,
        calificacion,
        ventas,
      } = req.body;

      // Validaciones
      if (!nombre_producto || !precio_producto || !id_categoria_producto) {
        return res.status(400).json({
          error: "Faltan campos requeridos",
        });
      }

      if (isNaN(precio_producto) || precio_producto <= 0) {
        return res.status(400).json({
          error: "El precio debe ser un número positivo",
        });
      }

      const productoData = {
        nombre_producto,
        descripcion_producto,
        precio_producto,
        id_categoria_producto,
        calificacion: calificacion ? parseFloat(calificacion) : undefined,
        ventas: ventas ? parseInt(ventas) : undefined,
      };

      // Si se subió una nueva imagen, actualizar el nombre del archivo
      if (req.file) {
        productoData.imagen_producto = req.file.filename;
      }

      const success = await productoModel.updateProducto(
        req.params.id,
        productoData,
      );

      if (!success) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      // Guardar traducción en inglés si viene en el body
      const { descripcion_en } = req.body;
      if (descripcion_en) {
        await productoTraduccionModel.upsertProductoTraduccion(
          req.params.id,
          "en",
          descripcion_en,
        );
      }

      res.json({ message: "Producto actualizado exitosamente" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Eliminar producto
  deleteProducto: async (req, res) => {
    try {
      const success = await productoModel.deleteProducto(req.params.id);

      if (!success) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      res.json({ message: "Producto eliminado exitosamente" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Obtener productos por categoría
  getProductosByCategoria: async (req, res) => {
    try {
      const productos = await productoModel.getProductosByCategoria(
        req.params.categoriaId,
      );
      res.json(productos);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};
