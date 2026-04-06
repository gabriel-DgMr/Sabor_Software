import {
  validarCampoRequerido,
  validarLongitud,
  validarPrecio,
  validarCaracteresEspeciales,
  validarEspaciosInicioFinal,
} from '../../../shared/utils/validaciones';

/**
 * Valida los datos de un producto.
 */
export const validarProducto = datos => {
  const errores = {};

  const camposRequeridos = [
    'nombre_producto',
    'descripcion_producto',
    'precio_producto',
    'id_categoria_producto',
    'stock',
  ];

  camposRequeridos.forEach(campo => {
    const error = validarCampoRequerido(datos[campo], campo.replace('_producto', ''));
    if (error) errores[campo] = error;
  });

  if (Object.keys(errores).length > 0) return errores;

  const nombreError = validarLongitud(datos.nombre_producto, 'nombre del producto', 2, 100);
  if (nombreError) errores.nombre_producto = nombreError;

  const descripcionError = validarLongitud(datos.descripcion_producto, 'descripción', 10, 500);
  if (descripcionError) errores.descripcion_producto = descripcionError;

  const precioError = validarPrecio(datos.precio_producto);
  if (precioError) errores.precio_producto = precioError;

  const stockNumero = parseInt(datos.stock, 10);
  if (isNaN(stockNumero) || stockNumero < 0) {
    errores.stock = 'El stock debe ser un número entero mayor o igual a 0';
  }

  const caracteresError = validarCaracteresEspeciales(datos.nombre_producto, 'nombre del producto');
  if (caracteresError) errores.nombre_producto = caracteresError;

  const descripcionCaracteresError = validarCaracteresEspeciales(
    datos.descripcion_producto,
    'descripción'
  );
  if (descripcionCaracteresError) errores.descripcion_producto = descripcionCaracteresError;

  const camposTexto = ['nombre_producto', 'descripcion_producto'];
  camposTexto.forEach(campo => {
    const valor = datos[campo];
    const nombreCampo = campo.replace('_producto', '');
    const espaciosError = validarEspaciosInicioFinal(valor, nombreCampo);
    if (espaciosError) errores[campo] = espaciosError;
  });

  return errores;
};

/**
 * Valida un archivo de imagen.
 */
export const validarImagen = archivo => {
  if (!archivo) return 'Debe seleccionar una imagen';

  const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!tiposPermitidos.includes(archivo.type)) {
    return 'Solo se permiten archivos de imagen (JPEG, PNG, WebP)';
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (archivo.size > maxSize) {
    return 'El archivo es demasiado grande. Tamaño máximo: 5MB';
  }

  return null;
};
