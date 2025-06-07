import { reservaModel } from '../models/reservaModel.js'; // Importar el nuevo modelo de reserva
import * as authModel from '../models/authModel.js'; // Importar authModel para manejar clientes

/** 
 * Maneja la solicitud para crear una nueva reserva.
 * @param {Object} req - El objeto de solicitud de Express.
 * @param {Object} res - El objeto de respuesta de Express.
 */
export const hacerReserva = async (req, res) => {
  const datosReserva = req.body;
  console.log('Datos de reserva recibidos para validación y creación:', datosReserva);

  const errors = {};

  if (!datosReserva.personas || typeof datosReserva.personas !== 'number' || datosReserva.personas <= 0) {
    errors.personas = 'La cantidad de personas debe ser un número positivo.';
  }

  if (!datosReserva.fecha || typeof datosReserva.fecha !== 'string' || datosReserva.fecha.trim() === '') {
    errors.fecha = 'La fecha es obligatoria.';
  }

  if (!datosReserva.hora || typeof datosReserva.hora !== 'string' || datosReserva.hora.trim() === '') {
    errors.hora = 'La hora es obligatoria.';
  }

  if (!datosReserva.nombre || typeof datosReserva.nombre !== 'string' || datosReserva.nombre.trim() === '') {
    errors.nombre = 'El nombre es obligatorio.';
  }
  if (!datosReserva.telefono || typeof datosReserva.telefono !== 'string' || datosReserva.telefono.trim() === '') {
    errors.telefono = 'El teléfono es obligatorio.';
  } else if (!/^\d{10}$/.test(datosReserva.telefono.trim())) { // Validación simple de 10 dígitos
    errors.telefono = 'El teléfono debe tener 10 dígitos.';
  }
  if (!datosReserva.email || typeof datosReserva.email !== 'string' || datosReserva.email.trim() === '') {
    errors.email = 'El correo electrónico es obligatorio.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosReserva.email.trim())) { // Validación básica de email
    errors.email = 'El formato del correo electrónico no es válido.';
  }

  // Si hay errores de validación, enviar respuesta 400
  if (Object.keys(errors).length > 0) {
    console.log('Errores de validación:', errors);
    return res.status(400).json({ message: 'Error en los datos de la reserva.', errors });
  }

  try {
    // 1. Buscar cliente por email
    let cliente = await authModel.getUserByEmail(datosReserva.email);

    // 2. Si el cliente no existe, crearlo
    if (!cliente) {
      console.log('Cliente no encontrado, creando nuevo...');
      const nuevoClienteId = await authModel.registerUser({
        nombre_cliente: datosReserva.nombre,
        email_cliente: datosReserva.email,
        telefono_cliente: datosReserva.telefono,
        // Nota: Aquí no tenemos la contraseña, puede que necesites ajustarlo
        // dependiendo de si los clientes deben registrarse completamente antes de reservar.
        // Por ahora, asumiremos que se puede crear un cliente básico sin contraseña para reservas.
        contraseña_cliente: 'temporal_password_for_reservation' // Considerar un manejo adecuado
      });
      // Obtener el objeto cliente recién creado para obtener el id
      cliente = await authModel.getUserByEmail(datosReserva.email);
      if (!cliente) {
        throw new Error('Error al obtener el cliente recién creado.');
      }
      console.log('Cliente creado con ID:', cliente.id_cliente);
    }

    const id_cliente = cliente.id_cliente;

    // Usar el nuevo modelo para crear la reserva en la base de datos MySQL
    // Pasar id_cliente en lugar de nombre, telefono, email
    const reservaId = await reservaModel.createReserva({
      id_cliente: id_cliente,
      personas: datosReserva.personas,
      fecha: datosReserva.fecha,
      hora: datosReserva.hora,
      peticiones: datosReserva.peticiones
    });

    console.log('Reserva guardada con éxito con ID:', reservaId);

    res.status(201).json({ message: 'Reserva creada con éxito!', reservaId: reservaId });
  } catch (error) {
    console.error('Error al guardar la reserva:', error);
    if (error.message.includes('No hay disponibilidad')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error interno del servidor al crear la reserva.' });
  }
};

// Obtener horarios disponibles para una fecha
export const getHorariosDisponibles = async (req, res) => {
    try {
        const { fecha } = req.query;
        
        if (!fecha) {
            return res.status(400).json({ 
                message: 'Se requiere la fecha para obtener los horarios disponibles' 
            });
        }

        const horariosDisponibles = await reservaModel.getHorariosDisponibles(fecha);
        res.json({ horariosDisponibles });
    } catch (error) {
        console.error('Error al obtener horarios disponibles:', error);
        res.status(500).json({ message: 'Error al obtener horarios disponibles' });
    }
};

// Verificar disponibilidad específica
export const checkDisponibilidad = async (req, res) => {
    try {
        const { fecha, hora } = req.query;
        
        if (!fecha || !hora) {
            return res.status(400).json({ 
                message: 'Se requieren fecha y hora para verificar disponibilidad' 
            });
        }

        const disponible = await reservaModel.checkDisponibilidad(fecha, hora);
        res.json({ disponible });
    } catch (error) {
        console.error('Error al verificar disponibilidad:', error);
        res.status(500).json({ message: 'Error al verificar disponibilidad' });
    }
}; 