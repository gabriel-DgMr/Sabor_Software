import mysql from "mysql2/promise";
import { dbConfig } from "../../core/config/dbconfig.js";

const pool = mysql.createPool(dbConfig);

export const reservaQueries = {
  // Horarios / Fechas (antiguo horarioModel)
  findExcepcionesByFecha: async (fecha, isOnlyActive = true) => {
    const query =
      "SELECT * FROM excepciones_horarios WHERE fecha = ?" +
      (isOnlyActive ? " AND activo = 1" : "");
    const [rows] = await pool.query(query, [fecha]);
    return rows;
  },

  findConfiguracionByDia: async (diaSemana, isOnlyActive = true) => {
    const query =
      "SELECT * FROM configuracion_horarios WHERE dia_semana = ?" +
      (isOnlyActive ? " AND activo = 1" : "");
    const [rows] = await pool.query(query, [diaSemana]);
    return rows;
  },

  findConfiguracionOrdenada: async (diaSemana) => {
    const [rows] = await pool.query(
      "SELECT * FROM configuracion_horarios WHERE dia_semana = ? AND activo = 1 ORDER BY hora_inicio",
      [diaSemana],
    );
    return rows;
  },

  countReservasByHoraYFecha: async (fecha, hora) => {
    const [rows] = await pool.query(
      "SELECT COUNT(*) as total FROM reservaciones WHERE fecha_reservacion = ? AND hora_reservacion = ?",
      [fecha, hora],
    );
    return rows[0].total;
  },

  findCapacidadExcepcion: async (fecha, hora) => {
    const [rows] = await pool.query(
      "SELECT capacidad_maxima FROM excepciones_horarios WHERE fecha = ? AND hora_inicio <= ? AND hora_fin >= ? AND activo = 1",
      [fecha, hora, hora],
    );
    return rows;
  },

  findCapacidadConfiguracion: async (diaSemana, hora) => {
    const [rows] = await pool.query(
      "SELECT capacidad_maxima FROM configuracion_horarios WHERE dia_semana = ? AND hora_inicio <= ? AND hora_fin >= ? AND activo = 1",
      [diaSemana, hora, hora],
    );
    return rows;
  },

  // Reservas Específicas (antiguo reservaModel)
  findReservaDuplicadaUsuario: async (id_usuario, fecha, hora) => {
    const [rows] = await pool.query(
      "SELECT id_reservacion FROM reservaciones WHERE id_usuario = ? AND fecha_reservacion = ? AND hora_reservacion = ?",
      [id_usuario, fecha, hora],
    );
    return rows;
  },

  findAllMesas: async () => {
    const [rows] = await pool.query("SELECT id_mesa FROM mesas");
    return rows;
  },

  findMesasOcupadas: async (fecha, hora) => {
    const [rows] = await pool.query(
      "SELECT id_mesa FROM reservaciones WHERE fecha_reservacion = ? AND hora_reservacion = ?",
      [fecha, hora],
    );
    return rows;
  },

  insertReserva: async (data, id_mesa) => {
    const {
      id_usuario,
      numero_personas,
      fecha_reservacion,
      hora_reservacion,
      notas,
    } = data;
    const [result] = await pool.query(
      "INSERT INTO reservaciones (id_usuario, numero_personas, fecha_reservacion, hora_reservacion, notas, id_mesa, id_estado) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        id_usuario,
        numero_personas,
        fecha_reservacion,
        hora_reservacion,
        notas,
        id_mesa,
        2,
      ], // 2: PENDIENTE
    );
    return result.insertId;
  },

  findByUsuarioId: async (id_usuario) => {
    const [rows] = await pool.query(
      "SELECT id_reservacion, fecha_reservacion, hora_reservacion, numero_personas, notas, id_estado, id_mesa FROM reservaciones WHERE id_usuario = ? ORDER BY fecha_reservacion DESC, hora_reservacion DESC",
      [id_usuario],
    );
    return rows;
  },

  findByIdDetallada: async (id_reservacion) => {
    const [rows] = await pool.query(
      `SELECT r.*, m.id_mesa, u.nombre_usuario, u.correo_usuario, u.telefono_usuario 
       FROM reservaciones r 
       JOIN mesas m ON r.id_mesa = m.id_mesa 
       JOIN usuarios u ON r.id_usuario = u.id_usuario 
       WHERE r.id_reservacion = ?`,
      [id_reservacion],
    );
    return rows[0];
  },

  findAll: async () => {
    const [rows] = await pool.query(
      `SELECT r.id_reservacion, r.fecha_reservacion, r.hora_reservacion, r.numero_personas, r.notas, 
              r.fecha_creacion, r.fecha_modificacion, u.nombre_usuario as nombre, u.correo_usuario as email, 
              u.telefono_usuario as telefono, m.id_mesa, e.nombre_estado as estado 
       FROM reservaciones r 
       JOIN usuarios u ON r.id_usuario = u.id_usuario 
       JOIN mesas m ON r.id_mesa = m.id_mesa 
       JOIN estados e ON r.id_estado = e.id_estado 
       ORDER BY r.fecha_reservacion DESC, r.hora_reservacion DESC`,
    );
    return rows;
  },

  findByFecha: async (fecha) => {
    const [rows] = await pool.query(
      `SELECT r.id_reservacion, r.fecha_reservacion, r.hora_reservacion, r.numero_personas, r.notas, 
              r.fecha_creacion, r.fecha_modificacion, u.nombre_usuario as nombre, u.correo_usuario as email, 
              u.telefono_usuario as telefono, m.id_mesa, e.nombre_estado as estado 
       FROM reservaciones r 
       JOIN usuarios u ON r.id_usuario = u.id_usuario 
       JOIN mesas m ON r.id_mesa = m.id_mesa 
       JOIN estados e ON r.id_estado = e.id_estado 
       WHERE r.fecha_reservacion = ? 
       ORDER BY r.hora_reservacion ASC`,
      [fecha],
    );
    return rows;
  },

  findEstadoByNombre: async (nombre) => {
    const [rows] = await pool.query(
      "SELECT id_estado FROM estados WHERE nombre_estado = ?",
      [nombre],
    );
    return rows;
  },

  updateEstado: async (id_reservacion, id_estado) => {
    const [result] = await pool.query(
      "UPDATE reservaciones SET id_estado = ?, fecha_modificacion = CURRENT_TIMESTAMP WHERE id_reservacion = ?",
      [id_estado, id_reservacion],
    );
    return result.affectedRows > 0;
  },

  updateReserva: async (id_reservacion, updatesStr, valuesArray) => {
    const [result] = await pool.query(
      `UPDATE reservaciones SET ${updatesStr} WHERE id_reservacion = ?`,
      valuesArray,
    );
    return result.affectedRows > 0;
  },

  deleteReserva: async (id_reservacion) => {
    const [result] = await pool.query(
      "DELETE FROM reservaciones WHERE id_reservacion = ?",
      [id_reservacion],
    );
    return result.affectedRows > 0;
  },
};
