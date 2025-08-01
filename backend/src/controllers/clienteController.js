import * as userModel from "../models/userModel.js";
import validator from "validator";
import { passwordStrength } from "check-password-strength";

// Función helper para validar fortaleza de contraseña
const validatePasswordStrength = (password) => {
  const result = passwordStrength(password);

  // Configuración mínima requerida
  const minRequiredStrength = 2; // 0: Too weak, 1: Weak, 2: Medium, 3: Strong

  if (result.id < minRequiredStrength) {
    const suggestions = [];

    if (password.length < 8) {
      suggestions.push("debe tener al menos 8 caracteres");
    }
    if (!/[a-z]/.test(password)) {
      suggestions.push("debe incluir al menos una letra minúscula");
    }
    if (!/[A-Z]/.test(password)) {
      suggestions.push("debe incluir al menos una letra mayúscula");
    }
    if (!/\d/.test(password)) {
      suggestions.push("debe incluir al menos un número");
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      suggestions.push("debe incluir al menos un carácter especial");
    }

    return {
      isValid: false,
      message: `La contraseña es demasiado débil. ${suggestions.join(", ")}.`,
      strength: result.value,
      suggestions: suggestions,
    };
  }

  return {
    isValid: true,
    strength: result.value,
    score: result.id,
  };
};

// Obtener todos los clientes
export const getAllClientes = async (req, res) => {
  try {
    const clientes = await userModel.getAllClientes();
    res.json(clientes);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({
      message: "Error al obtener la lista de clientes",
    });
  }
};

// Obtener cliente por ID
export const getClienteById = async (req, res) => {
  try {
    const cliente = await userModel.getClienteById(req.params.id);

    if (!cliente) {
      return res.status(404).json({
        message: "Cliente no encontrado",
      });
    }

    res.json(cliente);
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    res.status(500).json({
      message: "Error al obtener el cliente",
    });
  }
};

// Obtener cliente por User ID
export const getClienteByUserId = async (req, res) => {
  try {
    const cliente = await userModel.getClienteByUserId(req.params.userId);

    if (!cliente) {
      return res.status(404).json({
        message: "Cliente no encontrado",
      });
    }

    res.json(cliente);
  } catch (error) {
    console.error("Error al obtener cliente por user ID:", error);
    res.status(500).json({
      message: "Error al obtener el cliente",
    });
  }
};

// Obtener perfil del cliente autenticado
export const getClienteProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const cliente = await userModel.getClienteByUserId(userId);

    if (!cliente) {
      return res.status(404).json({
        message: "Cliente no encontrado",
      });
    }

    res.json(cliente);
  } catch (error) {
    console.error("Error al obtener perfil del cliente:", error);
    res.status(500).json({
      message: "Error al obtener el perfil del cliente",
    });
  }
};

// Actualizar cliente (solo datos básicos)
export const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, telefono, direccion } = req.body;

    // Validar teléfono si se proporciona
    if (telefono && !validator.matches(telefono, /^\d{10}$/)) {
      return res.status(400).json({
        message: "El teléfono debe tener 10 dígitos",
      });
    }

    // Obtener cliente actual para verificar que existe
    const cliente = await userModel.getClienteById(id);
    if (!cliente) {
      return res.status(404).json({
        message: "Cliente no encontrado",
      });
    }

    // Actualizar usuario en la tabla users
    const success = await userModel.updateUser(cliente.id_user, {
      email: cliente.email, // Mantener email actual
      nombre,
      apellido,
      telefono,
      direccion,
    });

    if (!success) {
      return res.status(400).json({
        message: "Error al actualizar el cliente",
      });
    }

    res.json({
      message: "Cliente actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res.status(500).json({
      message: "Error al actualizar el cliente",
    });
  }
};

// Actualizar perfil del cliente autenticado
export const updateClienteProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nombre, apellido, telefono, direccion } = req.body;

    // Validar teléfono si se proporciona
    if (telefono && !validator.matches(telefono, /^\d{10}$/)) {
      return res.status(400).json({
        message: "El teléfono debe tener 10 dígitos",
      });
    }

    // Obtener datos actuales del usuario
    const currentUser = await userModel.getUserById(userId);
    if (!currentUser) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    // Actualizar usuario
    const success = await userModel.updateUser(userId, {
      email: currentUser.email, // Mantener email actual
      nombre,
      apellido,
      telefono,
      direccion,
    });

    if (!success) {
      return res.status(400).json({
        message: "Error al actualizar el perfil",
      });
    }

    res.json({
      message: "Perfil actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar perfil del cliente:", error);
    res.status(500).json({
      message: "Error al actualizar el perfil",
    });
  }
};

// Desactivar cliente (soft delete)
export const deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener cliente para verificar que existe
    const cliente = await userModel.getClienteById(id);
    if (!cliente) {
      return res.status(404).json({
        message: "Cliente no encontrado",
      });
    }

    // Desactivar usuario
    const success = await userModel.deactivateUser(cliente.id_user);

    if (!success) {
      return res.status(400).json({
        message: "Error al desactivar el cliente",
      });
    }

    res.json({
      message: "Cliente desactivado exitosamente",
    });
  } catch (error) {
    console.error("Error al desactivar cliente:", error);
    res.status(500).json({
      message: "Error al desactivar el cliente",
    });
  }
};

// Activar cliente
export const activateCliente = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener cliente para verificar que existe
    const cliente = await userModel.getClienteById(id);
    if (!cliente) {
      return res.status(404).json({
        message: "Cliente no encontrado",
      });
    }

    // Activar usuario
    const success = await userModel.activateUser(cliente.id_user);

    if (!success) {
      return res.status(400).json({
        message: "Error al activar el cliente",
      });
    }

    res.json({
      message: "Cliente activado exitosamente",
    });
  } catch (error) {
    console.error("Error al activar cliente:", error);
    res.status(500).json({
      message: "Error al activar el cliente",
    });
  }
};

// Crear nuevo cliente (solo para administradores)
export const createCliente = async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, contraseña } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !contraseña) {
      return res.status(400).json({
        message: "Nombre, email y contraseña son obligatorios",
      });
    }

    // Validar correo
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Correo no válido",
      });
    }

    // Validar teléfono si se proporciona
    if (telefono && !validator.matches(telefono, /^\d{10}$/)) {
      return res.status(400).json({
        message: "El teléfono debe tener 10 dígitos",
      });
    }

    // Validar contraseña
    const passwordValidation = validatePasswordStrength(contraseña);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        message: passwordValidation.message,
      });
    }

    // Crear cliente
    const userId = await userModel.createUser({
      email,
      password: contraseña,
      nombre,
      apellido,
      telefono,
      tipo_usuario: "cliente",
    });

    res.status(201).json({
      message: "Cliente creado exitosamente",
      userId,
    });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    res.status(400).json({
      message: error.message || "Error al crear el cliente",
    });
  }
};

// Buscar clientes por término de búsqueda
export const searchClientes = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        message: "El término de búsqueda debe tener al menos 2 caracteres",
      });
    }

    // Obtener todos los clientes y filtrar por término de búsqueda
    const allClientes = await userModel.getAllClientes();
    const filteredClientes = allClientes.filter(
      (cliente) =>
        cliente.nombre.toLowerCase().includes(q.toLowerCase()) ||
        cliente.email.toLowerCase().includes(q.toLowerCase()) ||
        (cliente.apellido &&
          cliente.apellido.toLowerCase().includes(q.toLowerCase())) ||
        (cliente.telefono && cliente.telefono.includes(q)),
    );

    res.json({
      clientes: filteredClientes,
      total: filteredClientes.length,
    });
  } catch (error) {
    console.error("Error al buscar clientes:", error);
    res.status(500).json({
      message: "Error al buscar clientes",
    });
  }
};

// Obtener estadísticas de clientes
export const getClienteStats = async (req, res) => {
  try {
    const stats = await userModel.getUserStats();
    const clienteStats = stats.find((stat) => stat.tipo_usuario === "cliente");

    if (!clienteStats) {
      return res.json({
        total: 0,
        activos: 0,
        verificados: 0,
      });
    }

    res.json({
      total: clienteStats.total,
      activos: clienteStats.activos,
      verificados: clienteStats.verificados,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas de clientes:", error);
    res.status(500).json({
      message: "Error al obtener estadísticas",
    });
  }
};

// Obtener clientes recientes
export const getRecentClientes = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const recentUsers = await userModel.getRecentUsers(parseInt(limit));

    // Filtrar solo clientes
    const recentClientes = recentUsers.filter(
      (user) => user.tipo_usuario === "cliente",
    );

    res.json(recentClientes);
  } catch (error) {
    console.error("Error al obtener clientes recientes:", error);
    res.status(500).json({
      message: "Error al obtener clientes recientes",
    });
  }
};
