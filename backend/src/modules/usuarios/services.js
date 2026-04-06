import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import * as queries from "./queries.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getAllUsersService = async () => {
  return await queries.getAllUsers();
};

export const getUserByIdService = async (id) => {
  const user = await queries.getUserById(id);
  if (!user) throw new Error("usuario no encontrado");
  return user;
};

/**
 * Administra el borrado físico de la foto vieja de existir,
 * y actualiza la fila nueva en la DB.
 *
 * @param {number} id - ID del usuario a modificar
 * @param {Object} updateData - Nombre, Correo, Tel.
 * @param {Object} file - Archivo Multer.
 */
export const updateUserService = async (id, updateData, file) => {
  // Si hay imagen suministrada mediante multer
  if (file) {
    updateData.imagen_usuario = file.filename;

    // Purga local del archivo físico previo
    const usuario = await queries.getUserById(id);
    if (usuario && usuario.imagen_usuario) {
      // Subir 4 niveles desde /backend/src/modules/usuarios/ hasta la raíz y luego a public/uploads
      const oldImagePath = path.join(
        __dirname,
        "../../../public/uploads",
        usuario.imagen_usuario,
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
  }

  const result = await queries.updateUser(id, updateData);
  if (!result) throw new Error("usuario no encontrado");
  return true;
};

export const deleteUserService = async (id) => {
  const result = await queries.deactivateUser(id);
  if (!result) throw new Error("usuario no encontrado");
  return true;
};

export const getAllRolesService = async () => {
  return await queries.getAllRoles();
};

/**
 * Verifica vigencia estructural y promueve/degrada al usuario.
 */
export const updateUserRoleService = async (idUsuario, idRol) => {
  if (!idRol || isNaN(idRol)) {
    throw new Error("ID de rol inválido:bad-request");
  }

  const usuario = await queries.getUserById(idUsuario);
  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  const roles = await queries.getAllRoles();
  const rolExiste = roles.some((rol) => rol.id_rol === parseInt(idRol));
  if (!rolExiste) {
    throw new Error("Rol no válido:bad-request");
  }

  const result = await queries.updateUserRole(idUsuario, idRol);
  if (!result) throw new Error("No se pudo actualizar el rol del usuario");
  return true;
};
import * as authService from "../auth/services.js";

/**
 * Busca un usuario por email o lo crea como invitado si no existe.
 * @param {Object} userData - Datos del usuario (nombre, email, telefono).
 * @returns {Promise<Object>} Usuario encontrado o creado.
 */
export const getOrCreateUserService = async (userData) => {
  const { nombre, email, telefono } = userData;

  let user = await queries.getUserByEmailIncludingUnverified(email);

  if (!user) {
    try {
      // Intentar registro silencioso con una contraseña temporal
      const newUserId = await authService.registerUserService({
        nombre_usuario: nombre,
        correo_usuario: email,
        telefono_usuario: telefono,
        contraseña_usuario:
          "temporal_password_for_reservation_" +
          Math.random().toString(36).slice(-8),
      });
      user = await queries.getUserByEmailIncludingUnverified(email);
    } catch (error) {
      // Si el error es por duplicado (carrera critica), intentar obtenerlo de nuevo
      if (error.message.includes("ya está registrado")) {
        user = await queries.getUserByEmailIncludingUnverified(email);
        if (!user) throw error;
      } else {
        throw error;
      }
    }
  }

  return user;
};
