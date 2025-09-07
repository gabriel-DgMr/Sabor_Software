import { dbConfig } from "../config/dbconfig.js";
import mysql from "mysql2/promise";

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
   * @param {Object} reservaData - Los datos de la reserva (ahora incluye id_usuario).
   * @returns {Promise<number>} El ID de la reserva insertada.
   */
  createReserva: async (reservaData) => {
    try {
      const {
        id_usuario,
        numero_personas,
        fecha_reservacion,
        hora_reservacion,
        notas,
      } = reservaData;

      // Validar que el cliente no tenga ya una reserva para ese horario
      const [yaReservado] = await pool.query(
        "SELECT id_reservacion FROM reservaciones WHERE id_usuario = ? AND fecha_reservacion = ? AND hora_reservacion = ?",
        [id_usuario, fecha_reservacion, hora_reservacion],
      );
      if (yaReservado.length > 0) {
        throw new Error("Ya tienes una reservación para ese horario.");
      }

      // Buscar una mesa disponible para la fecha y hora
      const [mesas] = await pool.query("SELECT id_mesa FROM mesas");
      const [ocupadas] = await pool.query(
        "SELECT id_mesa FROM reservaciones WHERE fecha_reservacion = ? AND hora_reservacion = ?",
        [fecha_reservacion, hora_reservacion],
      );
      const ocupadasSet = new Set(ocupadas.map((r) => r.id_mesa));
      const mesaLibre = mesas.find((m) => !ocupadasSet.has(m.id_mesa));
      if (!mesaLibre) {
        throw new Error(
          "No hay mesas disponibles para la fecha y hora seleccionada",
        );
      }
      const id_mesa = mesaLibre.id_mesa;

      // Verificar disponibilidad general (capacidad máxima del local)
      const disponible = await reservaModel.checkDisponibilidad(
        fecha_reservacion,
        hora_reservacion,
      );
      if (!disponible) {
        throw new Error(
          "No hay disponibilidad para la fecha y hora seleccionada",
        );
      }

      const [result] = await pool.query(
        "INSERT INTO reservaciones (id_usuario, numero_personas, fecha_reservacion, hora_reservacion, notas, id_mesa, id_estado) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          id_usuario,
          numero_personas,
          fecha_reservacion,
          hora_reservacion,
          notas,
          id_mesa,
          2, // PENDIENTE
        ],
      );

      return result.insertId;
    } catch (error) {
      console.error("Error en reservaModel.createReserva:", error);
      throw new Error(error.message);
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
   * Obtiene el historial de reservaciones de un cliente.
   * @param {number} id_usuario - El ID del cliente.
   * @returns {Promise<Array>} Lista de reservaciones.
   */
  getReservasByUser: async (id_usuario) => {
    try {
      const [rows] = await pool.query(
        "SELECT id_reservacion, fecha_reservacion, hora_reservacion, numero_personas, notas, id_estado, id_mesa FROM reservaciones WHERE id_usuario = ? ORDER BY fecha_reservacion DESC, hora_reservacion DESC",
        [id_usuario],
      );
      return rows;
    } catch (error) {
      console.error("Error al obtener historial de reservaciones:", error);
      throw error;
    }
  },

  // Verificar disponibilidad específica
  checkDisponibilidad: async (fecha, hora) => {
    try {
      // Capacidad máxima por defecto (puede ser configurada)
      const CAPACIDAD_MAXIMA_DEFAULT = 20;

      let capacidadMaxima = CAPACIDAD_MAXIMA_DEFAULT;

      try {
        // Intentar obtener la capacidad máxima desde la configuración
        const capacidadConfigurada = await horarioModel.obtenerCapacidadMaxima(
          fecha,
          hora,
        );
        if (capacidadConfigurada > 0) {
          capacidadMaxima = capacidadConfigurada;
        }
      } catch (error) {
        console.warn(
          "No se pudo obtener capacidad máxima desde configuración, usando valor por defecto:",
          error.message,
        );
        // Continuar con la capacidad por defecto
      }

      // Contar reservas existentes
      const [rows] = await pool.query(
        "SELECT COUNT(*) as count FROM reservaciones WHERE fecha_reservacion = ? AND hora_reservacion = ?",
        [fecha, hora],
      );

      return rows[0].count < capacidadMaxima;
    } catch (error) {
      console.error("Error en reservaModel.checkDisponibilidad:", error);
      throw new Error("Error al verificar disponibilidad: " + error.message);
    }
  },

  /**
   * Obtiene los detalles de una reserva específica por su ID.
   * @param {number} id_reservacion - El ID de la reserva.
   * @returns {Promise<Object>} Los detalles de la reserva.
   */
  getReservaById: async (id_reservacion) => {
    try {
      const [rows] = await pool.query(
        `SELECT 
          r.*,
          m.id_mesa,
          u.nombre_usuario,
          u.correo_usuario,
          u.telefono_usuario
        FROM reservaciones r
        JOIN mesas m ON r.id_mesa = m.id_mesa
        JOIN usuarios u ON r.id_usuario = u.id_usuario
        WHERE r.id_reservacion = ?`,
        [id_reservacion],
      );

      if (rows.length === 0) {
        throw new Error("Reserva no encontrada");
      }

      return rows[0];
    } catch (error) {
      console.error("Error en reservaModel.getReservaById:", error);
      throw error;
    }
  },

  /**
   * Obtiene todas las reservaciones con información completa.
   * @returns {Promise<Array>} Lista de todas las reservaciones.
   */
  getAllReservaciones: async () => {
    try {
      const [rows] = await pool.query(
        `SELECT 
          r.id_reservacion,
          r.fecha_reservacion,
          r.hora_reservacion,
          r.numero_personas,
          r.notas,
          r.fecha_creacion,
          r.fecha_modificacion,
          u.nombre_usuario as nombre,
          u.correo_usuario as email,
          u.telefono_usuario as telefono,
          m.id_mesa,
          e.nombre_estado as estado
        FROM reservaciones r
        JOIN usuarios u ON r.id_usuario = u.id_usuario
        JOIN mesas m ON r.id_mesa = m.id_mesa
        JOIN estados e ON r.id_estado = e.id_estado
        ORDER BY r.fecha_reservacion DESC, r.hora_reservacion DESC`,
      );
      return rows;
    } catch (error) {
      console.error("Error en reservaModel.getAllReservaciones:", error);
      throw error;
    }
  },

  /**
   * Obtiene reservaciones por fecha específica.
   * @param {string} fecha - La fecha en formato YYYY-MM-DD.
   * @returns {Promise<Array>} Lista de reservaciones para esa fecha.
   */
  getReservacionesByFecha: async (fecha) => {
    try {
      const [rows] = await pool.query(
        `SELECT 
          r.id_reservacion,
          r.fecha_reservacion,
          r.hora_reservacion,
          r.numero_personas,
          r.notas,
          r.fecha_creacion,
          r.fecha_modificacion,
          u.nombre_usuario as nombre,
          u.correo_usuario as email,
          u.telefono_usuario as telefono,
          m.id_mesa,
          e.nombre_estado as estado
        FROM reservaciones r
        JOIN usuarios u ON r.id_usuario = u.id_usuario
        JOIN mesas m ON r.id_mesa = m.id_mesa
        JOIN estados e ON r.id_estado = e.id_estado
        WHERE r.fecha_reservacion = ?
        ORDER BY r.hora_reservacion ASC`,
        [fecha],
      );
      return rows;
    } catch (error) {
      console.error("Error en reservaModel.getReservacionesByFecha:", error);
      throw error;
    }
  },

  /**
   * Actualiza el estado de una reservación.
   * @param {number} id_reservacion - El ID de la reservación.
   * @param {string} estado - El nuevo estado.
   * @returns {Promise<boolean>} True si se actualizó correctamente.
   */
  updateReservacionEstado: async (id_reservacion, estado) => {
    try {
      // Primero obtener el id_estado basado en el nombre del estado
      const [estadoRows] = await pool.query(
        "SELECT id_estado FROM estados WHERE nombre_estado = ?",
        [estado],
      );

      if (estadoRows.length === 0) {
        throw new Error("Estado no válido");
      }

      const id_estado = estadoRows[0].id_estado;

      const [result] = await pool.query(
        "UPDATE reservaciones SET id_estado = ?, fecha_modificacion = CURRENT_TIMESTAMP WHERE id_reservacion = ?",
        [id_estado, id_reservacion],
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error en reservaModel.updateReservacionEstado:", error);
      throw error;
    }
  },

  /**
   * Actualiza una reservación completa.
   * @param {number} id_reservacion - El ID de la reservación.
   * @param {Object} reservaData - Los nuevos datos de la reservación.
   * @returns {Promise<boolean>} True si se actualizó correctamente.
   */
  updateReservacion: async (id_reservacion, reservaData) => {
    try {
      const {
        id_usuario,
        numero_personas,
        fecha_reservacion,
        hora_reservacion,
        notas,
        estado,
      } = reservaData;

      // Obtener el id_estado basado en el nombre del estado
      let id_estado = null;
      if (estado) {
        const [estadoRows] = await pool.query(
          "SELECT id_estado FROM estados WHERE nombre_estado = ?",
          [estado],
        );
        if (estadoRows.length > 0) {
          id_estado = estadoRows[0].id_estado;
        }
      }

      // Construir la consulta dinámicamente
      const updates = [];
      const values = [];

      if (id_usuario !== undefined) {
        updates.push("id_usuario = ?");
        values.push(id_usuario);
      }
      if (numero_personas !== undefined) {
        updates.push("numero_personas = ?");
        values.push(numero_personas);
      }
      if (fecha_reservacion !== undefined) {
        updates.push("fecha_reservacion = ?");
        values.push(fecha_reservacion);
      }
      if (hora_reservacion !== undefined) {
        updates.push("hora_reservacion = ?");
        values.push(hora_reservacion);
      }
      if (notas !== undefined) {
        updates.push("notas = ?");
        values.push(notas);
      }
      if (id_estado !== null) {
        updates.push("id_estado = ?");
        values.push(id_estado);
      }

      // Siempre actualizar la fecha de modificación
      updates.push("fecha_modificacion = CURRENT_TIMESTAMP");

      // Agregar el ID al final para la cláusula WHERE
      values.push(id_reservacion);

      const [result] = await pool.query(
        `UPDATE reservaciones SET ${updates.join(", ")} WHERE id_reservacion = ?`,
        values,
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error en reservaModel.updateReservacion:", error);
      throw error;
    }
  },

  /**
   * Elimina una reservación.
   * @param {number} id_reservacion - El ID de la reservación a eliminar.
   * @returns {Promise<boolean>} True si se eliminó correctamente.
   */
  deleteReservacion: async (id_reservacion) => {
    try {
      const [result] = await pool.query(
        "DELETE FROM reservaciones WHERE id_reservacion = ?",
        [id_reservacion],
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error en reservaModel.deleteReservacion:", error);
      throw error;
    }
  },
};

// Importar horarioModel aquí para evitar circular dependency if needed, or ensure proper import order
import { horarioModel } from "./horarioModel.js";
