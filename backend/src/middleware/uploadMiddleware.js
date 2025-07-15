import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

// Tipos de archivo permitidos
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
];

// Tamaño máximo de archivo (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Función para generar nombre de archivo seguro
const generateSafeFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalName).toLowerCase();
  return `${timestamp}_${randomString}${extension}`;
};

// Función para validar tipo de archivo
const validateFileType = (mimetype) => {
  return ALLOWED_MIME_TYPES.includes(mimetype);
};

// Función para validar tamaño de archivo
const validateFileSize = (size) => {
  return size <= MAX_FILE_SIZE;
};

export const processImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    // Validar tipo de archivo
    if (!validateFileType(req.file.mimetype)) {
      // Eliminar archivo subido
      await fs.unlink(req.file.path);
      return res.status(400).json({
        message: `Tipo de archivo no permitido. Tipos permitidos: ${ALLOWED_MIME_TYPES.join(', ')}`
      });
    }

    // Validar tamaño de archivo
    if (!validateFileSize(req.file.size)) {
      // Eliminar archivo subido
      await fs.unlink(req.file.path);
      return res.status(400).json({
        message: `El archivo es demasiado grande. Tamaño máximo: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      });
    }

    // Validar que el archivo sea realmente una imagen
    try {
      const metadata = await sharp(req.file.path).metadata();
      if (!metadata.width || !metadata.height) {
        throw new Error('Archivo no es una imagen válida');
      }
    } catch (error) {
      // Eliminar archivo subido
      await fs.unlink(req.file.path);
      return res.status(400).json({
        message: 'El archivo no es una imagen válida'
      });
    }

    const filePath = req.file.path;
    const originalFileName = path.basename(filePath);
    const safeFileName = generateSafeFileName(originalFileName);
    const tempFilePath = path.join(path.dirname(filePath), `temp_${safeFileName}`);
    const finalFilePath = path.join(path.dirname(filePath), safeFileName);

    console.log('Procesando imagen:', {
      originalName: originalFileName,
      safeName: safeFileName,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Procesar imagen y guardar en archivo temporal
    await sharp(filePath)
      .resize(800, 800, { // Redimensionar a 800x800
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ 
        quality: 80, // Calidad 80%
        progressive: true, // JPEG progresivo
        mozjpeg: true // Optimización MozJPEG
      })
      .toFile(tempFilePath);

    // Eliminar el archivo original
    await fs.unlink(filePath);

    // Renombrar el archivo temporal al nombre final seguro
    await fs.rename(tempFilePath, finalFilePath);

    // Actualizar la información del archivo en req.file
    req.file.filename = safeFileName;
    req.file.path = finalFilePath;
    req.file.originalname = originalFileName;

    console.log('Imagen procesada exitosamente:', safeFileName);

    next();
  } catch (error) {
    console.error('Error procesando imagen:', error);
        
    // Intentar limpiar archivos en caso de error
    try {
      if (req.file && req.file.path) {
        await fs.unlink(req.file.path);
      }
    } catch (cleanupError) {
      console.error('Error limpiando archivo:', cleanupError);
    }

    return res.status(500).json({
      message: 'Error procesando la imagen'
    });
  }
};

// Middleware para validar múltiples archivos
export const processMultipleImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    const processedFiles = [];
    const errors = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
            
      try {
        // Validar tipo de archivo
        if (!validateFileType(file.mimetype)) {
          errors.push(`Archivo ${i + 1}: Tipo no permitido`);
          await fs.unlink(file.path);
          continue;
        }

        // Validar tamaño de archivo
        if (!validateFileSize(file.size)) {
          errors.push(`Archivo ${i + 1}: Tamaño excede el límite`);
          await fs.unlink(file.path);
          continue;
        }

        // Procesar imagen individual
        const filePath = file.path;
        const originalFileName = path.basename(filePath);
        const safeFileName = generateSafeFileName(originalFileName);
        const tempFilePath = path.join(path.dirname(filePath), `temp_${safeFileName}`);
        const finalFilePath = path.join(path.dirname(filePath), safeFileName);

        await sharp(filePath)
          .resize(800, 800, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ 
            quality: 80,
            progressive: true,
            mozjpeg: true
          })
          .toFile(tempFilePath);

        await fs.unlink(filePath);
        await fs.rename(tempFilePath, finalFilePath);

        // Actualizar información del archivo
        file.filename = safeFileName;
        file.path = finalFilePath;
        file.originalname = originalFileName;

        processedFiles.push(file);
      } catch (error) {
        errors.push(`Archivo ${i + 1}: Error de procesamiento`);
        try {
          await fs.unlink(file.path);
        } catch (cleanupError) {
          console.error('Error limpiando archivo:', cleanupError);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Algunos archivos no pudieron ser procesados',
        errors: errors
      });
    }

    req.files = processedFiles;
    next();
  } catch (error) {
    console.error('Error procesando múltiples imágenes:', error);
    return res.status(500).json({
      message: 'Error procesando las imágenes'
    });
  }
};

// Middleware para limpiar archivos en caso de error
export const cleanupFiles = async (req, res, next) => {
  res.on('finish', async () => {
    if (res.statusCode >= 400 && req.file) {
      try {
        await fs.unlink(req.file.path);
        console.log('Archivo limpiado debido a error:', req.file.path);
      } catch (error) {
        console.error('Error limpiando archivo:', error);
      }
    }
  });

  next();
};

// Función para eliminar archivo
export const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    console.log('Archivo eliminado:', filePath);
    return true;
  } catch (error) {
    console.error('Error eliminando archivo:', error);
    return false;
  }
};
