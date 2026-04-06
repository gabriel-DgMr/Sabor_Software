import validator from "validator";

/**
 * Valida los datos de registro de usuario.
 * Lanza un error si hay datos inválidos, con mensajes consistentes en el frontend.
 *
 * @param {Object} data - Datos entrantes del usuario.
 * @throws {Error} si la validación falla.
 */
export const validateRegistrationData = (data) => {
  const {
    nombre_usuario,
    correo_usuario,
    telefono_usuario,
    contraseña_usuario,
  } = data;

  if (
    !nombre_usuario ||
    !correo_usuario ||
    !telefono_usuario ||
    !contraseña_usuario
  ) {
    throw new Error("Todos los campos son obligatorios");
  }
  if (!validator.isEmail(correo_usuario)) {
    throw new Error("Correo no válido");
  }
  if (!validator.matches(telefono_usuario, /^\d{10}$/)) {
    throw new Error("El teléfono debe tener 10 dígitos");
  }
  if (
    !validator.isStrongPassword(contraseña_usuario, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    throw new Error(
      "La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos",
    );
  }
};

/**
 * Valida individualmente una contraseña asegurada.
 *
 * @param {string} contraseña - Contraseña en texto plano a verificar.
 * @throws {Error} si la contraseña no cumple la validación fuerte.
 */
export const validateStrongPassword = (contraseña) => {
  if (
    !validator.isStrongPassword(contraseña, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    throw new Error(
      "La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos",
    );
  }
};
