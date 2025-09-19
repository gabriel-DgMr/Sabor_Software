/**
 * Utilidades para manejo de imágenes
 */

/**
 * Construye la URL completa de una imagen
 * @param {string} imagePath - Ruta de la imagen (ej: "/uploads/productos/imagen.png")
 * @returns {string} URL completa de la imagen
 */
export const getImageUrl = imagePath => {
  if (!imagePath) return '';

  // Si la imagen ya tiene protocolo, devolverla tal como está
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Si la imagen empieza con /, usar la URL base de Railway
  if (imagePath.startsWith('/')) {
    return `https://sabor-production.up.railway.app${imagePath}`;
  }

  // Si no empieza con /, agregar la ruta de uploads
  return `https://sabor-production.up.railway.app/uploads/${imagePath}`;
};

/**
 * Obtiene la URL base de la API
 * @returns {string} URL base de la API
 */
export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || '/api';
};
