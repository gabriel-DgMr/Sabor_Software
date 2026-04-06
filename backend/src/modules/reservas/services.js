import { reservaQueries } from "./queries.js";

export const reservaService = {
  // --- Lógica de Horarios ---

  obtenerCapacidadMaxima: async (fecha, hora) => {
    try {
      const diaSemana = new Date(fecha)
        .toLocaleDateString("es-ES", { weekday: "long" })
        .toUpperCase();

      const excepciones = await reservaQueries.findCapacidadExcepcion(
        fecha,
        hora,
      );
      if (excepciones && excepciones.length > 0) {
        return excepciones[0].capacidad_maxima;
      }

      const horarios = await reservaQueries.findCapacidadConfiguracion(
        diaSemana,
        hora,
      );
      return horarios[0]?.capacidad_maxima || 0;
    } catch (error) {
      throw new Error("Error al obtener capacidad máxima: " + error.message);
    }
  },

  getFechasDisponibles: async (locale = "es-ES") => {
    try {
      const fechasDisponibles = [];
      const hoy = new Date();

      for (let i = 0; i < 7; i++) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() + i);
        const fechaStr = fecha.toISOString().split("T")[0];

        const excepciones =
          await reservaQueries.findExcepcionesByFecha(fechaStr);
        const diaSemana = fecha
          .toLocaleDateString("es-ES", { weekday: "long" })
          .toUpperCase();
        const configuracion =
          await reservaQueries.findConfiguracionByDia(diaSemana);

        const disponible = configuracion.length > 0 || excepciones.length > 0;

        fechasDisponibles.push({
          fecha: fechaStr,
          formato: fecha
            .toLocaleDateString(locale, {
              weekday: "short",
              day: "2-digit",
            })
            .toUpperCase(),
          disponible,
        });
      }

      return fechasDisponibles;
    } catch (error) {
      throw new Error("Error al obtener fechas disponibles: " + error.message);
    }
  },

  getHorariosDisponibles: async (fecha) => {
    try {
      const diaSemana = new Date(fecha)
        .toLocaleDateString("es-ES", { weekday: "long" })
        .toUpperCase();
      const excepciones = await reservaQueries.findExcepcionesByFecha(fecha);

      let posiblesHorarios = [];

      if (excepciones.length > 0) {
        posiblesHorarios = excepciones.map((ex) => ex.hora_inicio);
      } else {
        const config =
          await reservaQueries.findConfiguracionOrdenada(diaSemana);
        posiblesHorarios = config.map((h) => h.hora_inicio);
      }

      const horariosConDisponibilidad = [];

      for (const hora of posiblesHorarios) {
        const capacidadMaxima = await reservaService.obtenerCapacidadMaxima(
          fecha,
          hora,
        );
        const reservasOcupadas = await reservaQueries.countReservasByHoraYFecha(
          fecha,
          hora,
        );

        const disponible = reservasOcupadas < capacidadMaxima;

        horariosConDisponibilidad.push({
          hora: hora,
          disponible: disponible,
        });
      }

      return horariosConDisponibilidad;
    } catch (error) {
      throw new Error(
        "Error al obtener horarios disponibles: " + error.message,
      );
    }
  },

  checkDisponibilidad: async (fecha, hora) => {
    try {
      const CAPACIDAD_MAXIMA_DEFAULT = 20;
      let capacidadMaxima = CAPACIDAD_MAXIMA_DEFAULT;

      try {
        const capacidadConfigurada =
          await reservaService.obtenerCapacidadMaxima(fecha, hora);
        if (capacidadConfigurada > 0) capacidadMaxima = capacidadConfigurada;
      } catch (e) {
        console.warn(
          "Usando capacidad por defecto debido a error local:",
          e.message,
        );
      }

      const reservasOcupadas = await reservaQueries.countReservasByHoraYFecha(
        fecha,
        hora,
      );
      return reservasOcupadas < capacidadMaxima;
    } catch (error) {
      throw new Error("Error al verificar disponibilidad: " + error.message);
    }
  },

  // --- Lógica de Reservas ---

  createReserva: async (reservaData) => {
    try {
      const { id_usuario, fecha_reservacion, hora_reservacion } = reservaData;

      // Un usuario no puede tener más de una reserva a la misma hora
      const duplicada = await reservaQueries.findReservaDuplicadaUsuario(
        id_usuario,
        fecha_reservacion,
        hora_reservacion,
      );
      if (duplicada && duplicada.length > 0) {
        throw new Error("Ya tienes una reservación para ese horario.");
      }

      const disponible = await reservaService.checkDisponibilidad(
        fecha_reservacion,
        hora_reservacion,
      );
      if (!disponible) {
        throw new Error(
          "No hay disponibilidad para la fecha y hora seleccionada",
        );
      }

      const mesasTotales = await reservaQueries.findAllMesas();
      const mesasOcupadas = await reservaQueries.findMesasOcupadas(
        fecha_reservacion,
        hora_reservacion,
      );

      const ocupadasSet = new Set(mesasOcupadas.map((m) => m.id_mesa));
      const mesaLibre = mesasTotales.find((m) => !ocupadasSet.has(m.id_mesa));

      if (!mesaLibre) {
        throw new Error(
          "No hay mesas disponibles para la fecha y hora seleccionada",
        );
      }

      const insertId = await reservaQueries.insertReserva(
        reservaData,
        mesaLibre.id_mesa,
      );
      return insertId;
    } catch (error) {
      throw new Error(error.message); // Propagar mensaje intacto para los controladores
    }
  },

  getReservasByUser: async (id_usuario) => {
    return await reservaQueries.findByUsuarioId(id_usuario);
  },

  getReservaById: async (id_reservacion) => {
    const reserva = await reservaQueries.findByIdDetallada(id_reservacion);
    if (!reserva) throw new Error("Reserva no encontrada");
    return reserva;
  },

  getAllReservaciones: async () => {
    return await reservaQueries.findAll();
  },

  getReservacionesByFecha: async (fecha) => {
    return await reservaQueries.findByFecha(fecha);
  },

  updateReservacionEstado: async (id_reservacion, estadoNombre) => {
    const estadoRow = await reservaQueries.findEstadoByNombre(estadoNombre);
    if (!estadoRow || estadoRow.length === 0)
      throw new Error("Estado no válido");

    return await reservaQueries.updateEstado(
      id_reservacion,
      estadoRow[0].id_estado,
    );
  },

  updateReservacion: async (id_reservacion, reservaData) => {
    const {
      id_usuario,
      numero_personas,
      fecha_reservacion,
      hora_reservacion,
      notas,
      estado,
    } = reservaData;

    let id_estado = null;
    if (estado) {
      const estadoRow = await reservaQueries.findEstadoByNombre(estado);
      if (estadoRow && estadoRow.length > 0) {
        id_estado = estadoRow[0].id_estado;
      }
    }

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

    updates.push("fecha_modificacion = CURRENT_TIMESTAMP");
    values.push(id_reservacion);

    return await reservaQueries.updateReserva(
      id_reservacion,
      updates.join(", "),
      values,
    );
  },

  deleteReservacion: async (id_reservacion) => {
    return await reservaQueries.deleteReserva(id_reservacion);
  },
};
