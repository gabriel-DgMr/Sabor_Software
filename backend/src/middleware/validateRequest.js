import validator from 'validator';

export const validateRegister = (req, res, next) => {
    const { nombre_cliente, email_cliente, telefono_cliente, contraseña_cliente } = req.body;

    // Validar campos requeridos
    if (!nombre_cliente || !email_cliente || !telefono_cliente || !contraseña_cliente) {
        return res.status(400).json({
            message: 'Todos los campos son obligatorios'
        });
    }

    // Validar email
    if (!validator.isEmail(email_cliente)) {
        return res.status(400).json({
            message: 'Correo no válido'
        });
    }

    // Validar teléfono
    if (!validator.matches(telefono_cliente, /^\d{10}$/)) {
        return res.status(400).json({
            message: 'El teléfono debe tener 10 dígitos'
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

    next();
};

export const validateLogin = (req, res, next) => {
    const { email_cliente, contraseña_cliente } = req.body;

    if (!email_cliente || !contraseña_cliente) {
        return res.status(400).json({
            message: 'Email y contraseña son requeridos'
        });
    }

    if (!validator.isEmail(email_cliente)) {
        return res.status(400).json({
            message: 'Correo no válido'
        });
    }

    next();
}; 