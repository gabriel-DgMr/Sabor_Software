import {dbConfig} from '../config/dbconfig.js';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const pool = mysql.createPool(dbConfig);

// ===== FUNCIONES BÁSICAS DE USUARIO =====

// Crear usuario completo (cliente o empleado)
export const createUser = async (userData) => {
  const { 
    email, 
    password, 
    nombre, 
    apellido, 
    telefono, 
    imagen, 
    tipo_usuario, 
    direccion, 
    id_rol 
  } = userData;
    
  const connection = await pool.getConnection();
    
  try {
    await connection.beginTransaction();
        
    // Verificar si el email ya existe
    const [existingUser] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
        
    if (existingUser.length > 0) {
      throw new Error('El correo ya está registrado');
    }
        
    // Verificar si el teléfono ya existe
    if (telefono) {
      const [existingPhone] = await connection.query(
        'SELECT * FROM users WHERE telefono = ?',
        [telefono]
      );
      if (existingPhone.length > 0) {
        throw new Error('El teléfono ya está registrado');
      }
    }
        
    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
        
    // Insertar en tabla users
    const [userResult] = await connection.query(
      `INSERT INTO users (
                email, password, nombre, apellido, telefono, imagen, 
                tipo_usuario, direccion, id_rol, activo, email_verificado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email, hashedPassword, nombre, apellido, telefono, imagen,
        tipo_usuario, direccion, id_rol, 
        tipo_usuario === 'cliente' ? 0 : 1, // Clientes inactivos hasta verificar
        tipo_usuario === 'cliente' ? 0 : 1  // Empleados pre-verificados
      ]
    );
        
    const userId = userResult.insertId;
        
    // Insertar en tabla específica según tipo de usuario
    if (tipo_usuario === 'cliente') {
      await connection.query(
        'INSERT INTO clientes (user_id) VALUES (?)',
        [userId]
      );
    } else {
      await connection.query(
        'INSERT INTO empleados (user_id, id_rol) VALUES (?, ?)',
        [userId, id_rol]
      );
    }
        
    await connection.commit();
    return userId;
        
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Obtener usuario por email
export const getUserByEmail = async (email) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return rows.length > 0 ? rows[0] : null;
};

// Obtener usuario por ID
export const getUserById = async (id_user) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE id_user = ?',
    [id_user]
  );
  return rows.length > 0 ? rows[0] : null;
};

// Obtener usuario completo (con datos específicos de cliente/empleado)
export const getUserCompleto = async (id_user) => {
  const [rows] = await pool.query(
    `SELECT 
            u.*,
            c.id_cliente,
            e.id_empleado,
            r.nombre_rol
        FROM users u
        LEFT JOIN clientes c ON u.id_user = c.user_id
        LEFT JOIN empleados e ON u.id_user = e.user_id
        LEFT JOIN roles r ON u.id_rol = r.id_rol
        WHERE u.id_user = ?`,
    [id_user]
  );
  return rows.length > 0 ? rows[0] : null;
};

// Actualizar usuario
export const updateUser = async (id_user, userData) => {
  const {
    email,
    nombre,
    apellido,
    telefono,
    imagen,
    direccion
  } = userData;
    
  const [result] = await pool.query(
    `UPDATE users 
         SET email = ?, nombre = ?, apellido = ?, telefono = ?, 
             imagen = ?, direccion = ?, fecha_modificacion = CURRENT_TIMESTAMP
         WHERE id_user = ?`,
    [email, nombre, apellido, telefono, imagen, direccion, id_user]
  );
    
  return result.affectedRows > 0;
};

// Actualizar contraseña
export const updatePassword = async (id_user, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
    
  const [result] = await pool.query(
    'UPDATE users SET password = ? WHERE id_user = ?',
    [hashedPassword, id_user]
  );
    
  return result.affectedRows > 0;
};

// Desactivar usuario (soft delete)
export const deactivateUser = async (id_user) => {
  const [result] = await pool.query(
    'UPDATE users SET activo = 0 WHERE id_user = ?',
    [id_user]
  );
  return result.affectedRows > 0;
};

// Activar usuario
export const activateUser = async (id_user) => {
  const [result] = await pool.query(
    'UPDATE users SET activo = 1, email_verificado = 1 WHERE id_user = ?',
    [id_user]
  );
  return result.affectedRows > 0;
};

// ===== FUNCIONES DE AUTENTICACIÓN =====

// Login de usuario
export const loginUser = async (email, password) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ? AND activo = 1',
    [email]
  );
    
  if (!rows.length) {
    throw new Error('Usuario no existe o está inactivo');
  }
    
  const user = rows[0];
  const isPasswordValid = await bcrypt.compare(password, user.password);
    
  if (!isPasswordValid) {
    throw new Error('Contraseña incorrecta');
  }
    
  // Crear objeto sin la contraseña
  const userWithoutPassword = {
    id_user: user.id_user,
    email: user.email,
    nombre: user.nombre,
    apellido: user.apellido,
    telefono: user.telefono,
    imagen: user.imagen,
    tipo_usuario: user.tipo_usuario,
    direccion: user.direccion,
    id_rol: user.id_rol,
    activo: user.activo,
    email_verificado: user.email_verificado,
    fecha_registro: user.fecha_registro,
    fecha_modificacion: user.fecha_modificacion,
    fecha_contratacion: user.fecha_contratacion
  };
  
  return userWithoutPassword;
};

// Verificar si el usuario está activo y verificado
export const isUserActiveAndVerified = async (id_user) => {
  const [rows] = await pool.query(
    'SELECT activo, email_verificado FROM users WHERE id_user = ?',
    [id_user]
  );
    
  if (!rows.length) return false;
    
  const user = rows[0];
  return user.activo && user.email_verificado;
};

// ===== FUNCIONES ESPECÍFICAS PARA CLIENTES =====

// Obtener todos los clientes
export const getAllClientes = async () => {
  const [rows] = await pool.query(
    `SELECT 
            u.id_user,
            c.id_cliente,
            u.email,
            u.nombre,
            u.apellido,
            u.telefono,
            u.imagen,
            u.activo,
            u.email_verificado,
            u.fecha_registro,
            u.fecha_modificacion
        FROM users u
        JOIN clientes c ON u.id_user = c.user_id
        WHERE u.tipo_usuario = 'cliente' AND u.activo = 1
        ORDER BY u.fecha_registro DESC`
  );
  return rows;
};

// Obtener cliente por ID
export const getClienteById = async (id_cliente) => {
  const [rows] = await pool.query(
    `SELECT 
            u.id_user,
            c.id_cliente,
            u.email,
            u.nombre,
            u.apellido,
            u.telefono,
            u.imagen,
            u.activo,
            u.email_verificado,
            u.fecha_registro,
            u.fecha_modificacion
        FROM users u
        JOIN clientes c ON u.id_user = c.user_id
        WHERE c.id_cliente = ? AND u.tipo_usuario = 'cliente' AND u.activo = 1`,
    [id_cliente]
  );
  return rows.length > 0 ? rows[0] : null;
};

// Obtener cliente por user_id
export const getClienteByUserId = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT 
            u.id_user,
            c.id_cliente,
            u.email,
            u.nombre,
            u.apellido,
            u.telefono,
            u.imagen,
            u.activo,
            u.email_verificado,
            u.fecha_registro,
            u.fecha_modificacion
        FROM users u
        JOIN clientes c ON u.id_user = c.user_id
        WHERE u.id_user = ? AND u.tipo_usuario = 'cliente'`,
    [user_id]
  );
  return rows.length > 0 ? rows[0] : null;
};

// ===== FUNCIONES ESPECÍFICAS PARA EMPLEADOS =====

// Obtener todos los empleados
export const getAllEmpleados = async () => {
  const [rows] = await pool.query(
    `SELECT 
            u.id_user,
            e.id_empleado,
            u.email,
            u.nombre,
            u.apellido,
            u.telefono,
            u.imagen,
            u.direccion,
            u.id_rol,
            r.nombre_rol,
            u.activo,
            u.fecha_contratacion,
            u.fecha_modificacion
        FROM users u
        JOIN empleados e ON u.id_user = e.user_id
        JOIN roles r ON u.id_rol = r.id_rol
        WHERE u.tipo_usuario IN ('empleado', 'administrador') AND u.activo = 1
        ORDER BY u.fecha_contratacion DESC`
  );
  return rows;
};

// Obtener empleado por ID
export const getEmpleadoById = async (id_empleado) => {
  const [rows] = await pool.query(
    `SELECT 
            u.id_user,
            e.id_empleado,
            u.email,
            u.nombre,
            u.apellido,
            u.telefono,
            u.imagen,
            u.direccion,
            u.id_rol,
            r.nombre_rol,
            u.activo,
            u.fecha_contratacion,
            u.fecha_modificacion
        FROM users u
        JOIN empleados e ON u.id_user = e.user_id
        JOIN roles r ON u.id_rol = r.id_rol
        WHERE e.id_empleado = ? AND u.tipo_usuario IN ('empleado', 'administrador') AND u.activo = 1`,
    [id_empleado]
  );
  return rows.length > 0 ? rows[0] : null;
};

// Obtener empleado por user_id
export const getEmpleadoByUserId = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT 
            u.id_user,
            e.id_empleado,
            u.email,
            u.nombre,
            u.apellido,
            u.telefono,
            u.imagen,
            u.direccion,
            u.id_rol,
            r.nombre_rol,
            u.activo,
            u.fecha_contratacion,
            u.fecha_modificacion
        FROM users u
        JOIN empleados e ON u.id_user = e.user_id
        JOIN roles r ON u.id_rol = r.id_rol
        WHERE u.id_user = ? AND u.tipo_usuario IN ('empleado', 'administrador')`,
    [user_id]
  );
  return rows.length > 0 ? rows[0] : null;
};

// ===== FUNCIONES PARA VERIFICACIÓN DE EMAIL =====

// Generar código de verificación
export const generateVerificationCode = async (id_user) => {
  // Generar código de 6 dígitos
  const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    
  // Fecha de expiración (15 minutos)
  const fecha_expiracion = new Date(Date.now() + 15 * 60 * 1000);
    
  // Eliminar códigos anteriores no usados
  await pool.query(
    'DELETE FROM codigos_verificacion WHERE user_id = ? AND usado = false',
    [id_user]
  );
    
  // Insertar nuevo código
  await pool.query(
    'INSERT INTO codigos_verificacion (user_id, codigo, fecha_expiracion) VALUES (?, ?, ?)',
    [id_user, codigo, fecha_expiracion]
  );
    
  return codigo;
};

// Verificar código de verificación
export const verifyCode = async (id_user, codigo) => {
  const [rows] = await pool.query(
    `SELECT * FROM codigos_verificacion 
         WHERE user_id = ? 
         AND codigo = ? 
         AND usado = false 
         AND fecha_expiracion > NOW()`,
    [id_user, codigo]
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
    'UPDATE users SET activo = 1, email_verificado = 1 WHERE id_user = ?',
    [id_user]
  );
    
  return true;
};

// ===== FUNCIONES PARA RECUPERACIÓN DE CONTRASEÑA =====

// Generar token de recuperación de contraseña
export const generatePasswordResetToken = async (email) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ? AND activo = 1',
    [email]
  );
    
  if (!rows.length) {
    throw new Error('Usuario no encontrado');
  }
    
  const user = rows[0];
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora
    
  await pool.query(
    'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id_user = ?',
    [resetToken, resetTokenExpiry, user.id_user]
  );
    
  return { resetToken, user };
};

// Verificar token de recuperación
export const verifyResetToken = async (token) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
    [token]
  );
    
  return rows.length > 0 ? rows[0] : null;
};

// Resetear contraseña con token
export const resetPasswordWithToken = async (token, newPassword) => {
  const user = await verifyResetToken(token);
    
  if (!user) {
    throw new Error('Token inválido o expirado');
  }
    
  const hashedPassword = await bcrypt.hash(newPassword, 10);
    
  await pool.query(
    'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id_user = ?',
    [hashedPassword, user.id_user]
  );
    
  return true;
};

// ===== FUNCIONES DE ESTADÍSTICAS =====

// Obtener estadísticas de usuarios
export const getUserStats = async () => {
  const [rows] = await pool.query(
    `SELECT 
            tipo_usuario,
            COUNT(*) as total,
            SUM(activo) as activos,
            SUM(email_verificado) as verificados
        FROM users
        GROUP BY tipo_usuario`
  );
    
  return rows;
};

// Obtener usuarios recientes
export const getRecentUsers = async (limit = 10) => {
  const [rows] = await pool.query(
    `SELECT 
            id_user,
            email,
            nombre,
            apellido,
            tipo_usuario,
            activo,
            email_verificado,
            fecha_registro
        FROM users
        ORDER BY fecha_registro DESC
        LIMIT ?`,
    [limit]
  );
    
  return rows;
}; 