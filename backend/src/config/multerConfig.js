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

// Configuración de almacenamiento para productos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const uploadPath = path.join(__dirname, "../../public/uploads/productos");
      await ensureUploadDir(uploadPath);
      cb(null, uploadPath);
    } catch (error) {
      console.error("Error creando directorio de uploads:", error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    try {
      // Generar nombre único temporal - será renombrado después por uploadMiddleware
      const timestamp = Date.now();
      const randomString = Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      const filename = `temp_product_${timestamp}_${randomString}${ext}`;

      console.log("Nombre temporal generado:", filename);
      cb(null, filename);
    } catch (error) {
      console.error("Error generando nombre de archivo:", error);
      cb(error);
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
  nombreProducto,
) => {
  try {
    const uploadPath = path.join(__dirname, "../../public/uploads/productos");
    const oldPath = path.join(uploadPath, tempFilename);
    const ext = path.extname(tempFilename);

    // Limpiar nombres para el archivo final
    const limpiarNombre = (nombre) => {
      return nombre
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
        .replace(/[^a-z0-9ñ]/g, "") // Mantener solo letras, números y ñ
        .substring(0, 20);
    };

    const productoLimpio = limpiarNombre(nombreProducto || "producto");
    const categoriaLimpia = limpiarNombre(categoriaNombre || "categoria");

    const newFilename = `${productoLimpio}_${categoriaLimpia}_${productId}${ext}`;
    const newPath = path.join(uploadPath, newFilename);

    console.log("Renombrando archivo:", { tempFilename, newFilename });

    // Verificar que el archivo temporal existe
    try {
      await fs.access(oldPath);
    } catch {
      throw new Error(`Archivo temporal no encontrado: ${tempFilename}`);
    }

    // Verificar que el archivo de destino no existe
    try {
      await fs.access(newPath);
      console.log("Archivo de destino ya existe, eliminando:", newPath);
      await fs.unlink(newPath);
    } catch {
      // El archivo no existe, continuar
    }

    await fs.rename(oldPath, newPath);
    console.log("Archivo renombrado exitosamente:", newFilename);
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
