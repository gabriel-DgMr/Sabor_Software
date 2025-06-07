import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export const processImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        const filePath = req.file.path;
        const fileName = path.basename(filePath);
        const tempFilePath = path.join(path.dirname(filePath), `temp_${fileName}`);

        console.log('Nombre original del archivo:', fileName);
        console.log('Ruta procesada del archivo:', tempFilePath);

        // Procesar imagen y guardar en archivo temporal
        await sharp(filePath)
            .resize(800, 800, { // Redimensionar a 800x800
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 80 }) // Convertir a JPEG con calidad 80%
            .toFile(tempFilePath);

        // Eliminar el archivo original
        await fs.unlink(filePath);

        // Renombrar el archivo temporal al nombre original
        await fs.rename(tempFilePath, filePath);

        // Actualizar la ruta del archivo en req.file
        req.file.filename = fileName;
        req.file.path = filePath;

        next();
    } catch (error) {
        next(error);
    }
};
