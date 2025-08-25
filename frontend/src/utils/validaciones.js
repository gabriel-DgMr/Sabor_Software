export const validarCaracteresEspeciales = (valor, campo) => {
  const caracteresProhibidos = /[<>"'/\\(){}[\]=;:%&]/;
  if (caracteresProhibidos.test(valor)) {
    return `El campo ${campo} no puede contener caracteres especiales como < > " ' / \\ ( ) { } [ ] = ; : % &`;
  }
  return null;
};

export const validarLongitud = (valor, campo, minLength, maxLength) => {
  if (valor.length < minLength) {
    return `El campo ${campo} debe tener al menos ${minLength} caracteres`;
  }
  if (valor.length > maxLength) {
    return `El campo ${campo} no puede tener más de ${maxLength} caracteres`;
  }
  return null;
};

export const validarEspaciosEnBlanco = (valor, campo) => {
  if (/\s/.test(valor)) {
    return `El campo ${campo} no puede contener espacios en blanco`;
  }
  return null;
};

export const validarEspaciosInicioFinal = (valor, campo) => {
  if (valor !== valor.trim()) {
    return `El campo ${campo} no puede tener espacios al inicio ni al final`;
  }
  return null;
};

export const validarEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'El formato del email no es válido';
  }

  if (email !== email.trim()) {
    return 'El email no puede tener espacios al inicio ni al final';
  }

  if (/\s/.test(email)) {
    return 'El email no puede contener espacios en blanco';
  }

  const dominiosTemporales = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com'];
  const dominio = email.split('@')[1];
  if (dominiosTemporales.includes(dominio)) {
    return 'No se permiten correos temporales';
  }

  return null;
};

export const validarTelefono = telefono => {
  const telefonoRegex = /^\d{10}$/;
  if (!telefonoRegex.test(telefono)) {
    return 'El teléfono debe tener exactamente 10 dígitos numéricos';
  }

  if (telefono !== telefono.trim()) {
    return 'El teléfono no puede tener espacios al inicio ni al final';
  }

  if (/\s/.test(telefono)) {
    return 'El teléfono no puede contener espacios en blanco';
  }

  return null;
};

export const validarContraseña = contraseña => {
  if (contraseña.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres';
  }

  if (contraseña !== contraseña.trim()) {
    return 'La contraseña no puede tener espacios al inicio ni al final';
  }

  if (/\s/.test(contraseña)) {
    return 'La contraseña no puede contener espacios en blanco';
  }

  if (!/(?=.*[a-z])/.test(contraseña)) {
    return 'La contraseña debe contener al menos una letra minúscula';
  }

  if (!/(?=.*[A-Z])/.test(contraseña)) {
    return 'La contraseña debe contener al menos una letra mayúscula';
  }

  if (!/(?=.*\d)/.test(contraseña)) {
    return 'La contraseña debe contener al menos un número';
  }

  if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(contraseña)) {
    return 'La contraseña debe contener al menos un símbolo especial';
  }

  return null;
};

export const validarPrecio = precio => {
  const precioNum = parseFloat(precio);
  if (isNaN(precioNum) || precioNum < 0 || precioNum > 999999.99) {
    return 'El precio debe ser un número válido entre 0 y 999999.99';
  }
  return null;
};

export const validarFecha = fecha => {
  const fechaObj = new Date(fecha);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (fechaObj < hoy) {
    return 'La fecha no puede ser anterior a hoy';
  }

  return null;
};

export const validarHora = hora => {
  const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!horaRegex.test(hora)) {
    return 'El formato de hora debe ser HH:MM';
  }
  return null;
};

export const validarNumeroPersonas = numero => {
  const num = parseInt(numero);
  if (isNaN(num) || num < 1 || num > 8) {
    return 'El número de personas debe estar entre 1 y 8';
  }
  return null;
};

export const validarImagen = archivo => {
  if (!archivo) {
    return 'Debe seleccionar una imagen';
  }

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

export const validarCampoRequerido = (valor, campo) => {
  if (!valor || valor.trim() === '') {
    return `El campo ${campo} es obligatorio`;
  }
  return null;
};

export const validarEspacios = (valor, campo) => {
  if (valor !== valor.trim()) {
    return `No se permiten espacios al inicio ni al final del campo ${campo}`;
  }
  if (/\s{2,}/.test(valor)) {
    return `No se permiten espacios dobles o múltiples en el campo ${campo}`;
  }
  return null;
};

export const validarRegistro = datos => {
  const errores = {};

  const camposRequeridos = [
    'nombre_usuario',
    'correo_usuario',
    'telefono_usuario',
    'contraseña_usuario',
  ];
  camposRequeridos.forEach(campo => {
    const error = validarCampoRequerido(datos[campo], campo.replace('_usuario', ''));
    if (error) errores[campo] = error;
  });

  if (Object.keys(errores).length > 0) return errores;

  const longitudError = validarLongitud(datos.nombre_usuario, 'nombre', 2, 50);
  if (longitudError) errores.nombre_usuario = longitudError;

  const emailLongitudError = validarLongitud(datos.correo_usuario, 'email', 5, 100);
  if (emailLongitudError) errores.correo_usuario = emailLongitudError;

  const emailError = validarEmail(datos.correo_usuario);
  if (emailError) errores.correo_usuario = emailError;

  const telefonoError = validarTelefono(datos.telefono_usuario);
  if (telefonoError) errores.telefono_usuario = telefonoError;

  const contraseñaError = validarContraseña(datos.contraseña_usuario);
  if (contraseñaError) errores.contraseña_usuario = contraseñaError;

  // Validación de espacios personalizada
  const caracteresErrorNombre = validarCaracteresEspeciales(datos.nombre_usuario, 'nombre');
  if (caracteresErrorNombre) errores.nombre_usuario = caracteresErrorNombre;
  const espaciosErrorNombre = validarEspacios(datos.nombre_usuario, 'nombre');
  if (espaciosErrorNombre) errores.nombre_usuario = espaciosErrorNombre;

  ['correo_usuario', 'telefono_usuario', 'contraseña_usuario'].forEach(campo => {
    const nombreCampo = campo.replace('_usuario', '');
    const caracteresError = validarCaracteresEspeciales(datos[campo], nombreCampo);
    if (caracteresError) errores[campo] = caracteresError;
    const espaciosError = validarEspaciosEnBlanco(datos[campo], nombreCampo);
    if (espaciosError) errores[campo] = espaciosError;
  });

  return errores;
};

export const validarLogin = datos => {
  const errores = {};

  if (!datos.correo_usuario) {
    errores.correo_usuario = 'El email es obligatorio';
  }
  if (!datos.contraseña_usuario) {
    errores.contraseña_usuario = 'La contraseña es obligatoria';
  }
  if (Object.keys(errores).length > 0) {
    return errores;
  }

  const emailError = validarEmail(datos.correo_usuario);
  if (emailError) errores.correo_usuario = emailError;

  if (datos.contraseña_usuario.length === 0) {
    errores.contraseña_usuario = 'La contraseña no puede estar vacía';
  }

  return errores;
};

export const validarProducto = datos => {
  const errores = {};

  const camposRequeridos = [
    'nombre_producto',
    'descripcion_producto',
    'precio_producto',
    'id_categoria_producto',
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

export const validarUrlSegura = url => {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.protocol === 'https:' ||
      (urlObj.protocol === 'http:' && urlObj.hostname === 'localhost')
    );
  } catch {
    return false;
  }
};
