import { dbConfig } from '../config/dbconfig.js';
import mysql from 'mysql2/promise';

const pool = mysql.createPool(dbConfig);

// Horarios disponibles (Esto parece que ya no se usa con la nueva lógica)
// const HORARIOS_DISPONIBLES = [
//     '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
// ];

// Máximo de reservas por hora (Esta constante parece estar obsoleta con la nueva lógica que usa capacidad_maxima de la DB)
// const MAX_RESERVAS_POR_HORA = 4;

export const reservaModel = {
  /**
   * Crea una nueva reserva en la base de datos.
   * @param {Object} reservaData - Los datos de la reserva (ahora incluye id_cliente).
   * @returns {Promise<number>} El ID de la reserva insertada.
   */
  createReserva: async (reservaData) => {
    try {
      const { id_cliente, numero_personas, fecha_reservacion, hora_reservacion, notas } = reservaData;

      // Validar que el cliente no tenga ya una reserva para ese horario
      const [yaReservado] = await pool.query(
        'SELECT id_reservacion FROM reservaciones WHERE id_cliente = ? AND fecha_reservacion = ? AND hora_reservacion = ?',
        [id_cliente, fecha_reservacion, hora_reservacion]
      );
      if (yaReservado.length > 0) {
        throw new Error('Ya tienes una reservación para ese horario.');
      }

      // Buscar una mesa disponible para la fecha y hora
      const [mesas] = await pool.query('SELECT id_mesa FROM mesas');
      const [ocupadas] = await pool.query(
        'SELECT id_mesa FROM reservaciones WHERE fecha_reservacion = ? AND hora_reservacion = ?',
        [fecha_reservacion, hora_reservacion]
      );
      const ocupadasSet = new Set(ocupadas.map(r => r.id_mesa));
      const mesaLibre = mesas.find(m => !ocupadasSet.has(m.id_mesa));
      if (!mesaLibre) {
        throw new Error('No hay mesas disponibles para la fecha y hora seleccionada');
      }
      const id_mesa = mesaLibre.id_mesa;

      // Verificar disponibilidad general (capacidad máxima del local)
      const disponible = await reservaModel.checkDisponibilidad(fecha_reservacion, hora_reservacion);
      if (!disponible) {
        throw new Error('No hay disponibilidad para la fecha y hora seleccionada');
      }

      const [result] = await pool.query(
        'INSERT INTO reservaciones (id_cliente, numero_personas, fecha_reservacion, hora_reservacion, notas, id_mesa, id_estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id_cliente, numero_personas, fecha_reservacion, hora_reservacion, notas, id_mesa, 1]
      );

      return result.insertId;
    } catch (error) {
      console.error('Error en reservaModel.createReserva:', error);
      throw new Error('Error al crear la reserva: ' + error.message);
    }
  },

  // Obtener horarios disponibles para una fecha específica (Esta función parece estar duplicada/obsoleta en favor de horarioModel)
  // getHorariosDisponibles: async (fecha) => {
  //   try {
  //     // Obtener todas las reservas para la fecha
  //     const [reservas] = await pool.query(
  //       'SELECT hora_reservacion, COUNT(*) as total FROM reservaciones WHERE fecha_reservacion = ? GROUP BY hora_reservacion',
  //       [fecha]
  //     );

  //     // Crear mapa de reservas por hora
  //     const reservasPorHora = new Map();
  //     reservas.forEach(reserva => {
  //       reservasPorHora.set(reserva.hora_reservacion, reserva.total);
  //     });

  //     // Filtrar horarios disponibles (usando la lógica anterior de MAX_RESERVAS_POR_HORA)
  //     const horariosDisponibles = HORARIOS_DISPONIBLES.filter(hora => {
  //       const reservasEnHora = reservasPorHora.get(hora) || 0;
  //       return reservasEnHora < MAX_RESERVAS_POR_HORA;
  //     });

  //     return horariosDisponibles;
  //   } catch (error) {
  //     console.error('Error en reservaModel.getHorariosDisponibles:', error);
  //     throw new Error('Error al obtener horarios disponibles: ' + error.message);
  //   }
  // },

  /**
   * Obtiene el historial de reservaciones de un usuario.
   * @param {number} id_cliente - El ID del cliente.
   * @returns {Promise<Array>} Lista de reservaciones.
   */
  getReservasByUser: async (id_cliente) => {
    try {
      const [rows] = await pool.query(
        'SELECT id_reservacion, fecha_reservacion, hora_reservacion, numero_personas, notas, id_estado, id_mesa FROM reservaciones WHERE id_cliente = ? ORDER BY fecha_reservacion DESC, hora_reservacion DESC',
        [id_cliente]
      );
      return rows;
    } catch (error) {
      console.error('Error al obtener historial de reservaciones:', error);
      throw error;
    }
  },

  // Verificar disponibilidad específica
  checkDisponibilidad: async (fecha, hora) => {
    try {
      // Usar la función del modelo de horario para obtener la capacidad máxima
      const capacidadMaxima = await horarioModel.obtenerCapacidadMaxima(fecha, hora);

      if (capacidadMaxima === 0) {
        return false; // No hay capacidad para este horario
      }

      // Contar reservas existentes usando 'reservaciones'
      const [rows] = await pool.query(
        'SELECT COUNT(*) as count FROM reservaciones WHERE fecha_reservacion = ? AND hora_reservacion = ?',
        [fecha, hora]
      );

      return rows[0].count < capacidadMaxima;
    } catch (error) {
      console.error('Error en reservaModel.checkDisponibilidad:', error);
      throw new Error('Error al verificar disponibilidad: ' + error.message);
    }
  }
};

// Importar horarioModel aquí para evitar circular dependency if needed, or ensure proper import order
import { horarioModel } from './horarioModel.js'; 