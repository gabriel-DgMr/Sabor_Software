/**
 * Utilidades para manejo de imágenes
 */

/**
 * Construye la URL completa de una imagen
 * @param {string} imagePath - Ruta de la imagen (ej: "/uploads/productos/imagen.png")
 * @returns {string} URL completa de la imagen
 */
const stripTrailingSlash = value => value.replace(/\/?$/, '');

const normalizarBaseUrl = rawUrl => {
  if (!rawUrl) return '';

  try {
    // Segundo parámetro asegura compatibilidad con URLs relativas
    const parsed = new URL(
      rawUrl,
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
    );
    if (parsed.pathname.endsWith('/api')) {
      parsed.pathname = parsed.pathname.replace(/\/api\/?$/, '');
    }
    return stripTrailingSlash(`${parsed.origin}${parsed.pathname}`);
  } catch (error) {
    console.warn('🖼️ getImageUrl: URL inválida en configuración', rawUrl, error);
    return rawUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
  }
};

const resolverBaseUrl = () => {
  const envAssetUrl = normalizarBaseUrl(import.meta.env.VITE_ASSETS_BASE_URL);
  if (envAssetUrl) return envAssetUrl;

  const envApiUrl = normalizarBaseUrl(import.meta.env.VITE_API_URL);
  if (envApiUrl) return envApiUrl;

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    const puertoConfigurado = import.meta.env.VITE_BACKEND_PORT;

    if (import.meta.env.DEV) {
      // Cuando se expone el frontend via LAN, usar el hostname actual con el puerto de la API (por defecto 3000)
      const puerto = puertoConfigurado || '3000';
      return `${protocol}//${hostname}:${puerto}`;
    }

    const port = puertoConfigurado || window.location.port;
    return port ? `${protocol}//${hostname}:${port}` : `${protocol}//${hostname}`;
  }

  // Fallback final: dominio público conocido
  return 'https://sabor-production.up.railway.app';
};

export const getImageUrl = imagePath => {
  if (!imagePath) {
    console.log('🖼️ getImageUrl: imagePath vacío');
    return '';
  }

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  const baseUrl = resolverBaseUrl();
  if (!baseUrl) {
    console.warn('🖼️ getImageUrl: baseUrl vacío, devolviendo ruta original');
    return imagePath;
  }

  const rutaNormalizada = imagePath.startsWith('/uploads/')
    ? imagePath
    : imagePath.startsWith('/productos/')
      ? `/uploads${imagePath}`
      : imagePath.startsWith('/')
        ? imagePath
        : `/uploads/${imagePath}`;

  const urlFinal = `${baseUrl}${rutaNormalizada}`;

  console.log('🖼️ getImageUrl:', {
    input: imagePath,
    baseUrl,
    output: urlFinal,
    env: import.meta.env.DEV ? 'development' : 'production',
    viteApiUrl: import.meta.env.VITE_API_URL || 'no definida',
  });

  return urlFinal;
};

/**
 * Obtiene la URL base de la API
 * @returns {string} URL base de la API
 */
export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || '/api';
};
