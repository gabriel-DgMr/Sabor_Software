import { dbConfig } from "../config/dbconfig.js";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import crypto from "crypto";

const pool = mysql.createPool(dbConfig);

// Register - Registra con activo = false y email_verificado = false (requiere verificación)
export const registerUser = async (usuarioData) => {
  const {
    nombre_usuario,
    correo_usuario,
    telefono_usuario,
    contraseña_usuario,
  } = usuarioData;

  // Verificar si el email ya existe
  const [existingUser] = await pool.query(
    "SELECT * FROM usuarios WHERE correo_usuario = ?",
    [correo_usuario],
  );

  if (existingUser.length > 0) {
    throw new Error("El correo ya está registrado");
  }

  // Verificar si el teléfono ya existe
  const [existingPhone] = await pool.query(
    "SELECT * FROM usuarios WHERE telefono_usuario = ?",
    [telefono_usuario],
  );
  if (existingPhone.length > 0) {
    throw new Error("El teléfono ya está registrado");
  }

  // Encriptar contraseña
  const hashedPassword = await bcrypt.hash(contraseña_usuario, 10);

  // Insertar nuevo usuario con activo = false y email_verificado = false (requiere verificación)
  const [result] = await pool.query(
    `INSERT INTO usuarios (
            nombre_usuario, 
            correo_usuario, 
            telefono_usuario, 
            contraseña_usuario,
            activo,
            email_verificado,
            id_rol
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      nombre_usuario,
      correo_usuario,
      telefono_usuario,
      hashedPassword,
      false, // Usuario inactivo hasta verificar email
      false, // Email no verificado hasta confirmar
      1,
    ],
  );

  return result.insertId;
};

// Generar código de verificación
export const generateVerificationCode = async (id_usuario) => {
  // Generar código de 6 dígitos
  const codigo = Math.floor(100000 + Math.random() * 900000).toString();

  // Fecha de expiración (15 minutos)
  const fecha_expiracion = new Date(Date.now() + 15 * 60 * 1000);

  // Eliminar códigos anteriores no usados
  await pool.query(
    "DELETE FROM codigos_verificacion WHERE id_usuario = ? AND usado = false",
    [id_usuario],
  );

  // Insertar nuevo código
  await pool.query(
    "INSERT INTO codigos_verificacion (id_usuario, codigo, fecha_expiracion) VALUES (?, ?, ?)",
    [id_usuario, codigo, fecha_expiracion],
  );

  return codigo;
};

// Verificar código de verificación
export const verifyCode = async (id_usuario, codigo) => {
  const [rows] = await pool.query(
    `SELECT * FROM codigos_verificacion 
         WHERE id_usuario = ? 
         AND codigo = ? 
         AND usado = false 
         AND fecha_expiracion > NOW()`,
    [id_usuario, codigo],
  );

  if (rows.length === 0) {
    return false;
  }

  // Marcar código como usado
  await pool.query(
    "UPDATE codigos_verificacion SET usado = true WHERE id_codigo = ?",
    [rows[0].id_codigo],
  );

  // Activar cuenta y marcar email como verificado
  await pool.query(
    "UPDATE usuarios SET activo = true, email_verificado = true WHERE id_usuario = ?",
    [id_usuario],
  );

  return true;
};

// Obtener usuario por email (solo usuarios activos y verificados)
export const getUserByEmail = async (correo_usuario) => {
  const [rows] = await pool.query(
    `SELECT u.*, r.nombre_rol 
     FROM usuarios u 
     JOIN roles r ON u.id_rol = r.id_rol 
     WHERE u.correo_usuario = ? AND u.activo = true AND u.email_verificado = true`,
    [correo_usuario],
  );
  return rows.length > 0 ? rows[0] : null;
};

// Obtener usuario por email (incluyendo no verificados)
export const getUserByEmailIncludingUnverified = async (correo_usuario) => {
  const [rows] = await pool.query(
    "SELECT * FROM usuarios WHERE correo_usuario = ?",
    [correo_usuario],
  );
  return rows.length > 0 ? rows[0] : null;
};

// Login - Solo permite acceso a usuarios activos y verificados
export const loginUser = async (correo_usuario, contraseña_usuario) => {
  const [rows] = await pool.query(
    `SELECT u.*, r.nombre_rol 
     FROM usuarios u 
     JOIN roles r ON u.id_rol = r.id_rol 
     WHERE u.correo_usuario = ? AND u.activo = true AND u.email_verificado = true`,
    [correo_usuario],
  );

  if (!rows.length) {
    throw new Error("usuario no existe o no está verificado");
  }

  const user = rows[0];
  const isPasswordValid = await bcrypt.compare(
    contraseña_usuario,
    user.contraseña_usuario,
  );

  if (!isPasswordValid) {
    throw new Error("Contraseña incorrecta");
  }

  // No devolver la contraseña en la respuesta
  const { contraseña_usuario: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Actualizar usuario
export const updateUser = async (id_usuario, userData) => {
  const { nombre_usuario, correo_usuario, telefono_usuario, imagen_usuario } =
    userData;

  // Construir la consulta dinámicamente basada en los campos proporcionados
  let query = "UPDATE usuarios SET ";
  let values = [];
  let setClauses = [];

  if (nombre_usuario !== undefined) {
    setClauses.push("nombre_usuario = ?");
    values.push(nombre_usuario);
  }

  if (correo_usuario !== undefined) {
    setClauses.push("correo_usuario = ?");
    values.push(correo_usuario);
  }

  if (telefono_usuario !== undefined) {
    setClauses.push("telefono_usuario = ?");
    values.push(telefono_usuario);
  }

  if (imagen_usuario !== undefined) {
    setClauses.push("imagen_usuario = ?");
    values.push(imagen_usuario);
  }

  setClauses.push("fecha_modificacion = CURRENT_TIMESTAMP");
  values.push(id_usuario);

  query += setClauses.join(", ") + " WHERE id_usuario = ? AND activo = true";

  const [result] = await pool.query(query, values);

  return result.affectedRows > 0;
};

// Desactivar usuario (soft delete)
export const deactivateUser = async (id_usuario) => {
  const [result] = await pool.query(
    "UPDATE usuarios SET activo = false WHERE id_usuario = ?",
    [id_usuario],
  );
  return result.affectedRows > 0;
};

// Obtener todos los usuarios con sus roles
export const getAllusuarios = async () => {
  const [rows] = await pool.query(
    `SELECT u.id_usuario, u.nombre_usuario, u.correo_usuario, u.telefono_usuario, 
            u.imagen_usuario, u.fecha_registro, u.fecha_modificacion, u.id_rol, r.nombre_rol
     FROM usuarios u 
     JOIN roles r ON u.id_rol = r.id_rol 
     WHERE u.activo = true`,
  );
  return rows;
};

// Obtener usuario por ID
export const getusuarioById = async (id_usuario) => {
  const [rows] = await pool.query(
    "SELECT id_usuario, nombre_usuario, correo_usuario, telefono_usuario, imagen_usuario, fecha_registro, fecha_modificacion FROM usuarios WHERE id_usuario = ? AND activo = true",
    [id_usuario],
  );
  return rows.length > 0 ? rows[0] : null;
};

// Generar token de recuperación de contraseña
export const generatePasswordResetToken = async (correo_usuario) => {
  const [rows] = await pool.query(
    "SELECT * FROM usuarios WHERE correo_usuario = ? AND activo = true",
    [correo_usuario],
  );

  if (!rows.length) {
    throw new Error("usuario no encontrado");
  }

  const user = rows[0];
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

  await pool.query(
    "UPDATE usuarios SET reset_token = ?, reset_token_expiry = ? WHERE id_usuario = ?",
    [resetToken, resetTokenExpiry, user.id_usuario],
  );

  return { resetToken, user };
};

// Verificar token de recuperación
export const verifyResetToken = async (token) => {
  const [rows] = await pool.query(
    "SELECT * FROM usuarios WHERE reset_token = ? AND reset_token_expiry > NOW() AND activo = true",
    [token],
  );

  return rows.length > 0 ? rows[0] : null;
};

// Actualizar contraseña
export const updatePassword = async (id_usuario, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const [result] = await pool.query(
    `UPDATE usuarios 
         SET contraseña_usuario = ?, 
             reset_token = NULL, 
             reset_token_expiry = NULL,
             fecha_modificacion = CURRENT_TIMESTAMP
         WHERE id_usuario = ? AND activo = true`,
    [hashedPassword, id_usuario],
  );

  return result.affectedRows > 0;
};

// Obtener todos los roles
export const getAllRoles = async () => {
  const [rows] = await pool.query(
    "SELECT id_rol, nombre_rol FROM roles ORDER BY id_rol",
  );
  return rows;
};

// Actualizar rol de usuario
export const updateUserRole = async (id_usuario, id_rol) => {
  const [result] = await pool.query(
    "UPDATE usuarios SET id_rol = ?, fecha_modificacion = CURRENT_TIMESTAMP WHERE id_usuario = ? AND activo = true",
    [id_rol, id_usuario],
  );
  return result.affectedRows > 0;
};
