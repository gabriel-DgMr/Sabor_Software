export function FormatPriceCOP(precio) {
  const num = typeof precio === 'number' ? precio : Number(precio);
  if (isNaN(num)) return '';
  return num.toLocaleString('es-CO');
}

/**
 * Formatea una fecha ISO a un formato legible por el usuario.
 * @param {string|Date} dateStr - La fecha a formatear.
 * @param {Object} options - Opciones de Intl.DateTimeFormat.
 * @returns {string} Fecha formateada.
 */
export function formatearFecha(dateStr, options = {}) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';

    const defaultOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    };

    return date.toLocaleDateString('es-CO', { ...defaultOptions, ...options });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return '';
  }
}

/**
 * Formatea una fecha con hora.
 */
export function formatearFechaHora(dateStr) {
  return formatearFecha(dateStr, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formatea una fecha en formato numérico corto (DD/MM/YYYY).
 */
export function formatearFechaCorta(dateStr) {
  return formatearFecha(dateStr, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formatea solo la hora de una fecha.
 */
export function formatearHora(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';

    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error al formatear hora:', error);
    return '';
  }
}
