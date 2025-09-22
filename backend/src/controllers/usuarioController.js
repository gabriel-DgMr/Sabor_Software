import * as authModel from "../models/authModel.js";
import validator from "validator";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Obtener todos los usuarios
export const getAllusuarios = async (req, res) => {
  try {
    const usuarios = await authModel.getAllusuarios();
    res.json(usuarios);
  } catch (error) {
    console.error("Error al obtener     s:", error);
    res.status(500).json({
      message: "Error al obtener la lista de usuarios",
    });
  }
};

// Obtener usuario por ID
export const getusuarioById = async (req, res) => {
  try {
    const usuario = await authModel.getusuarioById(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        message: "usuario no encontrado",
      });
    }

    res.json(usuario);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({
      message: "Error al obtener el usuario",
    });
  }
};

// Actualizar usuario
export const updateusuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_usuario, correo_usuario, telefono_usuario } = req.body;

    // Preparar datos para actualizar
    const updateData = {
      nombre_usuario,
      correo_usuario,
      telefono_usuario,
    };

    // Si hay una imagen, agregarla a los datos de actualización
    if (req.file) {
      updateData.imagen_usuario = req.file.filename;

      // Eliminar imagen anterior si existe
      const usuario = await authModel.getusuarioById(id);
      if (usuario && usuario.imagen_usuario) {
        const oldImagePath = path.join(
          __dirname,
          "../../public/uploads",
          usuario.imagen_usuario,
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const success = await authModel.updateUser(id, updateData);

    if (!success) {
      return res.status(404).json({
        message: "usuario no encontrado",
      });
    }

    res.json({
      message: "usuario actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({
      message: "Error al actualizar el usuario",
    });
  }
};

// Eliminar usuario (soft delete)
export const deleteusuario = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await authModel.deactivateUser(id);

    if (!success) {
      return res.status(404).json({
        message: "usuario no encontrado",
      });
    }

    res.json({
      message: "usuario eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({
      message: "Error al eliminar el usuario",
    });
  }
};

// Obtener todos los roles
export const getAllRoles = async (req, res) => {
  try {
    const roles = await authModel.getAllRoles();
    res.json(roles);
  } catch (error) {
    console.error("Error al obtener roles:", error);
    res.status(500).json({
      message: "Error al obtener la lista de roles",
    });
  }
};

// Actualizar rol de usuario
export const actualizarRolUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_rol } = req.body;

    // Validar que el id_rol sea válido
    if (!id_rol || isNaN(id_rol)) {
      return res.status(400).json({
        message: "ID de rol inválido",
      });
    }

    // Verificar que el usuario existe
    const usuario = await authModel.getusuarioById(id);
    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    // Verificar que el rol existe
    const roles = await authModel.getAllRoles();
    const rolExiste = roles.some((rol) => rol.id_rol === parseInt(id_rol));
    if (!rolExiste) {
      return res.status(400).json({
        message: "Rol no válido",
      });
    }

    // Actualizar el rol
    const success = await authModel.updateUserRole(id, id_rol);

    if (!success) {
      return res.status(404).json({
        message: "No se pudo actualizar el rol del usuario",
      });
    }

    res.json({
      message: "Rol de usuario actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar rol de usuario:", error);
    res.status(500).json({
      message: "Error al actualizar el rol del usuario",
    });
  }
};
