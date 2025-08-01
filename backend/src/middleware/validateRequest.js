import validator from "validator";
import { passwordStrength } from "check-password-strength";

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

// Función helper para validar fortaleza de contraseña
const validatePasswordStrength = (password) => {
  const result = passwordStrength(password);

  // Configuración mínima requerida
  const minRequiredStrength = 2; // 0: Too weak, 1: Weak, 2: Medium, 3: Strong

  if (result.id < minRequiredStrength) {
    const suggestions = [];

    if (password.length < 8) {
      suggestions.push("debe tener al menos 8 caracteres");
    }
    if (!/[a-z]/.test(password)) {
      suggestions.push("debe incluir al menos una letra minúscula");
    }
    if (!/[A-Z]/.test(password)) {
      suggestions.push("debe incluir al menos una letra mayúscula");
    }
    if (!/\d/.test(password)) {
      suggestions.push("debe incluir al menos un número");
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      suggestions.push("debe incluir al menos un carácter especial");
    }

    return {
      isValid: false,
      message: `La contraseña es demasiado débil. ${suggestions.join(", ")}.`,
      strength: result.value,
      suggestions: suggestions,
    };
  }

  return {
    isValid: true,
    strength: result.value,
    score: result.id,
  };
};

// Validación específica para registro de clientes usando campos legacy (_cliente)
export const validateClienteRegisterLegacy = (req, res, next) => {
  const {
    nombre_cliente,
    email_cliente,
    telefono_cliente,
    contraseña_cliente,
  } = req.body;

  // Validar campos requeridos
  if (
    !nombre_cliente ||
    !email_cliente ||
    !telefono_cliente ||
    !contraseña_cliente
  ) {
    return res.status(400).json({
      message: "Todos los campos son obligatorios",
    });
  }

  // Validar longitud de campos
  const lengthErrors = [];
  const nombreError = validateLength(nombre_cliente, "nombre", 2, 50);
  if (nombreError) lengthErrors.push(nombreError);

  const emailError = validateLength(email_cliente, "email", 5, 100);
  if (emailError) lengthErrors.push(emailError);

  if (lengthErrors.length > 0) {
    return res.status(400).json({
      message: lengthErrors.join(", "),
    });
  }

  // Validar email con regex mejorada
  if (!validateEmailFormat(email_cliente)) {
    return res.status(400).json({
      message: "El formato del email no es válido",
    });
  }

  // Validar que el email no tenga espacios en blanco
  const emailWhitespaceError = validateNoWhitespace(email_cliente, "email");
  if (emailWhitespaceError) {
    return res.status(400).json({
      message: emailWhitespaceError,
    });
  }

  // Validar que el email no tenga espacios al inicio ni al final
  const emailLeadingTrailingError = validateNoLeadingTrailingSpaces(
    email_cliente,
    "email",
  );
  if (emailLeadingTrailingError) {
    return res.status(400).json({
      message: emailLeadingTrailingError,
    });
  }

  // Validar que el email no sea un email temporal
  const disposableEmailDomains = [
    "10minutemail.com",
    "tempmail.org",
    "guerrillamail.com",
  ];
  const emailDomain = email_cliente.split("@")[1];
  if (disposableEmailDomains.includes(emailDomain)) {
    return res.status(400).json({
      message: "No se permiten correos temporales",
    });
  }

  // Validar teléfono
  if (!validator.matches(telefono_cliente, /^\d{10}$/)) {
    return res.status(400).json({
      message: "El teléfono debe tener exactamente 10 dígitos numéricos",
    });
  }

  // Validar que el teléfono no tenga espacios en blanco
  const telefonoWhitespaceError = validateNoWhitespace(
    telefono_cliente,
    "teléfono",
  );
  if (telefonoWhitespaceError) {
    return res.status(400).json({
      message: telefonoWhitespaceError,
    });
  }

  // Validar que el teléfono no tenga espacios al inicio ni al final
  const telefonoLeadingTrailingError = validateNoLeadingTrailingSpaces(
    telefono_cliente,
    "teléfono",
  );
  if (telefonoLeadingTrailingError) {
    return res.status(400).json({
      message: telefonoLeadingTrailingError,
    });
  }

  // Validar contraseña
  const passwordStrengthResult = validatePasswordStrength(contraseña_cliente);
  if (!passwordStrengthResult.isValid) {
    return res.status(400).json({
      message: passwordStrengthResult.message,
    });
  }

  // Validar que la contraseña no tenga espacios en blanco
  const contraseñaWhitespaceError = validateNoWhitespace(
    contraseña_cliente,
    "contraseña",
  );
  if (contraseñaWhitespaceError) {
    return res.status(400).json({
      message: contraseñaWhitespaceError,
    });
  }

  // Validar que la contraseña no tenga espacios al inicio ni al final
  const contraseñaLeadingTrailingError = validateNoLeadingTrailingSpaces(
    contraseña_cliente,
    "contraseña",
  );
  if (contraseñaLeadingTrailingError) {
    return res.status(400).json({
      message: contraseñaLeadingTrailingError,
    });
  }

  // Validar caracteres especiales y espacios para todos los campos
  const validationErrors = [];

  const nombreSpecialError = validateSpecialCharacters(
    nombre_cliente,
    "nombre",
  );
  if (nombreSpecialError) validationErrors.push(nombreSpecialError);

  const nombreSpaceError = validateSpaces(nombre_cliente, "nombre");
  if (nombreSpaceError) validationErrors.push(nombreSpaceError);

  const emailSpecialError = validateSpecialCharacters(email_cliente, "email");
  if (emailSpecialError) validationErrors.push(emailSpecialError);

  const emailSpaceError = validateSpaces(email_cliente, "email");
  if (emailSpaceError) validationErrors.push(emailSpaceError);

  const telefonoSpecialError = validateSpecialCharacters(
    telefono_cliente,
    "teléfono",
  );
  if (telefonoSpecialError) validationErrors.push(telefonoSpecialError);

  const telefonoSpaceError = validateSpaces(telefono_cliente, "teléfono");
  if (telefonoSpaceError) validationErrors.push(telefonoSpaceError);

  const contraseñaSpecialError = validateSpecialCharacters(
    contraseña_cliente,
    "contraseña",
  );
  if (contraseñaSpecialError) validationErrors.push(contraseñaSpecialError);

  const contraseñaSpaceError = validateSpaces(contraseña_cliente, "contraseña");
  if (contraseñaSpaceError) validationErrors.push(contraseñaSpaceError);

  if (validationErrors.length > 0) {
    return res.status(400).json({
      message: validationErrors.join(", "),
    });
  }

  next();
};

// ===== VALIDACIONES SEPARADAS POR TIPO DE USUARIO =====

// Validación para registro general de usuarios
export const validateUserRegister = (req, res, next) => {
  const { nombre, apellido, email, telefono, contraseña, tipo_usuario } =
    req.body;

  // Validar campos requeridos
  if (!nombre || !email || !contraseña) {
    return res.status(400).json({
      message: "Nombre, email y contraseña son obligatorios",
    });
  }

  // Validar tipo de usuario si se proporciona
  if (
    tipo_usuario &&
    !["cliente", "empleado", "administrador"].includes(tipo_usuario)
  ) {
    return res.status(400).json({
      message: "Tipo de usuario no válido",
    });
  }

  // Validar longitud de campos
  const lengthErrors = [];
  const nombreError = validateLength(nombre, "nombre", 2, 50);
  if (nombreError) lengthErrors.push(nombreError);

  if (apellido) {
    const apellidoError = validateLength(apellido, "apellido", 2, 50);
    if (apellidoError) lengthErrors.push(apellidoError);
  }

  const emailError = validateLength(email, "email", 5, 100);
  if (emailError) lengthErrors.push(emailError);

  if (lengthErrors.length > 0) {
    return res.status(400).json({
      message: lengthErrors.join(", "),
    });
  }

  // Validar email
  if (!validateEmailFormat(email)) {
    return res.status(400).json({
      message: "El formato del email no es válido",
    });
  }

  const emailWhitespaceError = validateNoWhitespace(email, "email");
  if (emailWhitespaceError) {
    return res.status(400).json({
      message: emailWhitespaceError,
    });
  }

  // Validar teléfono si se proporciona
  if (telefono) {
    if (!validator.matches(telefono, /^\d{10}$/)) {
      return res.status(400).json({
        message: "El teléfono debe tener exactamente 10 dígitos numéricos",
      });
    }

    const telefonoWhitespaceError = validateNoWhitespace(telefono, "teléfono");
    if (telefonoWhitespaceError) {
      return res.status(400).json({
        message: telefonoWhitespaceError,
      });
    }
  }

  // Validar contraseña
  const passwordStrengthResult = validatePasswordStrength(contraseña);
  if (!passwordStrengthResult.isValid) {
    return res.status(400).json({
      message: passwordStrengthResult.message,
    });
  }

  // Validar caracteres especiales y espacios
  const validationErrors = [];

  const nombreSpecialError = validateSpecialCharacters(nombre, "nombre");
  if (nombreSpecialError) validationErrors.push(nombreSpecialError);

  if (apellido) {
    const apellidoSpecialError = validateSpecialCharacters(
      apellido,
      "apellido",
    );
    if (apellidoSpecialError) validationErrors.push(apellidoSpecialError);
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({
      message: validationErrors.join(", "),
    });
  }

  next();
};

// Validación específica para registro de clientes
export const validateClienteRegister = (req, res, next) => {
  const { nombre, apellido, email, telefono, contraseña } = req.body;

  // Validar campos requeridos
  if (!nombre || !email || !contraseña) {
    return res.status(400).json({
      message: "Nombre, email y contraseña son obligatorios",
    });
  }

  // Validar longitud de campos
  const lengthErrors = [];
  const nombreError = validateLength(nombre, "nombre", 2, 50);
  if (nombreError) lengthErrors.push(nombreError);

  if (apellido) {
    const apellidoError = validateLength(apellido, "apellido", 2, 50);
    if (apellidoError) lengthErrors.push(apellidoError);
  }

  const emailError = validateLength(email, "email", 5, 100);
  if (emailError) lengthErrors.push(emailError);

  if (lengthErrors.length > 0) {
    return res.status(400).json({
      message: lengthErrors.join(", "),
    });
  }

  // Validar email
  if (!validateEmailFormat(email)) {
    return res.status(400).json({
      message: "El formato del email no es válido",
    });
  }

  const emailWhitespaceError = validateNoWhitespace(email, "email");
  if (emailWhitespaceError) {
    return res.status(400).json({
      message: emailWhitespaceError,
    });
  }

  // Validar teléfono si se proporciona
  if (telefono) {
    if (!validator.matches(telefono, /^\d{10}$/)) {
      return res.status(400).json({
        message: "El teléfono debe tener exactamente 10 dígitos numéricos",
      });
    }

    const telefonoWhitespaceError = validateNoWhitespace(telefono, "teléfono");
    if (telefonoWhitespaceError) {
      return res.status(400).json({
        message: telefonoWhitespaceError,
      });
    }
  }

  // Validar contraseña
  const passwordStrengthResult = validatePasswordStrength(contraseña);
  if (!passwordStrengthResult.isValid) {
    return res.status(400).json({
      message: passwordStrengthResult.message,
    });
  }

  // Validar caracteres especiales y espacios
  const validationErrors = [];

  const nombreSpecialError = validateSpecialCharacters(nombre, "nombre");
  if (nombreSpecialError) validationErrors.push(nombreSpecialError);

  if (apellido) {
    const apellidoSpecialError = validateSpecialCharacters(
      apellido,
      "apellido",
    );
    if (apellidoSpecialError) validationErrors.push(apellidoSpecialError);
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({
      message: validationErrors.join(", "),
    });
  }

  next();
};

// Validación específica para registro de empleados
export const validateEmpleadoRegister = (req, res, next) => {
  const { nombre, apellido, email, telefono, contraseña, direccion, id_rol } =
    req.body;

  // Validar campos requeridos
  if (!nombre || !email || !contraseña || !id_rol) {
    return res.status(400).json({
      message: "Nombre, email, contraseña y rol son obligatorios",
    });
  }

  // Validar longitud de campos
  const lengthErrors = [];
  const nombreError = validateLength(nombre, "nombre", 2, 50);
  if (nombreError) lengthErrors.push(nombreError);

  if (apellido) {
    const apellidoError = validateLength(apellido, "apellido", 2, 50);
    if (apellidoError) lengthErrors.push(apellidoError);
  }

  const emailError = validateLength(email, "email", 5, 100);
  if (emailError) lengthErrors.push(emailError);

  if (direccion) {
    const direccionError = validateLength(direccion, "dirección", 5, 200);
    if (direccionError) lengthErrors.push(direccionError);
  }

  if (lengthErrors.length > 0) {
    return res.status(400).json({
      message: lengthErrors.join(", "),
    });
  }

  // Validar email
  if (!validateEmailFormat(email)) {
    return res.status(400).json({
      message: "El formato del email no es válido",
    });
  }

  const emailWhitespaceError = validateNoWhitespace(email, "email");
  if (emailWhitespaceError) {
    return res.status(400).json({
      message: emailWhitespaceError,
    });
  }

  // Validar teléfono si se proporciona
  if (telefono) {
    if (!validator.matches(telefono, /^\d{10}$/)) {
      return res.status(400).json({
        message: "El teléfono debe tener exactamente 10 dígitos numéricos",
      });
    }

    const telefonoWhitespaceError = validateNoWhitespace(telefono, "teléfono");
    if (telefonoWhitespaceError) {
      return res.status(400).json({
        message: telefonoWhitespaceError,
      });
    }
  }

  // Validar ID de rol
  if (!validator.isInt(id_rol.toString(), { min: 1 })) {
    return res.status(400).json({
      message: "El ID de rol debe ser un número entero positivo",
    });
  }

  // Validar contraseña
  const passwordStrengthResult = validatePasswordStrength(contraseña);
  if (!passwordStrengthResult.isValid) {
    return res.status(400).json({
      message: passwordStrengthResult.message,
    });
  }

  // Validar caracteres especiales y espacios
  const validationErrors = [];

  const nombreSpecialError = validateSpecialCharacters(nombre, "nombre");
  if (nombreSpecialError) validationErrors.push(nombreSpecialError);

  if (apellido) {
    const apellidoSpecialError = validateSpecialCharacters(
      apellido,
      "apellido",
    );
    if (apellidoSpecialError) validationErrors.push(apellidoSpecialError);
  }

  if (direccion) {
    const direccionSpecialError = validateSpecialCharacters(
      direccion,
      "dirección",
    );
    if (direccionSpecialError) validationErrors.push(direccionSpecialError);
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({
      message: validationErrors.join(", "),
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email_cliente, contraseña_cliente } = req.body;

  if (!email_cliente || !contraseña_cliente) {
    return res.status(400).json({
      message: "Email y contraseña son requeridos",
    });
  }

  // Validar longitud de email
  if (email_cliente.length < 5 || email_cliente.length > 100) {
    return res.status(400).json({
      message: "El email debe tener entre 5 y 100 caracteres",
    });
  }

  // Validar email con regex mejorada
  if (!validateEmailFormat(email_cliente)) {
    return res.status(400).json({
      message: "El formato del email no es válido",
    });
  }

  // Validar que el email no tenga espacios en blanco
  const emailWhitespaceError = validateNoWhitespace(email_cliente, "email");
  if (emailWhitespaceError) {
    return res.status(400).json({
      message: emailWhitespaceError,
    });
  }

  // Validar que el email no tenga espacios al inicio ni al final
  const emailLeadingTrailingError = validateNoLeadingTrailingSpaces(
    email_cliente,
    "email",
  );
  if (emailLeadingTrailingError) {
    return res.status(400).json({
      message: emailLeadingTrailingError,
    });
  }

  // Validar que la contraseña no esté vacía
  if (contraseña_cliente.length === 0) {
    return res.status(400).json({
      message: "La contraseña no puede estar vacía",
    });
  }

  // Validar que la contraseña no tenga espacios en blanco
  const contraseñaWhitespaceError = validateNoWhitespace(
    contraseña_cliente,
    "contraseña",
  );
  if (contraseñaWhitespaceError) {
    return res.status(400).json({
      message: contraseñaWhitespaceError,
    });
  }

  // Validar que la contraseña no tenga espacios al inicio ni al final
  const contraseñaLeadingTrailingError = validateNoLeadingTrailingSpaces(
    contraseña_cliente,
    "contraseña",
  );
  if (contraseñaLeadingTrailingError) {
    return res.status(400).json({
      message: contraseñaLeadingTrailingError,
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
      message: "Todos los campos son obligatorios",
    });
  }

  // Validar longitud de campos
  const lengthErrors = [];
  const nombreError = validateLength(nombre_cliente, "nombre", 2, 50);
  if (nombreError) lengthErrors.push(nombreError);

  const emailError = validateLength(email_cliente, "email", 5, 100);
  if (emailError) lengthErrors.push(emailError);

  if (lengthErrors.length > 0) {
    return res.status(400).json({
      message: lengthErrors.join(", "),
    });
  }

  // Validar email con regex mejorada
  if (!validateEmailFormat(email_cliente)) {
    return res.status(400).json({
      message: "El formato del email no es válido",
    });
  }

  // Validar que el email no tenga espacios en blanco
  const emailWhitespaceError = validateNoWhitespace(email_cliente, "email");
  if (emailWhitespaceError) {
    return res.status(400).json({
      message: emailWhitespaceError,
    });
  }

  // Validar que el email no tenga espacios al inicio ni al final
  const emailLeadingTrailingError = validateNoLeadingTrailingSpaces(
    email_cliente,
    "email",
  );
  if (emailLeadingTrailingError) {
    return res.status(400).json({
      message: emailLeadingTrailingError,
    });
  }

  // Validar que el email no sea un email temporal
  const disposableEmailDomains = [
    "10minutemail.com",
    "tempmail.org",
    "guerrillamail.com",
  ];
  const emailDomain = email_cliente.split("@")[1];
  if (disposableEmailDomains.includes(emailDomain)) {
    return res.status(400).json({
      message: "No se permiten correos temporales",
    });
  }

  // Validar teléfono
  if (!validator.matches(telefono_cliente, /^\d{10}$/)) {
    return res.status(400).json({
      message: "El teléfono debe tener exactamente 10 dígitos numéricos",
    });
  }

  // Validar que el teléfono no tenga espacios en blanco
  const telefonoWhitespaceError = validateNoWhitespace(
    telefono_cliente,
    "teléfono",
  );
  if (telefonoWhitespaceError) {
    return res.status(400).json({
      message: telefonoWhitespaceError,
    });
  }

  // Validar que el teléfono no tenga espacios al inicio ni al final
  const telefonoLeadingTrailingError = validateNoLeadingTrailingSpaces(
    telefono_cliente,
    "teléfono",
  );
  if (telefonoLeadingTrailingError) {
    return res.status(400).json({
      message: telefonoLeadingTrailingError,
    });
  }

  // Validar caracteres especiales y espacios para todos los campos
  const validationErrors = [];

  const nombreSpecialError = validateSpecialCharacters(
    nombre_cliente,
    "nombre",
  );
  if (nombreSpecialError) validationErrors.push(nombreSpecialError);

  const nombreSpaceError = validateSpaces(nombre_cliente, "nombre");
  if (nombreSpaceError) validationErrors.push(nombreSpaceError);

  const emailSpecialError = validateSpecialCharacters(email_cliente, "email");
  if (emailSpecialError) validationErrors.push(emailSpecialError);

  const emailSpaceError = validateSpaces(email_cliente, "email");
  if (emailSpaceError) validationErrors.push(emailSpaceError);

  const telefonoSpecialError = validateSpecialCharacters(
    telefono_cliente,
    "teléfono",
  );
  if (telefonoSpecialError) validationErrors.push(telefonoSpecialError);

  const telefonoSpaceError = validateSpaces(telefono_cliente, "teléfono");
  if (telefonoSpaceError) validationErrors.push(telefonoSpaceError);

  if (validationErrors.length > 0) {
    return res.status(400).json({
      message: validationErrors.join(", "),
    });
  }

  next();
};

// Nueva validación para productos
export const validateProducto = (req, res, next) => {
  const {
    nombre_producto,
    descripcion_producto,
    precio_producto,
    id_categoria_producto,
  } = req.body;

  // Validar campos requeridos
  if (
    !nombre_producto ||
    !descripcion_producto ||
    !precio_producto ||
    !id_categoria_producto
  ) {
    return res.status(400).json({
      message: "Todos los campos son obligatorios",
    });
  }

  // Validar longitud de campos
  if (nombre_producto.length < 2 || nombre_producto.length > 100) {
    return res.status(400).json({
      message: "El nombre del producto debe tener entre 2 y 100 caracteres",
    });
  }

  if (descripcion_producto.length < 10 || descripcion_producto.length > 500) {
    return res.status(400).json({
      message: "La descripción debe tener entre 10 y 500 caracteres",
    });
  }

  // Validar precio
  const precio = parseFloat(precio_producto);
  if (isNaN(precio) || precio < 0 || precio > 999999.99) {
    return res.status(400).json({
      message: "El precio debe ser un número válido entre 0 y 999999.99",
    });
  }

  // Validar ID de categoría
  if (!validator.isInt(id_categoria_producto, { min: 1 })) {
    return res.status(400).json({
      message: "El ID de categoría debe ser un número entero positivo",
    });
  }

  // Validar caracteres especiales y espacios
  const validationErrors = [];

  const nombreError = validateSpecialCharacters(
    nombre_producto,
    "nombre del producto",
  );
  if (nombreError) validationErrors.push(nombreError);

  const descripcionError = validateSpecialCharacters(
    descripcion_producto,
    "descripción",
  );
  if (descripcionError) validationErrors.push(descripcionError);

  // Validar espacios al inicio y final para campos de texto
  const nombreSpaceError = validateNoLeadingTrailingSpaces(
    nombre_producto,
    "nombre del producto",
  );
  if (nombreSpaceError) validationErrors.push(nombreSpaceError);

  const descripcionSpaceError = validateNoLeadingTrailingSpaces(
    descripcion_producto,
    "descripción",
  );
  if (descripcionSpaceError) validationErrors.push(descripcionSpaceError);

  if (validationErrors.length > 0) {
    return res.status(400).json({
      message: validationErrors.join(", "),
    });
  }

  next();
};

// Validación para reservas
export const validateReserva = (req, res, next) => {
  const { fecha_reserva, hora_reserva, numero_personas, id_cliente } = req.body;

  if (!fecha_reserva || !hora_reserva || !numero_personas || !id_cliente) {
    return res.status(400).json({
      message: "Todos los campos son obligatorios",
    });
  }

  // Validar fecha
  const fecha = new Date(fecha_reserva);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (fecha < hoy) {
    return res.status(400).json({
      message: "La fecha de reserva no puede ser anterior a hoy",
    });
  }

  // Validar hora (formato HH:MM)
  if (!validator.matches(hora_reserva, /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
    return res.status(400).json({
      message: "El formato de hora debe ser HH:MM",
    });
  }

  // Validar número de personas
  const personas = parseInt(numero_personas);
  if (isNaN(personas) || personas < 1 || personas > 8) {
    return res.status(400).json({
      message: "El número de personas debe estar entre 1 y 8",
    });
  }

  // Validar ID de cliente
  if (!validator.isInt(id_cliente, { min: 1 })) {
    return res.status(400).json({
      message: "El ID de cliente debe ser un número entero positivo",
    });
  }

  next();
};

// Validación para pedidos
export const validatePedido = (req, res, next) => {
  const { id_cliente, productos, total_pedido } = req.body;

  if (!id_cliente || !productos || !total_pedido) {
    return res.status(400).json({
      message: "Todos los campos son obligatorios",
    });
  }

  // Validar ID de cliente
  if (!validator.isInt(id_cliente, { min: 1 })) {
    return res.status(400).json({
      message: "El ID de cliente debe ser un número entero positivo",
    });
  }

  // Validar productos (debe ser un array)
  if (!Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({
      message: "Debe incluir al menos un producto",
    });
  }

  // Validar cada producto en el array
  for (let i = 0; i < productos.length; i++) {
    const producto = productos[i];
    if (
      !producto.id_producto ||
      !producto.cantidad ||
      !producto.precio_unitario
    ) {
      return res.status(400).json({
        message: `El producto ${i + 1} debe tener id_producto, cantidad y precio_unitario`,
      });
    }

    if (!validator.isInt(producto.id_producto, { min: 1 })) {
      return res.status(400).json({
        message: `El ID del producto ${i + 1} debe ser un número entero positivo`,
      });
    }

    if (!validator.isInt(producto.cantidad, { min: 1, max: 100 })) {
      return res.status(400).json({
        message: `La cantidad del producto ${i + 1} debe estar entre 1 y 100`,
      });
    }

    const precio = parseFloat(producto.precio_unitario);
    if (isNaN(precio) || precio < 0) {
      return res.status(400).json({
        message: `El precio del producto ${i + 1} debe ser un número válido`,
      });
    }
  }

  // Validar total
  const total = parseFloat(total_pedido);
  if (isNaN(total) || total < 0) {
    return res.status(400).json({
      message: "El total debe ser un número válido",
    });
  }

  next();
};
