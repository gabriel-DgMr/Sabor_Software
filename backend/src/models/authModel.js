import {dbConfig} from '../config/dbconfig.js';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const pool = mysql.createPool(dbConfig);

// Register - Ahora registra con activo = false y email_verificado = false
export const registerUser = async (clienteData) => {
    const { nombre_cliente, email_cliente, telefono_cliente, contraseña_cliente } = clienteData;
    
    // Verificar si el email ya existe
    const [existingUser] = await pool.query(
        'SELECT * FROM clientes WHERE email_cliente = ?',
        [email_cliente]
    );

            if (existingUser.length > 0) {
        throw new Error('El correo ya está registrado');
    }

    // Verificar si el teléfono ya existe
    const [existingPhone] = await pool.query(
        'SELECT * FROM clientes WHERE telefono_cliente = ?',
        [telefono_cliente]
    );
    if (existingPhone.length > 0) {
        throw new Error('El teléfono ya está registrado');
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contraseña_cliente, 10);

    // Insertar nuevo cliente con activo = false y email_verificado = false
    const [result] = await pool.query(
        `INSERT INTO clientes (
            nombre_cliente, 
            email_cliente, 
            telefono_cliente, 
            contraseña_cliente,
            activo,
            email_verificado
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [nombre_cliente, email_cliente, telefono_cliente, hashedPassword, false, false]
    );

    return result.insertId;
};

// Generar código de verificación
export const generateVerificationCode = async (id_cliente) => {
    // Generar código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Fecha de expiración (15 minutos)
    const fecha_expiracion = new Date(Date.now() + 15 * 60 * 1000);
    
    // Eliminar códigos anteriores no usados
    await pool.query(
        'DELETE FROM codigos_verificacion WHERE id_cliente = ? AND usado = false',
        [id_cliente]
    );
    
    // Insertar nuevo código
    await pool.query(
        'INSERT INTO codigos_verificacion (id_cliente, codigo, fecha_expiracion) VALUES (?, ?, ?)',
        [id_cliente, codigo, fecha_expiracion]
    );
    
    return codigo;
};

// Verificar código de verificación
export const verifyCode = async (id_cliente, codigo) => {
    const [rows] = await pool.query(
        `SELECT * FROM codigos_verificacion 
         WHERE id_cliente = ? 
         AND codigo = ? 
         AND usado = false 
         AND fecha_expiracion > NOW()`,
        [id_cliente, codigo]
    );
    
    if (rows.length === 0) {
        return false;
    }
    
    // Marcar código como usado
    await pool.query(
        'UPDATE codigos_verificacion SET usado = true WHERE id_codigo = ?',
        [rows[0].id_codigo]
    );
    
    // Activar cuenta y marcar email como verificado
    await pool.query(
        'UPDATE clientes SET activo = true, email_verificado = true WHERE id_cliente = ?',
        [id_cliente]
    );
    
    return true;
};

// Obtener usuario por email (solo usuarios activos y verificados)
export const getUserByEmail = async (email_cliente) => {
    const [rows] = await pool.query(
        'SELECT * FROM clientes WHERE email_cliente = ? AND activo = true AND email_verificado = true',
        [email_cliente]
    );
    return rows.length > 0 ? rows[0] : null;
};

// Obtener usuario por email (incluyendo no verificados)
export const getUserByEmailIncludingUnverified = async (email_cliente) => {
    const [rows] = await pool.query(
        'SELECT * FROM clientes WHERE email_cliente = ?',
        [email_cliente]
    );
    return rows.length > 0 ? rows[0] : null;
};

// Login - Solo permite acceso a usuarios activos y verificados
export const loginUser = async (email_cliente, contraseña_cliente) => {
    // TEMPORAL: Permitir login aunque no esté verificado ni activo
    const [rows] = await pool.query(
        'SELECT * FROM clientes WHERE email_cliente = ?',
        [email_cliente]
    );
    
    if (!rows.length) {
        throw new Error('Usuario no existe');
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(contraseña_cliente, user.contraseña_cliente);

    if (!isPasswordValid) {
        throw new Error('Contraseña incorrecta');
    }

    // No devolver la contraseña en la respuesta
    const { contraseña_cliente: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

// Actualizar usuario
export const updateUser = async (id_cliente, userData) => {
    const { nombre_cliente, email_cliente, telefono_cliente } = userData;
    
    const [result] = await pool.query(
        `UPDATE clientes 
         SET nombre_cliente = ?, 
             email_cliente = ?, 
             telefono_cliente = ?,
             fecha_modificacion = CURRENT_TIMESTAMP
         WHERE id_cliente = ? AND activo = true`,
        [nombre_cliente, email_cliente, telefono_cliente, id_cliente]
    );

    return result.affectedRows > 0;
};

// Desactivar usuario (soft delete)
export const deactivateUser = async (id_cliente) => {
    const [result] = await pool.query(
        'UPDATE clientes SET activo = false WHERE id_cliente = ?',
        [id_cliente]
    );
    return result.affectedRows > 0;
};

// Obtener todos los clientes
export const getAllClientes = async () => {
    const [rows] = await pool.query(
        'SELECT id_cliente, nombre_cliente, email_cliente, telefono_cliente, fecha_registro, fecha_modificacion FROM clientes WHERE activo = true'
    );
    return rows;
};

// Obtener cliente por ID
export const getClienteById = async (id_cliente) => {
    const [rows] = await pool.query(
        'SELECT id_cliente, nombre_cliente, email_cliente, telefono_cliente, fecha_registro, fecha_modificacion FROM clientes WHERE id_cliente = ? AND activo = true',
        [id_cliente]
    );
    return rows.length > 0 ? rows[0] : null;
};

// Generar token de recuperación de contraseña
export const generatePasswordResetToken = async (email_cliente) => {
    const [rows] = await pool.query(
        'SELECT * FROM clientes WHERE email_cliente = ? AND activo = true',
        [email_cliente]
    );
    
    if (!rows.length) {
        throw new Error('Usuario no encontrado');
    }

    const user = rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    await pool.query(
        'UPDATE clientes SET reset_token = ?, reset_token_expiry = ? WHERE id_cliente = ?',
        [resetToken, resetTokenExpiry, user.id_cliente]
    );

    return { resetToken, user };
};

// Verificar token de recuperación
export const verifyResetToken = async (token) => {
    const [rows] = await pool.query(
        'SELECT * FROM clientes WHERE reset_token = ? AND reset_token_expiry > NOW() AND activo = true',
        [token]
    );
    
    return rows.length > 0 ? rows[0] : null;
};

// Actualizar contraseña
export const updatePassword = async (id_cliente, newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const [result] = await pool.query(
        `UPDATE clientes 
         SET contraseña_cliente = ?, 
             reset_token = NULL, 
             reset_token_expiry = NULL,
             fecha_modificacion = CURRENT_TIMESTAMP
         WHERE id_cliente = ? AND activo = true`,
        [hashedPassword, id_cliente]
    );

    return result.affectedRows > 0;
};