import validator from 'validator';

// Función auxiliar para validar caracteres especiales
const validateSpecialCharacters = (value, fieldName) => {
  const caracteresProhibidos = /[<>"'/\\(){}[\]=;:%&]/;
  if (caracteresProhibidos.test(value)) {
    return `El campo ${fieldName} no puede contener caracteres especiales como < > " ' / \\ ( ) { } [ ] = ; : % &`;
  }
  return null;
};

// Función auxiliar para validar espacios
const validateSpaces = (value, fieldName) => {
  if (value !== value.trim()) {
    return `No se permiten espacios al inicio ni al final del campo ${fieldName}`;
  }
  if (/\s{2,}/.test(value)) {
    return `No se permiten espacios dobles o múltiples en el campo ${fieldName}`;
  }
  return null;
};

// Función auxiliar para validar espacios en blanco
const validateNoWhitespace = (value, fieldName) => {
  if (/\s/.test(value)) {
    return `El campo ${fieldName} no puede contener espacios en blanco`;
  }
  return null;
};

// Función auxiliar para validar espacios al inicio y final
const validateNoLeadingTrailingSpaces = (value, fieldName) => {
  if (value !== value.trim()) {
    return `El campo ${fieldName} no puede tener espacios al inicio ni al final`;
  }
  return null;
};

// Función auxiliar para validar longitud
const validateLength = (value, fieldName, minLength, maxLength) => {
  if (value.length < minLength) {
    return `El campo ${fieldName} debe tener al menos ${minLength} caracteres`;
  }
  if (value.length > maxLength) {
    return `El campo ${fieldName} no puede tener más de ${maxLength} caracteres`;
  }
  return null;
};

// Función auxiliar para validar email con regex mejorada
const validateEmailFormat = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRegister = (req, res, next) => {
  const { nombre_cliente, email_cliente, telefono_cliente, contraseña_cliente } = req.body;

  // Validar campos requeridos
  if (!nombre_cliente || !email_cliente || !telefono_cliente || !contraseña_cliente) {
    return res.status(400).json({
      message: 'Todos los campos son obligatorios'
    });
  }

  // Validar longitud de campos
  const lengthErrors = [];
  const nombreError = validateLength(nombre_cliente, 'nombre', 2, 50);
  if (nombreError) lengthErrors.push(nombreError);
    
  const emailError = validateLength(email_cliente, 'email', 5, 100);
  if (emailError) lengthErrors.push(emailError);

  if (lengthErrors.length > 0) {
    return res.status(400).json({
      message: lengthErrors.join(', ')
    });
  }

  // Validar email con regex mejorada
  if (!validateEmailFormat(email_cliente)) {
    return res.status(400).json({
      message: 'El formato del email no es válido'
    });
  }

  // Validar que el email no tenga espacios en blanco
  const emailWhitespaceError = validateNoWhitespace(email_cliente, 'email');
  if (emailWhitespaceError) {
    return res.status(400).json({
      message: emailWhitespaceError
    });
  }

  // Validar que el email no tenga espacios al inicio ni al final
  const emailLeadingTrailingError = validateNoLeadingTrailingSpaces(email_cliente, 'email');
  if (emailLeadingTrailingError) {
    return res.status(400).json({
      message: emailLeadingTrailingError
    });
  }

  // Validar que el email no sea un email temporal
  const disposableEmailDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com'];
  const emailDomain = email_cliente.split('@')[1];
  if (disposableEmailDomains.includes(emailDomain)) {
    return res.status(400).json({
      message: 'No se permiten correos temporales'
    });
  }

  // Validar teléfono
  if (!validator.matches(telefono_cliente, /^\d{10}$/)) {
    return res.status(400).json({
      message: 'El teléfono debe tener exactamente 10 dígitos numéricos'
    });
  }

  // Validar que el teléfono no tenga espacios en blanco
  const telefonoWhitespaceError = validateNoWhitespace(telefono_cliente, 'teléfono');
  if (telefonoWhitespaceError) {
    return res.status(400).json({
      message: telefonoWhitespaceError
    });
  }

  // Validar que el teléfono no tenga espacios al inicio ni al final
  const telefonoLeadingTrailingError = validateNoLeadingTrailingSpaces(telefono_cliente, 'teléfono');
  if (telefonoLeadingTrailingError) {
    return res.status(400).json({
      message: telefonoLeadingTrailingError
    });
  }

  // Validar contraseña
  if (!validator.isStrongPassword(contraseña_cliente, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  })) {
    return res.status(400).json({
      message: 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos'
    });
  }

  // Validar que la contraseña no tenga espacios en blanco
  const contraseñaWhitespaceError = validateNoWhitespace(contraseña_cliente, 'contraseña');
  if (contraseñaWhitespaceError) {
    return res.status(400).json({
      message: contraseñaWhitespaceError
    });
  }

  // Validar que la contraseña no tenga espacios al inicio ni al final
  const contraseñaLeadingTrailingError = validateNoLeadingTrailingSpaces(contraseña_cliente, 'contraseña');
  if (contraseñaLeadingTrailingError) {
    return res.status(400).json({
      message: contraseñaLeadingTrailingError
    });
  }

  // Validar caracteres especiales y espacios para todos los campos
  const validationErrors = [];
    
  const nombreSpecialError = validateSpecialCharacters(nombre_cliente, 'nombre');
  if (nombreSpecialError) validationErrors.push(nombreSpecialError);
    
  const nombreSpaceError = validateSpaces(nombre_cliente, 'nombre');
  if (nombreSpaceError) validationErrors.push(nombreSpaceError);

  const emailSpecialError = validateSpecialCharacters(email_cliente, 'email');
  if (emailSpecialError) validationErrors.push(emailSpecialError);
    
  const emailSpaceError = validateSpaces(email_cliente, 'email');
  if (emailSpaceError) validationErrors.push(emailSpaceError);

  const telefonoSpecialError = validateSpecialCharacters(telefono_cliente, 'teléfono');
  if (telefonoSpecialError) validationErrors.push(telefonoSpecialError);
    
  const telefonoSpaceError = validateSpaces(telefono_cliente, 'teléfono');
  if (telefonoSpaceError) validationErrors.push(telefonoSpaceError);

  const contraseñaSpecialError = validateSpecialCharacters(contraseña_cliente, 'contraseña');
  if (contraseñaSpecialError) validationErrors.push(contraseñaSpecialError);
    
  const contraseñaSpaceError = validateSpaces(contraseña_cliente, 'contraseña');
  if (contraseñaSpaceError) validationErrors.push(contraseñaSpaceError);

  if (validationErrors.length > 0) {
    return res.status(400).json({
      message: validationErrors.join(', ')
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email_cliente, contraseña_cliente } = req.body;

  if (!email_cliente || !contraseña_cliente) {
    return res.status(400).json({
      message: 'Email y contraseña son requeridos'
    });
  }

  // Validar longitud de email
  if (email_cliente.length < 5 || email_cliente.length > 100) {
    return res.status(400).json({
      message: 'El email debe tener entre 5 y 100 caracteres'
    });
  }

  // Validar email con regex mejorada
  if (!validateEmailFormat(email_cliente)) {
    return res.status(400).json({
      message: 'El formato del email no es válido'
    });
  }

  // Validar que el email no tenga espacios en blanco
  const emailWhitespaceError = validateNoWhitespace(email_cliente, 'email');
  if (emailWhitespaceError) {
    return res.status(400).json({
      message: emailWhitespaceError
    });
  }

  // Validar que el email no tenga espacios al inicio ni al final
  const emailLeadingTrailingError = validateNoLeadingTrailingSpaces(email_cliente, 'email');
  if (emailLeadingTrailingError) {
    return res.status(400).json({
      message: emailLeadingTrailingError
    });
  }

  // Validar que la contraseña no esté vacía
  if (contraseña_cliente.length === 0) {
    return res.status(400).json({
      message: 'La contraseña no puede estar vacía'
    });
  }

  // Validar que la contraseña no tenga espacios en blanco
  const contraseñaWhitespaceError = validateNoWhitespace(contraseña_cliente, 'contraseña');
  if (contraseñaWhitespaceError) {
    return res.status(400).json({
      message: contraseñaWhitespaceError
    });
  }

  // Validar que la contraseña no tenga espacios al inicio ni al final
  const contraseñaLeadingTrailingError = validateNoLeadingTrailingSpaces(contraseña_cliente, 'contraseña');
  if (contraseñaLeadingTrailingError) {
    return res.status(400).json({
      message: contraseñaLeadingTrailingError
    });
  }

  next();
};

// Validación para actualización de clientes
export const validateUpdateCliente = (req, res, next) => {
  const { nombre_cliente, email_cliente, telefono_cliente } = req.body;

  // Validar campos requeridos
  if (!nombre_cliente || !email_cliente || !telefono_cliente) {
    return res.status(400).json({
      message: 'Todos los campos son obligatorios'
    });
  }

  // Validar longitud de campos
  const lengthErrors = [];
  const nombreError = validateLength(nombre_cliente, 'nombre', 2, 50);
  if (nombreError) lengthErrors.push(nombreError);
    
  const emailError = validateLength(email_cliente, 'email', 5, 100);
  if (emailError) lengthErrors.push(emailError);

  if (lengthErrors.length > 0) {
    return res.status(400).json({
      message: lengthErrors.join(', ')
    });
  }

  // Validar email con regex mejorada
  if (!validateEmailFormat(email_cliente)) {
    return res.status(400).json({
      message: 'El formato del email no es válido'
    });
  }

  // Validar que el email no tenga espacios en blanco
  const emailWhitespaceError = validateNoWhitespace(email_cliente, 'email');
  if (emailWhitespaceError) {
    return res.status(400).json({
      message: emailWhitespaceError
    });
  }

  // Validar que el email no tenga espacios al inicio ni al final
  const emailLeadingTrailingError = validateNoLeadingTrailingSpaces(email_cliente, 'email');
  if (emailLeadingTrailingError) {
    return res.status(400).json({
      message: emailLeadingTrailingError
    });
  }

  // Validar que el email no sea un email temporal
  const disposableEmailDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com'];
  const emailDomain = email_cliente.split('@')[1];
  if (disposableEmailDomains.includes(emailDomain)) {
    return res.status(400).json({
      message: 'No se permiten correos temporales'
    });
  }

  // Validar teléfono
  if (!validator.matches(telefono_cliente, /^\d{10}$/)) {
    return res.status(400).json({
      message: 'El teléfono debe tener exactamente 10 dígitos numéricos'
    });
  }

  // Validar que el teléfono no tenga espacios en blanco
  const telefonoWhitespaceError = validateNoWhitespace(telefono_cliente, 'teléfono');
  if (telefonoWhitespaceError) {
    return res.status(400).json({
      message: telefonoWhitespaceError
    });
  }

  // Validar que el teléfono no tenga espacios al inicio ni al final
  const telefonoLeadingTrailingError = validateNoLeadingTrailingSpaces(telefono_cliente, 'teléfono');
  if (telefonoLeadingTrailingError) {
    return res.status(400).json({
      message: telefonoLeadingTrailingError
    });
  }

  // Validar caracteres especiales y espacios para todos los campos
  const validationErrors = [];
    
  const nombreSpecialError = validateSpecialCharacters(nombre_cliente, 'nombre');
  if (nombreSpecialError) validationErrors.push(nombreSpecialError);
    
  const nombreSpaceError = validateSpaces(nombre_cliente, 'nombre');
  if (nombreSpaceError) validationErrors.push(nombreSpaceError);

  const emailSpecialError = validateSpecialCharacters(email_cliente, 'email');
  if (emailSpecialError) validationErrors.push(emailSpecialError);
    
  const emailSpaceError = validateSpaces(email_cliente, 'email');
  if (emailSpaceError) validationErrors.push(emailSpaceError);

  const telefonoSpecialError = validateSpecialCharacters(telefono_cliente, 'teléfono');
  if (telefonoSpecialError) validationErrors.push(telefonoSpecialError);
    
  const telefonoSpaceError = validateSpaces(telefono_cliente, 'teléfono');
  if (telefonoSpaceError) validationErrors.push(telefonoSpaceError);

  if (validationErrors.length > 0) {
    return res.status(400).json({
      message: validationErrors.join(', ')
    });
  }

  next();
};

// Nueva validación para productos
export const validateProducto = (req, res, next) => {
  const { nombre_producto, descripcion_producto, precio_producto, id_categoria_producto } = req.body;

  // Validar campos requeridos
  if (!nombre_producto || !descripcion_producto || !precio_producto || !id_categoria_producto) {
    return res.status(400).json({
      message: 'Todos los campos son obligatorios'
    });
  }

  // Validar longitud de campos
  if (nombre_producto.length < 2 || nombre_producto.length > 100) {
    return res.status(400).json({
      message: 'El nombre del producto debe tener entre 2 y 100 caracteres'
    });
  }

  if (descripcion_producto.length < 10 || descripcion_producto.length > 500) {
    return res.status(400).json({
      message: 'La descripción debe tener entre 10 y 500 caracteres'
    });
  }

  // Validar precio
  const precio = parseFloat(precio_producto);
  if (isNaN(precio) || precio < 0 || precio > 999999.99) {
    return res.status(400).json({
      message: 'El precio debe ser un número válido entre 0 y 999999.99'
    });
  }

  // Validar ID de categoría
  if (!validator.isInt(id_categoria_producto, { min: 1 })) {
    return res.status(400).json({
      message: 'El ID de categoría debe ser un número entero positivo'
    });
  }

  // Validar caracteres especiales y espacios
  const validationErrors = [];
    
  const nombreError = validateSpecialCharacters(nombre_producto, 'nombre del producto');
  if (nombreError) validationErrors.push(nombreError);
    
  const descripcionError = validateSpecialCharacters(descripcion_producto, 'descripción');
  if (descripcionError) validationErrors.push(descripcionError);

  // Validar espacios al inicio y final para campos de texto
  const nombreSpaceError = validateNoLeadingTrailingSpaces(nombre_producto, 'nombre del producto');
  if (nombreSpaceError) validationErrors.push(nombreSpaceError);
    
  const descripcionSpaceError = validateNoLeadingTrailingSpaces(descripcion_producto, 'descripción');
  if (descripcionSpaceError) validationErrors.push(descripcionSpaceError);

  if (validationErrors.length > 0) {
    return res.status(400).json({
      message: validationErrors.join(', ')
    });
  }

  next();
};

// Validación para reservas
export const validateReserva = (req, res, next) => {
  const { fecha_reserva, hora_reserva, numero_personas, id_cliente } = req.body;

  if (!fecha_reserva || !hora_reserva || !numero_personas || !id_cliente) {
    return res.status(400).json({
      message: 'Todos los campos son obligatorios'
    });
  }

  // Validar fecha
  const fecha = new Date(fecha_reserva);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
    
  if (fecha < hoy) {
    return res.status(400).json({
      message: 'La fecha de reserva no puede ser anterior a hoy'
    });
  }

  // Validar hora (formato HH:MM)
  if (!validator.matches(hora_reserva, /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
    return res.status(400).json({
      message: 'El formato de hora debe ser HH:MM'
    });
  }

  // Validar número de personas
  const personas = parseInt(numero_personas);
  if (isNaN(personas) || personas < 1 || personas > 8) {
    return res.status(400).json({
      message: 'El número de personas debe estar entre 1 y 8'
    });
  }

  // Validar ID de cliente
  if (!validator.isInt(id_cliente, { min: 1 })) {
    return res.status(400).json({
      message: 'El ID de cliente debe ser un número entero positivo'
    });
  }

  next();
};

// Validación para pedidos
export const validatePedido = (req, res, next) => {
  const { id_cliente, productos, total_pedido } = req.body;

  if (!id_cliente || !productos || !total_pedido) {
    return res.status(400).json({
      message: 'Todos los campos son obligatorios'
    });
  }

  // Validar ID de cliente
  if (!validator.isInt(id_cliente, { min: 1 })) {
    return res.status(400).json({
      message: 'El ID de cliente debe ser un número entero positivo'
    });
  }

  // Validar productos (debe ser un array)
  if (!Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({
      message: 'Debe incluir al menos un producto'
    });
  }

  // Validar cada producto en el array
  for (let i = 0; i < productos.length; i++) {
    const producto = productos[i];
    if (!producto.id_producto || !producto.cantidad || !producto.precio_unitario) {
      return res.status(400).json({
        message: `El producto ${i + 1} debe tener id_producto, cantidad y precio_unitario`
      });
    }

    if (!validator.isInt(producto.id_producto, { min: 1 })) {
      return res.status(400).json({
        message: `El ID del producto ${i + 1} debe ser un número entero positivo`
      });
    }

    if (!validator.isInt(producto.cantidad, { min: 1, max: 100 })) {
      return res.status(400).json({
        message: `La cantidad del producto ${i + 1} debe estar entre 1 y 100`
      });
    }

    const precio = parseFloat(producto.precio_unitario);
    if (isNaN(precio) || precio < 0) {
      return res.status(400).json({
        message: `El precio del producto ${i + 1} debe ser un número válido`
      });
    }
  }

  // Validar total
  const total = parseFloat(total_pedido);
  if (isNaN(total) || total < 0) {
    return res.status(400).json({
      message: 'El total debe ser un número válido'
    });
  }

  next();
}; 