import * as authModel from '../models/authModel.js';
import validator from 'validator';
// Obtener todos los clientes
export const getAllClientes = async (req, res) => {
    try {
        const clientes = await authModel.getAllClientes();
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
        const cliente = await authModel.getClienteById(req.params.id);
        
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

// Actualizar cliente
export const updateCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_cliente, email_cliente, telefono_cliente } = req.body;
        console.log('Datos recibidos:', { id, nombre_cliente, email_cliente, telefono_cliente }); // <-- Agrega esto
        // Validar campos requeridos
        if (!nombre_cliente || !email_cliente || !telefono_cliente) {
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

        // Validar teléfono
        if (!validator.matches(telefono_cliente, /^\d{10}$/)) {
            return res.status(400).json({
                message: 'El teléfono debe tener 10 dígitos'
            });
        }

        const success = await authModel.updateUser(id, {
            nombre_cliente,
            email_cliente,
            telefono_cliente
        });

        if (!success) {
            return res.status(404).json({
                message: 'Cliente no encontrado'
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

// Eliminar cliente (soft delete)
export const deleteCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await authModel.deactivateUser(id);

        if (!success) {
            return res.status(404).json({
                message: 'Cliente no encontrado'
            });
        }

        res.json({
            message: 'Cliente eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        res.status(500).json({
            message: 'Error al eliminar el cliente'
        });
    }
}; 