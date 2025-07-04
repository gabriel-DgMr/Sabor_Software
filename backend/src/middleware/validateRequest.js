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

    // Validar que no haya espacios al inicio o final, ni espacios dobles o múltiples
    const tieneEspaciosExtremos = valor => valor !== valor.trim();
    const tieneEspaciosDobles = valor => /\s{2,}/.test(valor);
    const caracteresProhibidos = /[<>"'/\\(){}[]=;:%&]/;

    // Validar nombre
    if (caracteresProhibidos.test(nombre_cliente)) {
        return res.status(400).json({ message: 'El nombre no puede contener caracteres especiales como < > " \' / \\ ( ) { } [ ] = ; : % &' });
    }
    if (tieneEspaciosExtremos(nombre_cliente)) {
        return res.status(400).json({ message: 'No se permiten espacios al inicio ni al final del nombre.' });
    }
    if (tieneEspaciosDobles(nombre_cliente)) {
        return res.status(400).json({ message: 'No se permiten espacios dobles o múltiples en el nombre.' });
    }

    // Validar correo
    if (caracteresProhibidos.test(email_cliente)) {
        return res.status(400).json({ message: 'El correo no puede contener caracteres especiales como < > " \' / \\ ( ) { } [ ] = ; : % &' });
    }
    if (tieneEspaciosExtremos(email_cliente)) {
        return res.status(400).json({ message: 'No se permiten espacios al inicio ni al final del correo.' });
    }
    if (tieneEspaciosDobles(email_cliente)) {
        return res.status(400).json({ message: 'No se permiten espacios dobles o múltiples en el correo.' });
    }

    // Validar teléfono
    if (caracteresProhibidos.test(telefono_cliente)) {
        return res.status(400).json({ message: 'El teléfono no puede contener caracteres especiales como < > " \' / \\ ( ) { } [ ] = ; : % &' });
    }
    if (tieneEspaciosExtremos(telefono_cliente)) {
        return res.status(400).json({ message: 'No se permiten espacios al inicio ni al final del teléfono.' });
    }
    if (tieneEspaciosDobles(telefono_cliente)) {
        return res.status(400).json({ message: 'No se permiten espacios dobles o múltiples en el teléfono.' });
    }

    // Validar contraseña
    if (caracteresProhibidos.test(contraseña_cliente)) {
        return res.status(400).json({ message: 'La contraseña no puede contener caracteres especiales como < > " \' / \\ ( ) { } [ ] = ; : % &' });
    }
    if (tieneEspaciosExtremos(contraseña_cliente)) {
        return res.status(400).json({ message: 'No se permiten espacios al inicio ni al final de la contraseña.' });
    }
    if (tieneEspaciosDobles(contraseña_cliente)) {
        return res.status(400).json({ message: 'No se permiten espacios dobles o múltiples en la contraseña.' });
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