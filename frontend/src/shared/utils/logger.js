/**
 * Logger seguro para el Frontend de SABOR.
 * Centraliza los logs y redacta automáticamente datos sensibles para evitar filtraciones en la consola.
 */

const CAMPOS_SENSIBLES = [
  'password',
  'contrasena',
  'token',
  'secret',
  'secreto',
  'authorization',
  'auth',
  'cookie',
  'email',
  'correo',
  'telefono',
  'phone',
  'tarjeta',
  'card',
  'cvv',
  'pin',
  'apiKey',
  'api_key',
];

/**
 * Redacta recursivamente datos sensibles en un objeto o valor.
 */
function redactar(data) {
  if (data === null || data === undefined) return data;

  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      return data.map(item => redactar(item));
    }

    const nuevoObjeto = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const keyLower = key.toLowerCase();
        if (CAMPOS_SENSIBLES.some(campo => keyLower.includes(campo))) {
          nuevoObjeto[key] = '[REDACTADO]';
        } else {
          nuevoObjeto[key] = redactar(data[key]);
        }
      }
    }
    return nuevoObjeto;
  }

  return data;
}

const isProduction = import.meta.env.PROD;

const logger = {
  info: (mensaje, metadata) => {
    if (!isProduction) {
      console.log(`[INFO] ${mensaje}`, metadata ? redactar(metadata) : '');
    }
  },
  warn: (mensaje, metadata) => {
    console.warn(`[WARN] ${mensaje}`, metadata ? redactar(metadata) : '');
  },
  error: (mensaje, error, metadata) => {
    console.error(`[ERROR] ${mensaje}`, error, metadata ? redactar(metadata) : '');
  },
  debug: (mensaje, metadata) => {
    if (!isProduction) {
      console.debug(`[DEBUG] ${mensaje}`, metadata ? redactar(metadata) : '');
    }
  },
};

export default logger;
