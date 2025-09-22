import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import fs from "fs/promises";
import { categoriaModel } from "../models/categoriaModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Asegurar que el directorio de uploads exista
const ensureUploadDir = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const uploadPath = path.join(
        __dirname,
        "../../../public/uploads/productos",
      );
      await ensureUploadDir(uploadPath);
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    try {
      // Obtener la extensión del archivo original
      const ext = path.extname(file.originalname);

      // Generar un nombre único con timestamp
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);

      // Obtener nombre del producto (sin consulta async)
      const nombreProducto = req.body.nombre_producto || "producto";

      // Limpiar nombre del producto
      const limpiarNombre = (nombre) => {
        return nombre
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
          .replace(/[^a-z0-9ñ]/g, "") // Mantener solo letras, números y ñ
          .substring(0, 20);
      };

      const productoLimpio = limpiarNombre(nombreProducto);

      // Crear el nombre final del archivo con timestamp para evitar duplicados
      const filename = `${productoLimpio}_${timestamp}_${randomString}${ext}`;

      cb(null, filename);
    } catch (error) {
      console.error("Error en filename multer:", error);
      // Generar nombre de fallback
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      cb(null, `producto_${timestamp}${ext}`);
    }
  },
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten archivos de imagen"), false);
  }
};

// Función para renombrar el archivo después de crear el producto
export const renameProductImage = async (
  tempFilename,
  productId,
  categoriaNombre,
) => {
  try {
    const uploadPath = path.join(
      __dirname,
      "../../../public/uploads/productos",
    );
    const oldPath = path.join(uploadPath, tempFilename);
    const ext = path.extname(tempFilename);
    const newFilename = `Producto_${categoriaNombre}_${productId}${ext}`;
    const newPath = path.join(uploadPath, newFilename);

    // Verificar que el archivo temporal existe
    try {
      await fs.access(oldPath);
    } catch {
      throw new Error("Archivo temporal no encontrado");
    }

    await fs.rename(oldPath, newPath);
    return newFilename;
  } catch (error) {
    console.error("Error al renombrar la imagen:", error);
    throw error;
  }
};

// Configuración de Multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
});
