import * as usuarioService from "./services.js";
import logger from "../../core/utils/logger.js";

/**
 * Obtiene toda la lista de usuarios.
 */
export const getAllusuarios = async (req, res) => {
  try {
    const usuarios = await usuarioService.getAllUsersService();
    res.json(usuarios);
  } catch (error) {
    logger.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error al obtener la lista de usuarios" });
  }
};

/**
 * Pide un único usuario por ID numérico.
 */
export const getusuarioById = async (req, res) => {
  try {
    const usuario = await usuarioService.getUserByIdService(req.params.id);
    res.json(usuario);
  } catch (error) {
    logger.error("Error al obtener usuario:", error);
    res
      .status(error.message === "usuario no encontrado" ? 404 : 500)
      .json({ message: error.message });
  }
};

/**
 * Crea un nuevo usuario desde el panel de administración.
 */
export const crearUsuario = async (req, res) => {
  try {
    const userData = {
      nombre_usuario: req.body.nombre_usuario,
      correo_usuario: req.body.correo_usuario,
      telefono_usuario: req.body.telefono_usuario,
      contraseña_usuario: req.body.contraseña_usuario,
      id_rol: req.body.id_rol,
    };

    await usuarioService.createUserService(userData);
    res.status(201).json({ message: "Usuario creado exitosamente" });
  } catch (error) {
    logger.error("Error al crear usuario:", error);
    if (error.message.includes("ya está registrado")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Error al crear el usuario" });
  }
};

/**
 * Actualiza nombre, correo, teléfono y opcionalmente imagen o rol del usuario.
 */
export const updateusuario = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      nombre_usuario: req.body.nombre_usuario,
      correo_usuario: req.body.correo_usuario,
      telefono_usuario: req.body.telefono_usuario,
    };

    // Si es administrador, permite actualizar el rol en la misma petición
    if (req.user.rol === "Administrador" && req.body.id_rol) {
      updateData.id_rol = req.body.id_rol;
    }

    await usuarioService.updateUserService(id, updateData, req.file);
    res.json({ message: "usuario actualizado exitosamente" });
  } catch (error) {
    logger.error("Error al actualizar usuario:", error);
    res
      .status(error.message === "usuario no encontrado" ? 404 : 500)
      .json({ message: error.message });
  }
};

/**
 * Borrado blando de la base de datos (desactivar).
 */
export const deleteusuario = async (req, res) => {
  try {
    await usuarioService.deleteUserService(req.params.id);
    res.json({ message: "usuario eliminado exitosamente" });
  } catch (error) {
    logger.error("Error al eliminar usuario:", error);
    res
      .status(error.message === "usuario no encontrado" ? 404 : 500)
      .json({ message: error.message });
  }
};

/**
 * Lista todos los roles disponibles (ej. Administrador, Usuario, etc).
 */
export const getAllRoles = async (req, res) => {
  try {
    const roles = await usuarioService.getAllRolesService();
    res.json(roles);
  } catch (error) {
    logger.error("Error al obtener roles:", error);
    res.status(500).json({ message: "Error al obtener la lista de roles" });
  }
};

/**
 * Setea o transmuta el rol dado su ID de un usuario por su PK.
 */
export const actualizarRolUsuario = async (req, res) => {
  try {
    await usuarioService.updateUserRoleService(req.params.id, req.body.id_rol);
    res.json({ message: "Rol de usuario actualizado exitosamente" });
  } catch (error) {
    logger.error("Error al actualizar rol de usuario:", error);
    if (error.message.includes(":bad-request")) {
      return res.status(400).json({ message: error.message.split(":")[0] });
    }
    if (error.message === "Usuario no encontrado") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Error al actualizar el rol del usuario" });
  }
};
