import * as S from "./services.js";
import fs from "fs/promises";

// ======================= PRODUCTOS CONTROLLERS =======================
export const getAllProductos = async (req, res) => {
  try {
    const filtros = {
      categoria: req.query.categoria || "",
      busqueda: req.query.busqueda || "",
      orden: req.query.orden || "",
      idioma: req.query.lang || "es",
    };
    const productos = await S.getAllProductosService(filtros);
    res.json(productos);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los productos",
      error: error.message,
    });
  }
};

export const getProductoById = async (req, res) => {
  try {
    const idioma = req.query.lang || "es";
    const producto = await S.getProductoByIdService(req.params.id, idioma);
    if (!producto)
      return res.status(404).json({ message: "Producto no encontrado" });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProducto = async (req, res) => {
  try {
    const {
      nombre_producto,
      descripcion_producto,
      precio_producto,
      id_categoria_producto,
      stock,
      calificacion = 0,
      ventas = 0,
      descripcion_en,
    } = req.body;

    if (!nombre_producto || !precio_producto || !id_categoria_producto) {
      return res.status(400).json({
        error: "Faltan campos requeridos",
        recibidos: { nombre_producto, precio_producto, id_categoria_producto },
      });
    }

    if (!req.file)
      return res.status(400).json({ message: "La imagen es obligatoria" });

    // Validar categoría existe
    const categoria = await S.getCategoriaByIdService(
      id_categoria_producto,
      "es",
    );
    if (!categoria)
      return res.status(400).json({ message: "Categoría no encontrada" });

    const precio = parseFloat(
      precio_producto.toString().replace(/\./g, "").replace(",", "."),
    );

    const productoData = {
      nombre_producto,
      descripcion_producto,
      precio_producto: precio,
      id_categoria_producto,
      imagen_producto: req.file.filename,
      calificacion: parseFloat(calificacion),
      ventas: parseInt(ventas),
      stock: stock ? parseInt(stock) : 0,
    };

    const nuevoProductoId = await S.createProductoService(productoData);

    if (descripcion_en && descripcion_en.trim() !== "") {
      try {
        await S.upsertProductoTraduccionService(
          nuevoProductoId,
          "en",
          descripcion_en,
        );
      } catch (e) {
        console.error("Error al guardar traducción en inglés:", e);
      }
    }
    res.status(201).json({
      message: "Producto creado exitosamente",
      productoId: nuevoProductoId,
    });
  } catch (error) {
    console.error("Error en createProducto:", error);
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (e) {}
    }
    res.status(500).json({
      message: "Error interno del servidor",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Error al crear el producto",
    });
  }
};

export const updateProducto = async (req, res) => {
  try {
    const {
      nombre_producto,
      descripcion_producto,
      precio_producto,
      id_categoria_producto,
      calificacion,
      ventas,
      stock,
      descripcion_en,
    } = req.body;

    if (!nombre_producto || !precio_producto || !id_categoria_producto) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    const precio = parseFloat(
      precio_producto.toString().replace(/\./g, "").replace(",", "."),
    );
    if (isNaN(precio) || precio <= 0) {
      return res
        .status(400)
        .json({ error: "El precio debe ser un número positivo" });
    }

    const productoData = {
      nombre_producto,
      descripcion_producto,
      precio_producto: precio,
      id_categoria_producto,
      stock: stock !== undefined ? parseInt(stock) : undefined,
      calificacion:
        calificacion !== undefined ? parseFloat(calificacion) : undefined,
      ventas: ventas !== undefined ? parseInt(ventas) : undefined,
    };

    if (req.file) {
      productoData.imagen_producto = req.file.filename;
    }

    const success = await S.updateProductoService(req.params.id, productoData);
    if (!success)
      return res.status(404).json({ message: "Producto no encontrado" });

    if (descripcion_en) {
      await S.upsertProductoTraduccionService(
        req.params.id,
        "en",
        descripcion_en,
      );
    }
    res.json({ message: "Producto actualizado exitosamente" });
  } catch (error) {
    console.error("Error en updateProducto:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteProducto = async (req, res) => {
  try {
    const success = await S.deleteProductoService(req.params.id);
    if (!success)
      return res.status(404).json({ message: "Producto no encontrado" });
    res.json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductosByCategoria = async (req, res) => {
  try {
    const productos = await S.getProductosByCategoriaService(
      req.params.categoriaId,
    );
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductoTraducciones = async (req, res) => {
  try {
    const traducciones = await S.getProductoTraduccionesService(req.params.id);
    res.json(traducciones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ======================= CATEGORIAS CONTROLLERS =======================
export const getAllCategorias = async (req, res) => {
  try {
    const idioma = req.query.idioma || req.headers["accept-language"] || "es";
    const categorias = await S.getAllCategoriasService(idioma);
    res.json(categorias);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener categorías", message: error.message });
  }
};

export const getCategoriaById = async (req, res) => {
  try {
    const idioma = req.query.idioma || req.headers["accept-language"] || "es";
    const categoria = await S.getCategoriaByIdService(req.params.id, idioma);
    if (!categoria)
      return res.status(404).json({ error: "Categoría no encontrada" });
    res.json(categoria);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener categoría", message: error.message });
  }
};

// ======================= CALIFICACIONES CONTROLLERS =======================
export const crearOActualizarCalificacion = async (req, res) => {
  try {
    const result = await S.crearOActualizarCalificacionService(
      req.user.id,
      req.body.productoId,
      req.body.pedidoId,
      req.body.calificacion,
      req.body.comentario,
    );
    res.status(201).json({
      mensaje: "Calificación guardada exitosamente",
      calificacion: result,
    });
  } catch (error) {
    res
      .status(
        error.message.includes("Faltan") || error.message.includes("estrellas")
          ? 400
          : 500,
      )
      .json({ mensaje: error.message || "Error interno del servidor" });
  }
};

export const obtenerCalificacionesProducto = async (req, res) => {
  try {
    const result = await S.obtenerCalificacionesProductoService(
      req.params.productoId,
      parseInt(req.query.limit) || 10,
      parseInt(req.query.offset) || 0,
    );
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al obtener calificaciones del producto" });
  }
};

export const obtenerProductosParaCalificar = async (req, res) => {
  try {
    const productos = await S.obtenerProductosParaCalificarService(req.user.id);
    res.json({ pedidos: productos, total: productos.length });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al obtener productos para calificar" });
  }
};

export const obtenerProductosParaCalificarPorPedido = async (req, res) => {
  try {
    if (!req.params.pedidoId)
      return res
        .status(400)
        .json({ mensaje: "El parámetro pedidoId es requerido" });
    const productos = await S.obtenerProductosParaCalificarPorPedidoService(
      req.user.id,
      req.params.pedidoId,
    );
    res.json({
      pedidoId: req.params.pedidoId,
      productos,
      total: productos.length,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener productos para calificar por pedido",
    });
  }
};

export const obtenerCalificacionUsuario = async (req, res) => {
  try {
    const calificacion = await S.obtenerCalificacionUsuarioService(
      req.user.id,
      req.params.productoId,
      req.params.pedidoId,
    );
    if (!calificacion)
      return res.status(404).json({
        mensaje: "No se encontró calificación para este producto y pedido",
      });
    res.json(calificacion);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al obtener calificación del usuario" });
  }
};

export const eliminarCalificacion = async (req, res) => {
  try {
    const result = await S.eliminarCalificacionService(
      req.user.id,
      req.params.calificacionId,
    );
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: error.message || "Error al eliminar calificación" });
  }
};
