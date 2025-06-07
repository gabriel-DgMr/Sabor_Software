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
      // Recibir id_cliente y otros datos necesarios para la reserva
      const { id_cliente, personas, fecha, hora, peticiones } = reservaData;

      // Verificar disponibilidad antes de crear la reserva
      const disponible = await reservaModel.checkDisponibilidad(fecha, hora);
      if (!disponible) {
        throw new Error('No hay disponibilidad para la fecha y hora seleccionada');
      }

      const [result] = await pool.query(
        'INSERT INTO reservaciones (id_cliente, numero_personas, fecha_reservacion, hora_reservacion, notas, id_mesa, id_estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id_cliente, personas, fecha, hora, peticiones, 1, 1]
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