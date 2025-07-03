import {dbConfig} from '../config/dbconfig.js'
import mysql from 'mysql2/promise'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

const pool = mysql.createPool(dbConfig);

// Register

export const registerUser = async (clienteData) => {
    const { nombre_cliente, email_cliente, telefono_cliente, contraseña_cliente } = clienteData;
    
    try {
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

        // Insertar nuevo cliente
        const [result] = await pool.query(
            `INSERT INTO clientes (
                nombre_cliente, 
                email_cliente, 
                telefono_cliente, 
                contraseña_cliente,
                activo
            ) VALUES (?, ?, ?, ?, ?)`,
            [nombre_cliente, email_cliente, telefono_cliente, hashedPassword, true]
        );

        return result.insertId;
    } catch (error) {
        throw error;
    }
};

// Obtener usuario por email
export const getUserByEmail = async (email_cliente) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM clientes WHERE email_cliente = ? AND activo = true',
            [email_cliente]
        );
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        throw error;
    }
};

// Login
export const loginUser = async (email_cliente, contraseña_cliente) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM clientes WHERE email_cliente = ? AND activo = true',
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
    } catch (error) {
        throw error;
    }
};

// Actualizar usuario
export const updateUser = async (id_cliente, userData) => {
    try {
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
    } catch (error) {
        throw error;
    }
};

// Desactivar usuario (soft delete)
export const deactivateUser = async (id_cliente) => {
    try {
        const [result] = await pool.query(
            'UPDATE clientes SET activo = false WHERE id_cliente = ?',
            [id_cliente]
        );
        return result.affectedRows > 0;
    } catch (error) {
        throw error;
    }
};

// Obtener todos los clientes
export const getAllClientes = async () => {
    try {
        const [rows] = await pool.query(
            'SELECT id_cliente, nombre_cliente, email_cliente, telefono_cliente, fecha_registro, fecha_modificacion FROM clientes WHERE activo = true'
        );
        return rows;
    } catch (error) {
        throw error;
    }
};

// Obtener cliente por ID
export const getClienteById = async (id_cliente) => {
    try {
        const [rows] = await pool.query(
            'SELECT id_cliente, nombre_cliente, email_cliente, telefono_cliente, fecha_registro, fecha_modificacion FROM clientes WHERE id_cliente = ? AND activo = true',
            [id_cliente]
        );
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        throw error;
    }
};

// Generar token de recuperación de contraseña
export const generatePasswordResetToken = async (email_cliente) => {
    try {
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
    } catch (error) {
        throw error;
    }
};

// Verificar token de recuperación
export const verifyResetToken = async (token) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM clientes WHERE reset_token = ? AND reset_token_expiry > NOW() AND activo = true',
            [token]
        );
        
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        throw error;
    }
};

// Actualizar contraseña
export const updatePassword = async (id_cliente, newPassword) => {
    try {
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
    } catch (error) {
        throw error;
    }
};