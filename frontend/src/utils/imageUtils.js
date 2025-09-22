/**
 * Utilidades para manejo de imágenes
 */

/**
 * Construye la URL completa de una imagen
 * @param {string} imagePath - Ruta de la imagen (ej: "/uploads/productos/imagen.png")
 * @returns {string} URL completa de la imagen
 */
export const getImageUrl = imagePath => {
  if (!imagePath) {
    console.log('🖼️ getImageUrl: imagePath vacío');
    return '';
  }

  // Si la imagen ya tiene protocolo, devolverla tal como está
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('🖼️ getImageUrl: URL completa detectada:', imagePath);
    return imagePath;
  }

  // Obtener la URL base según el entorno
  const getBaseUrl = () => {
    // Usar variable de entorno si está disponible
    if (import.meta.env.VITE_API_URL) {
      // Remover '/api' del final si está presente para obtener la URL base
      return import.meta.env.VITE_API_URL.replace('/api', '');
    }

    // En desarrollo, usar localhost
    if (import.meta.env.DEV) {
      return 'http://localhost:3000';
    }

    // En producción, usar Railway como fallback
    return 'https://sabor-production.up.railway.app';
  };

  const baseUrl = getBaseUrl();

  let finalUrl;
  // Si la imagen empieza con /, usar la URL base directamente
  if (imagePath.startsWith('/')) {
    finalUrl = `${baseUrl}${imagePath}`;
  } else {
    // Si no empieza con /, agregar la ruta de uploads
    finalUrl = `${baseUrl}/uploads/${imagePath}`;
  }

  console.log('🖼️ getImageUrl:', {
    input: imagePath,
    baseUrl,
    output: finalUrl,
    env: import.meta.env.DEV ? 'development' : 'production',
    viteApiUrl: import.meta.env.VITE_API_URL || 'no definida',
  });

  return finalUrl;
};

/**
 * Obtiene la URL base de la API
 * @returns {string} URL base de la API
 */
export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || '/api';
};
