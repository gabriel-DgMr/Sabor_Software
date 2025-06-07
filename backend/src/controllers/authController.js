import * as authModel from '../models/authModel.js'
import jwt from 'jsonwebtoken'
import validator from 'validator'
import { config } from '../config/config.js'
import nodemailer from 'nodemailer'

// Configurar el transporter de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.email.user,
        pass: config.email.password
    }
});

// controlador para registrar un nuevo usuario

export const registerUser = async (req, res) => {
    try {
        const {nombre_cliente, email_cliente, telefono_cliente, contraseña_cliente} = req.body;

        // Validar campos requeridos
        if (!nombre_cliente || !email_cliente || !telefono_cliente || !contraseña_cliente) {
            return res.status(400).json({
                message: 'Todos los campos son obligatorios'
            });
        }

        // Validar correo
        if (!validator.isEmail(email_cliente)) {
            return res.status(400).json({
                message: 'Correo no válido'
            });
        }

        // Validar teléfono (10 dígitos)
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

        // Registrar usuario
        const userId = await authModel.registerUser({
            nombre_cliente,
            email_cliente,
            telefono_cliente,
            contraseña_cliente
        });

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            userId
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(400).json({
            message: error.message || 'Error al registrar usuario'
        });
    }
}

// Inicio de sesion
export const loginUser = async(req, res) => {
    try {
        const {email_cliente, contraseña_cliente} = req.body;

        // Validar campos requeridos
        if (!email_cliente || !contraseña_cliente) {
            return res.status(400).json({
                message: 'Email y contraseña son requeridos'
            });
        }

        // Validar correo
        if (!validator.isEmail(email_cliente)) {
            return res.status(400).json({
                message: 'Correo no válido'
            });
        }

        // Autenticar usuario
        const user = await authModel.loginUser(email_cliente, contraseña_cliente);

        // Generar token JWT
        const token = jwt.sign(
            { 
                userId: user.id_cliente,
                email: user.email_cliente
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        // Configurar cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: config.nodeEnv === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 horas
        });

        res.json({
            message: 'Login exitoso',
            user,
            token
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(401).json({
            message: error.message || 'Error al iniciar sesión'
        });
    }
}

// Controlador para cerrar sesión
export const logoutUser = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Sesión cerrada exitosamente' });
}

// Controlador para obtener perfil de usuario
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // Asumiendo que viene del middleware de autenticación
        const user = await authModel.getUserByEmail(req.user.email);
        
        if (!user) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        res.json({ user });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            message: 'Error al obtener perfil de usuario'
        });
    }
}

// Verificar token y obtener perfil
export const verifyToken = async (req, res) => {
    try {
        const user = await authModel.getUserByEmail(req.user.email);
        
        if (!user) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        // No devolver la contraseña
        const { contraseña_cliente, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword });
    } catch (error) {
        console.error('Error al verificar token:', error);
        res.status(500).json({
            message: 'Error al verificar la sesión'
        });
    }
};

// Solicitar recuperación de contraseña
export const forgotPassword = async (req, res) => {
    try {
        const { email_cliente } = req.body;

        // Validar correo
        if (!email_cliente || !validator.isEmail(email_cliente)) {
            return res.status(400).json({
                message: 'Correo electrónico no válido'
            });
        }

        // Generar token de recuperación
        const { resetToken, user } = await authModel.generatePasswordResetToken(email_cliente);

        // Crear URL de recuperación
        const resetUrl = `${config.frontendUrl}/reset-password/${resetToken}`;

        // Enviar correo electrónico
        const mailOptions = {
            from: config.email.user,
            to: user.email_cliente,
            subject: 'Recuperación de Contraseña - Sabor',
            html: `
                <h1>Recuperación de Contraseña</h1>
                <p>Hola ${user.nombre_cliente},</p>
                <p>Has solicitado recuperar tu contraseña. Haz clic en el siguiente enlace para restablecerla:</p>
                <a href="${resetUrl}">Restablecer Contraseña</a>
                <p>Este enlace expirará en 1 hora.</p>
                <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
                <p>Saludos,<br>El equipo de SABOR</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({
            message: 'Se ha enviado un correo con las instrucciones para recuperar tu contraseña'
        });
    } catch (error) {
        console.error('Error en forgotPassword:', error);
        // No revelar si el correo existe o no por seguridad
        res.json({
            message: 'Si el correo existe en nuestra base de datos, recibirás las instrucciones para recuperar tu contraseña'
        });
    }
};

// Verificar token de recuperación
export const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await authModel.verifyResetToken(token);

        if (!user) {
            return res.status(400).json({
                message: 'Token inválido o expirado'
            });
        }

        res.json({
            message: 'Token válido',
            email: user.email_cliente
        });
    } catch (error) {
        console.error('Error en verifyResetToken:', error);
        res.status(500).json({
            message: 'Error al verificar el token'
        });
    }
};

// Restablecer contraseña
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { contraseña_cliente } = req.body;

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

        // Verificar token
        const user = await authModel.verifyResetToken(token);
        if (!user) {
            return res.status(400).json({
                message: 'Token inválido o expirado'
            });
        }

        // Actualizar contraseña
        const success = await authModel.updatePassword(user.id_cliente, contraseña_cliente);
        if (!success) {
            throw new Error('Error al actualizar la contraseña');
        }

        res.json({
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error en resetPassword:', error);
        res.status(500).json({
            message: 'Error al restablecer la contraseña'
        });
    }
};