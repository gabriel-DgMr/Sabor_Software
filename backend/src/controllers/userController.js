import * as userModel from '../models/userModel.js';
import validator from 'validator';

// ===== CONTROLADORES GENERALES =====

// Obtener perfil del usuario autenticado
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userModel.getUserCompleto(userId);

        if (!user) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        // No devolver información sensible
        const { password, reset_token, reset_token_expiry, ...userProfile } = user;

        res.json(userProfile);

    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            message: 'Error al obtener perfil de usuario'
        });
    }
};

// Actualizar perfil del usuario autenticado
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { nombre, apellido, telefono, direccion } = req.body;

        // Validar teléfono si se proporciona
        if (telefono && !validator.matches(telefono, /^\d{10}$/)) {
            return res.status(400).json({
                message: 'El teléfono debe tener 10 dígitos'
            });
        }

        // Obtener usuario actual para mantener el email
        const currentUser = await userModel.getUserById(userId);
        if (!currentUser) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        // Actualizar usuario
        const success = await userModel.updateUser(userId, {
            email: currentUser.email,
            nombre,
            apellido,
            telefono,
            direccion
        });

        if (!success) {
            return res.status(400).json({
                message: 'Error al actualizar perfil'
            });
        }

        res.json({
            message: 'Perfil actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({
            message: error.message || 'Error al actualizar perfil'
        });
    }
};

// Cambiar contraseña del usuario autenticado
export const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { contraseñaActual, nuevaContraseña } = req.body;

        if (!contraseñaActual || !nuevaContraseña) {
            return res.status(400).json({
                message: 'Contraseña actual y nueva contraseña son requeridas'
            });
        }

        // Validar nueva contraseña
        if (!validator.isStrongPassword(nuevaContraseña, {
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

        // Verificar contraseña actual
        const user = await userModel.getUserById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        // Verificar contraseña actual usando login
        try {
            await userModel.loginUser(user.email, contraseñaActual);
        } catch (error) {
            return res.status(400).json({
                message: 'Contraseña actual incorrecta'
            });
        }

        // Actualizar contraseña
        await userModel.updatePassword(userId, nuevaContraseña);

        res.json({
            message: 'Contraseña cambiada exitosamente'
        });

    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({
            message: 'Error al cambiar contraseña'
        });
    }
};

// ===== CONTROLADORES ADMINISTRATIVOS =====

// Obtener todos los usuarios (solo administradores)
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, tipo_usuario } = req.query;
        
        // Para simplicidad, obtener todos los usuarios recientes
        const users = await userModel.getRecentUsers(parseInt(limit) * parseInt(page));
        
        // Filtrar por tipo de usuario si se especifica
        let filteredUsers = users;
        if (tipo_usuario) {
            filteredUsers = users.filter(user => user.tipo_usuario === tipo_usuario);
        }

        res.json({
            users: filteredUsers,
            total: filteredUsers.length,
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            message: 'Error al obtener la lista de usuarios'
        });
    }
};

// Obtener usuario por ID (solo administradores)
export const getUserById = async (req, res) => {
    try {
        const user = await userModel.getUserCompleto(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        // No devolver información sensible
        const { password, reset_token, reset_token_expiry, ...userProfile } = user;

        res.json(userProfile);

    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            message: 'Error al obtener el usuario'
        });
    }
};

// Crear nuevo usuario (solo administradores)
export const createUser = async (req, res) => {
    try {
        const { 
            nombre, 
            apellido, 
            email, 
            telefono, 
            contraseña, 
            tipo_usuario, 
            direccion, 
            id_rol 
        } = req.body;

        // Validar campos requeridos
        if (!nombre || !email || !contraseña || !tipo_usuario) {
            return res.status(400).json({
                message: 'Nombre, email, contraseña y tipo de usuario son obligatorios'
            });
        }

        // Validar correo
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                message: 'Correo no válido'
            });
        }

        // Validar tipo de usuario
        if (!['cliente', 'empleado', 'administrador'].includes(tipo_usuario)) {
            return res.status(400).json({
                message: 'Tipo de usuario no válido'
            });
        }

        // Validar teléfono si se proporciona
        if (telefono && !validator.matches(telefono, /^\d{10}$/)) {
            return res.status(400).json({
                message: 'El teléfono debe tener 10 dígitos'
            });
        }

        // Validar contraseña
        if (!validator.isStrongPassword(contraseña, {
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

        // Crear usuario
        const userId = await userModel.createUser({
            email,
            password: contraseña,
            nombre,
            apellido,
            telefono,
            imagen: null,
            tipo_usuario,
            direccion,
            id_rol
        });

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            userId
        });

    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(400).json({
            message: error.message || 'Error al crear el usuario'
        });
    }
};

// Actualizar usuario (solo administradores)
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, telefono, direccion } = req.body;

        // Validar teléfono si se proporciona
        if (telefono && !validator.matches(telefono, /^\d{10}$/)) {
            return res.status(400).json({
                message: 'El teléfono debe tener 10 dígitos'
            });
        }

        // Obtener usuario actual
        const currentUser = await userModel.getUserById(id);
        if (!currentUser) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        // Actualizar usuario
        const success = await userModel.updateUser(id, {
            email: currentUser.email, // Mantener email actual
            nombre,
            apellido,
            telefono,
            direccion
        });

        if (!success) {
            return res.status(400).json({
                message: 'Error al actualizar el usuario'
            });
        }

        res.json({
            message: 'Usuario actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({
            message: 'Error al actualizar el usuario'
        });
    }
};

// Activar/Desactivar usuario (solo administradores)
export const toggleUserActive = async (req, res) => {
    try {
        const { id } = req.params;
        const { active } = req.body;

        const user = await userModel.getUserById(id);
        if (!user) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        const success = active 
            ? await userModel.activateUser(id)
            : await userModel.deactivateUser(id);

        if (!success) {
            return res.status(400).json({
                message: `Error al ${active ? 'activar' : 'desactivar'} el usuario`
            });
        }

        res.json({
            message: `Usuario ${active ? 'activado' : 'desactivado'} exitosamente`
        });

    } catch (error) {
        console.error('Error al cambiar estado del usuario:', error);
        res.status(500).json({
            message: 'Error al cambiar estado del usuario'
        });
    }
};

// Eliminar usuario (solo administradores)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const success = await userModel.deactivateUser(id);

        if (!success) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            message: 'Usuario eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({
            message: 'Error al eliminar el usuario'
        });
    }
};

// ===== CONTROLADORES ESPECÍFICOS PARA CLIENTES =====

// Obtener todos los clientes
export const getAllClientes = async (req, res) => {
    try {
        const clientes = await userModel.getAllClientes();
        res.json(clientes);
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({
            message: 'Error al obtener la lista de clientes'
        });
    }
};

// Obtener cliente por ID
export const getClienteById = async (req, res) => {
    try {
        const cliente = await userModel.getClienteById(req.params.id);
        
        if (!cliente) {
            return res.status(404).json({
                message: 'Cliente no encontrado'
            });
        }

        res.json(cliente);
    } catch (error) {
        console.error('Error al obtener cliente:', error);
        res.status(500).json({
            message: 'Error al obtener el cliente'
        });
    }
};

// Crear nuevo cliente
export const createCliente = async (req, res) => {
    try {
        const { nombre, apellido, email, telefono, contraseña } = req.body;

        // Validar campos requeridos
        if (!nombre || !email || !contraseña) {
            return res.status(400).json({
                message: 'Nombre, email y contraseña son obligatorios'
            });
        }

        // Crear cliente usando la función general de crear usuario
        const userId = await userModel.createUser({
            email,
            password: contraseña,
            nombre,
            apellido,
            telefono,
            tipo_usuario: 'cliente'
        });

        res.status(201).json({
            message: 'Cliente creado exitosamente',
            userId
        });

    } catch (error) {
        console.error('Error al crear cliente:', error);
        res.status(400).json({
            message: error.message || 'Error al crear el cliente'
        });
    }
};

// Actualizar cliente
export const updateCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, telefono, direccion } = req.body;

        // Obtener cliente actual
        const cliente = await userModel.getClienteById(id);
        if (!cliente) {
            return res.status(404).json({
                message: 'Cliente no encontrado'
            });
        }

        // Actualizar usuario
        const success = await userModel.updateUser(cliente.id_user, {
            email: cliente.email,
            nombre,
            apellido,
            telefono,
            direccion
        });

        if (!success) {
            return res.status(400).json({
                message: 'Error al actualizar el cliente'
            });
        }

        res.json({
            message: 'Cliente actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        res.status(500).json({
            message: 'Error al actualizar el cliente'
        });
    }
};

// Buscar clientes
export const searchClientes = async (req, res) => {
    try {
        const { term } = req.params;
        
        if (!term || term.trim().length < 2) {
            return res.status(400).json({
                message: 'El término de búsqueda debe tener al menos 2 caracteres'
            });
        }

        const allClientes = await userModel.getAllClientes();
        const filteredClientes = allClientes.filter(cliente => 
            cliente.nombre.toLowerCase().includes(term.toLowerCase()) ||
            cliente.email.toLowerCase().includes(term.toLowerCase()) ||
            (cliente.apellido && cliente.apellido.toLowerCase().includes(term.toLowerCase())) ||
            (cliente.telefono && cliente.telefono.includes(term))
        );

        res.json({
            clientes: filteredClientes,
            total: filteredClientes.length
        });

    } catch (error) {
        console.error('Error al buscar clientes:', error);
        res.status(500).json({
            message: 'Error al buscar clientes'
        });
    }
};

// Obtener estadísticas de clientes
export const getClienteStats = async (req, res) => {
    try {
        const stats = await userModel.getUserStats();
        const clienteStats = stats.find(stat => stat.tipo_usuario === 'cliente');
        
        res.json(clienteStats || { total: 0, activos: 0, verificados: 0 });

    } catch (error) {
        console.error('Error al obtener estadísticas de clientes:', error);
        res.status(500).json({
            message: 'Error al obtener estadísticas'
        });
    }
};

// ===== CONTROLADORES ESPECÍFICOS PARA EMPLEADOS =====

// Obtener todos los empleados
export const getAllEmpleados = async (req, res) => {
    try {
        const empleados = await userModel.getAllEmpleados();
        res.json(empleados);
    } catch (error) {
        console.error('Error al obtener empleados:', error);
        res.status(500).json({
            message: 'Error al obtener la lista de empleados'
        });
    }
};

// Obtener empleado por ID
export const getEmpleadoById = async (req, res) => {
    try {
        const empleado = await userModel.getEmpleadoById(req.params.id);
        
        if (!empleado) {
            return res.status(404).json({
                message: 'Empleado no encontrado'
            });
        }

        res.json(empleado);
    } catch (error) {
        console.error('Error al obtener empleado:', error);
        res.status(500).json({
            message: 'Error al obtener el empleado'
        });
    }
};

// Crear nuevo empleado
export const createEmpleado = async (req, res) => {
    try {
        const { 
            nombre, 
            apellido, 
            email, 
            telefono, 
            contraseña, 
            direccion, 
            id_rol 
        } = req.body;

        // Validar campos requeridos
        if (!nombre || !email || !contraseña || !id_rol) {
            return res.status(400).json({
                message: 'Nombre, email, contraseña y rol son obligatorios'
            });
        }

        // Crear empleado
        const userId = await userModel.createUser({
            email,
            password: contraseña,
            nombre,
            apellido,
            telefono,
            tipo_usuario: 'empleado',
            direccion,
            id_rol
        });

        res.status(201).json({
            message: 'Empleado creado exitosamente',
            userId
        });

    } catch (error) {
        console.error('Error al crear empleado:', error);
        res.status(400).json({
            message: error.message || 'Error al crear el empleado'
        });
    }
};

// Actualizar empleado
export const updateEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, telefono, direccion } = req.body;

        // Obtener empleado actual
        const empleado = await userModel.getEmpleadoById(id);
        if (!empleado) {
            return res.status(404).json({
                message: 'Empleado no encontrado'
            });
        }

        // Actualizar usuario
        const success = await userModel.updateUser(empleado.id_user, {
            email: empleado.email,
            nombre,
            apellido,
            telefono,
            direccion
        });

        if (!success) {
            return res.status(400).json({
                message: 'Error al actualizar el empleado'
            });
        }

        res.json({
            message: 'Empleado actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error al actualizar empleado:', error);
        res.status(500).json({
            message: 'Error al actualizar el empleado'
        });
    }
};

// Buscar empleados
export const searchEmpleados = async (req, res) => {
    try {
        const { term } = req.params;
        
        if (!term || term.trim().length < 2) {
            return res.status(400).json({
                message: 'El término de búsqueda debe tener al menos 2 caracteres'
            });
        }

        const allEmpleados = await userModel.getAllEmpleados();
        const filteredEmpleados = allEmpleados.filter(empleado => 
            empleado.nombre.toLowerCase().includes(term.toLowerCase()) ||
            empleado.email.toLowerCase().includes(term.toLowerCase()) ||
            (empleado.apellido && empleado.apellido.toLowerCase().includes(term.toLowerCase())) ||
            (empleado.telefono && empleado.telefono.includes(term)) ||
            empleado.nombre_rol.toLowerCase().includes(term.toLowerCase())
        );

        res.json({
            empleados: filteredEmpleados,
            total: filteredEmpleados.length
        });

    } catch (error) {
        console.error('Error al buscar empleados:', error);
        res.status(500).json({
            message: 'Error al buscar empleados'
        });
    }
};

// Obtener estadísticas de empleados
export const getEmpleadoStats = async (req, res) => {
    try {
        const stats = await userModel.getUserStats();
        const empleadoStats = stats.filter(stat => 
            stat.tipo_usuario === 'empleado' || stat.tipo_usuario === 'administrador'
        );
        
        const totalStats = empleadoStats.reduce((acc, stat) => ({
            total: acc.total + stat.total,
            activos: acc.activos + stat.activos,
            verificados: acc.verificados + stat.verificados
        }), { total: 0, activos: 0, verificados: 0 });

        res.json(totalStats);

    } catch (error) {
        console.error('Error al obtener estadísticas de empleados:', error);
        res.status(500).json({
            message: 'Error al obtener estadísticas'
        });
    }
};

// ===== CONTROLADORES ADICIONALES =====

// Obtener usuarios recientes
export const getRecentUsers = async (req, res) => {
    try {
        const { limit } = req.params;
        const users = await userModel.getRecentUsers(parseInt(limit) || 10);
        res.json(users);
    } catch (error) {
        console.error('Error al obtener usuarios recientes:', error);
        res.status(500).json({
            message: 'Error al obtener usuarios recientes'
        });
    }
};

// Obtener estadísticas públicas
export const getPublicStats = async (req, res) => {
    try {
        const stats = await userModel.getUserStats();
        
        // Solo devolver estadísticas básicas sin información sensible
        const publicStats = {
            total_usuarios: stats.reduce((sum, stat) => sum + stat.total, 0),
            usuarios_activos: stats.reduce((sum, stat) => sum + stat.activos, 0)
        };

        res.json(publicStats);

    } catch (error) {
        console.error('Error al obtener estadísticas públicas:', error);
        res.status(500).json({
            message: 'Error al obtener estadísticas'
        });
    }
};

// Exportar usuarios (placeholder)
export const exportUsers = async (req, res) => {
    try {
        res.status(501).json({
            message: 'Funcionalidad de exportación en desarrollo'
        });
    } catch (error) {
        console.error('Error al exportar usuarios:', error);
        res.status(500).json({
            message: 'Error al exportar usuarios'
        });
    }
};

// Importar usuarios (placeholder)
export const importUsers = async (req, res) => {
    try {
        res.status(501).json({
            message: 'Funcionalidad de importación en desarrollo'
        });
    } catch (error) {
        console.error('Error al importar usuarios:', error);
        res.status(500).json({
            message: 'Error al importar usuarios'
        });
    }
};

// Obtener log de auditoría (placeholder)
export const getUserAuditLog = async (req, res) => {
    try {
        res.status(501).json({
            message: 'Funcionalidad de auditoría en desarrollo'
        });
    } catch (error) {
        console.error('Error al obtener log de auditoría:', error);
        res.status(500).json({
            message: 'Error al obtener log de auditoría'
        });
    }
};

// Obtener actividad del usuario (placeholder)
export const getUserActivity = async (req, res) => {
    try {
        res.status(501).json({
            message: 'Funcionalidad de actividad en desarrollo'
        });
    } catch (error) {
        console.error('Error al obtener actividad del usuario:', error);
        res.status(500).json({
            message: 'Error al obtener actividad del usuario'
        });
    }
}; 