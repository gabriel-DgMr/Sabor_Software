import { reservaService } from "./services.js";
import * as usuarioService from "../usuarios/services.js";
import {
  createEmailTransporter,
  sendWithRetry,
} from "../../core/config/emailConfig.js";
import { config } from "../../core/config/config.js";

const transporter = createEmailTransporter();

export const horarioController = {
  getFechasDisponibles: async (req, res) => {
    try {
      const { lang } = req.query;
      const fechasDisponibles = await reservaService.getFechasDisponibles(lang);
      res.json({ fechasDisponibles });
    } catch (error) {
      console.error("Error al obtener fechas disponibles:", error);
      res.status(500).json({ message: "Error al obtener fechas disponibles" });
    }
  },

  getHorariosDisponibles: async (req, res) => {
    try {
      const { fecha } = req.query;
      if (!fecha) {
        return res.status(400).json({
          message: "Se requiere la fecha para obtener los horarios disponibles",
        });
      }
      const horariosDisponibles =
        await reservaService.getHorariosDisponibles(fecha);
      res.json({ horariosDisponibles });
    } catch (error) {
      console.error("Error al obtener horarios disponibles:", error);
      res
        .status(500)
        .json({ message: "Error al obtener horarios disponibles" });
    }
  },

  checkDisponibilidad: async (req, res) => {
    try {
      const { fecha, hora } = req.query;
      if (!fecha || !hora) {
        return res.status(400).json({
          message: "Se requieren fecha y hora para verificar disponibilidad",
        });
      }
      const disponible = await reservaService.checkDisponibilidad(fecha, hora);
      res.json({ disponible });
    } catch (error) {
      console.error("Error al verificar disponibilidad:", error);
      res.status(500).json({ message: "Error al verificar disponibilidad" });
    }
  },
};

export const reservaController = {
  hacerReserva: async (req, res) => {
    const datosReserva = req.body;
    const errors = {};

    if (
      !datosReserva.personas ||
      typeof datosReserva.personas !== "number" ||
      datosReserva.personas <= 0
    ) {
      errors.personas = "La cantidad de personas debe ser un número positivo.";
    }
    if (
      !datosReserva.fecha ||
      typeof datosReserva.fecha !== "string" ||
      datosReserva.fecha.trim() === ""
    ) {
      errors.fecha = "La fecha es obligatoria.";
    }
    if (
      !datosReserva.hora ||
      typeof datosReserva.hora !== "string" ||
      datosReserva.hora.trim() === ""
    ) {
      errors.hora = "La hora es obligatoria.";
    }
    if (
      !datosReserva.nombre ||
      typeof datosReserva.nombre !== "string" ||
      datosReserva.nombre.trim() === ""
    ) {
      errors.nombre = "El nombre es obligatorio.";
    }
    if (
      !datosReserva.telefono ||
      typeof datosReserva.telefono !== "string" ||
      datosReserva.telefono.trim() === ""
    ) {
      errors.telefono = "El teléfono es obligatorio.";
    } else if (!/^[0-9]{10}$/.test(datosReserva.telefono.trim())) {
      errors.telefono = "El teléfono debe tener 10 dígitos.";
    }
    if (
      !datosReserva.email ||
      typeof datosReserva.email !== "string" ||
      datosReserva.email.trim() === ""
    ) {
      errors.email = "El correo electrónico es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosReserva.email.trim())) {
      errors.email = "El formato del correo electrónico no es válido.";
    }

    if (Object.keys(errors).length > 0) {
      return res
        .status(400)
        .json({ message: "Error en los datos de la reserva.", errors });
    }

    try {
      const cliente = await usuarioService.getOrCreateUserService({
        nombre: datosReserva.nombre,
        email: datosReserva.email,
        telefono: datosReserva.telefono,
      });

      const id_usuario = cliente.id_usuario;

      const reservaId = await reservaService.createReserva({
        id_usuario: id_usuario,
        numero_personas: datosReserva.personas,
        fecha_reservacion: datosReserva.fecha,
        hora_reservacion: datosReserva.hora,
        notas: datosReserva.peticiones,
      });

      const reservaDetails = await reservaService.getReservaById(reservaId);

      const { lang } = req.body;
      const isEnglish = lang === "en";

      const mailOptions = {
        from: config.email?.user || process.env.EMAIL_USER,
        to: datosReserva.email,
        subject: isEnglish
          ? "Reservation Confirmation - Sabor"
          : "Confirmación de Reserva - Sabor",
        html: isEnglish
          ? `<h2>Your reservation has been confirmed</h2><p>Table number: ${reservaDetails.id_mesa}</p>`
          : `<h2>Tu reserva ha sido confirmada</h2><p>Número de mesa: ${reservaDetails.id_mesa}</p>`,
      };

      await sendWithRetry(transporter, mailOptions, 3);
      res
        .status(201)
        .json({ message: "Reserva creada con éxito!", reservaId: reservaId });
    } catch (error) {
      if (
        error.message.includes("No hay disponibilidad") ||
        error.message.includes("Ya tienes una reservación")
      ) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({
        message: "Error interno del servidor al crear la reserva.",
        detalle: error.message,
      });
    }
  },

  getHistorialReservas: async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res
          .status(401)
          .json({ message: "No autorizado: cliente no autenticado." });
      }
      const reservas = await reservaService.getReservasByUser(req.user.id);
      res.json(reservas);
    } catch (error) {
      console.error("Error en getHistorialReservas:", error);
      res.status(500).json({
        message: "Error al obtener historial de reservaciones",
        detalle: error.message,
      });
    }
  },

  getAllReservaciones: async (req, res) => {
    try {
      const reservaciones = await reservaService.getAllReservaciones();
      res.json(reservaciones);
    } catch (error) {
      console.error("Error al obtener todas las reservaciones:", error);
      res.status(500).json({ message: "Error al obtener reservaciones" });
    }
  },

  getReservacionesByFecha: async (req, res) => {
    try {
      const { fecha } = req.params;
      const reservaciones = await reservaService.getReservacionesByFecha(fecha);
      res.json(reservaciones);
    } catch (error) {
      console.error("Error al obtener reservaciones por fecha:", error);
      res
        .status(500)
        .json({ message: "Error al obtener reservaciones por fecha" });
    }
  },

  updateEstadoReservacion: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      await reservaService.updateReservacionEstado(parseInt(id), estado);
      res.json({ message: "Estado de reservación actualizado correctamente" });
    } catch (error) {
      console.error("Error al actualizar estado de reservación:", error);
      res
        .status(500)
        .json({ message: "Error al actualizar estado de reservación" });
    }
  },

  deleteReservacion: async (req, res) => {
    try {
      const { id } = req.params;
      await reservaService.deleteReservacion(parseInt(id));
      res.json({ message: "Reservación eliminada correctamente" });
    } catch (error) {
      console.error("Error al eliminar reservación:", error);
      res.status(500).json({ message: "Error al eliminar reservación" });
    }
  },

  crearReservaAdmin: async (req, res) => {
    try {
      const datosReserva = req.body;
      const errors = {};

      if (
        !datosReserva.nombre ||
        typeof datosReserva.nombre !== "string" ||
        datosReserva.nombre.trim() === ""
      ) {
        errors.nombre = "El nombre es obligatorio.";
      }
      if (
        !datosReserva.telefono ||
        typeof datosReserva.telefono !== "string" ||
        datosReserva.telefono.trim() === ""
      ) {
        errors.telefono = "El teléfono es obligatorio.";
      } else if (
        !/^[0-9]{10}$/.test(datosReserva.telefono.replace(/\D/g, ""))
      ) {
        errors.telefono = "El teléfono debe tener 10 dígitos.";
      }
      if (
        !datosReserva.email ||
        typeof datosReserva.email !== "string" ||
        datosReserva.email.trim() === ""
      ) {
        errors.email = "El correo electrónico es obligatorio.";
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosReserva.email.trim())
      ) {
        errors.email = "El formato del correo electrónico no es válido.";
      }
      if (
        !datosReserva.fecha_reservacion ||
        typeof datosReserva.fecha_reservacion !== "string" ||
        datosReserva.fecha_reservacion.trim() === ""
      ) {
        errors.fecha_reservacion = "La fecha es obligatoria.";
      }
      if (
        !datosReserva.hora_reservacion ||
        typeof datosReserva.hora_reservacion !== "string" ||
        datosReserva.hora_reservacion.trim() === ""
      ) {
        errors.hora_reservacion = "La hora es obligatoria.";
      }
      if (
        !datosReserva.numero_personas ||
        typeof datosReserva.numero_personas !== "number" ||
        datosReserva.numero_personas <= 0
      ) {
        errors.numero_personas =
          "El número de personas debe ser un número positivo.";
      }

      if (Object.keys(errors).length > 0)
        return res
          .status(400)
          .json({ message: "Error en los datos de la reserva.", errors });

      const cliente = await usuarioService.getOrCreateUserService({
        nombre: datosReserva.nombre,
        email: datosReserva.email,
        telefono: datosReserva.telefono,
      });

      const reservaId = await reservaService.createReserva({
        id_usuario: cliente.id_usuario,
        numero_personas: datosReserva.numero_personas,
        fecha_reservacion: datosReserva.fecha_reservacion,
        hora_reservacion: datosReserva.hora_reservacion,
        notas: datosReserva.notas || "",
      });

      res.status(201).json({
        message: "Reserva creada exitosamente desde administración",
        reservaId,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error interno del servidor al crear la reserva.",
        detalle: error.message,
      });
    }
  },

  actualizarReservaAdmin: async (req, res) => {
    try {
      const { id } = req.params;
      const datosReserva = req.body;
      const errors = {};

      if (
        !datosReserva.nombre ||
        typeof datosReserva.nombre !== "string" ||
        datosReserva.nombre.trim() === ""
      ) {
        errors.nombre = "El nombre es obligatorio.";
      }
      if (
        !datosReserva.telefono ||
        typeof datosReserva.telefono !== "string" ||
        datosReserva.telefono.trim() === ""
      ) {
        errors.telefono = "El teléfono es obligatorio.";
      } else if (
        !/^[0-9]{10}$/.test(datosReserva.telefono.replace(/\D/g, ""))
      ) {
        errors.telefono = "El teléfono debe tener 10 dígitos.";
      }
      if (
        !datosReserva.email ||
        typeof datosReserva.email !== "string" ||
        datosReserva.email.trim() === ""
      ) {
        errors.email = "El correo electrónico es obligatorio.";
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosReserva.email.trim())
      ) {
        errors.email = "El formato del correo electrónico no es válido.";
      }
      if (
        !datosReserva.fecha_reservacion ||
        typeof datosReserva.fecha_reservacion !== "string" ||
        datosReserva.fecha_reservacion.trim() === ""
      ) {
        errors.fecha_reservacion = "La fecha es obligatoria.";
      }
      if (
        !datosReserva.hora_reservacion ||
        typeof datosReserva.hora_reservacion !== "string" ||
        datosReserva.hora_reservacion.trim() === ""
      ) {
        errors.hora_reservacion = "La hora es obligatoria.";
      }
      if (
        !datosReserva.numero_personas ||
        typeof datosReserva.numero_personas !== "number" ||
        datosReserva.numero_personas <= 0
      ) {
        errors.numero_personas =
          "El número de personas debe ser un número positivo.";
      }

      if (Object.keys(errors).length > 0)
        return res
          .status(400)
          .json({ message: "Error en los datos de la reserva.", errors });

      const cliente = await usuarioService.getOrCreateUserService({
        nombre: datosReserva.nombre,
        email: datosReserva.email,
        telefono: datosReserva.telefono,
      });

      await reservaService.updateReservacion(parseInt(id), {
        id_usuario: cliente.id_usuario,
        numero_personas: datosReserva.numero_personas,
        fecha_reservacion: datosReserva.fecha_reservacion,
        hora_reservacion: datosReserva.hora_reservacion,
        notas: datosReserva.notas || "",
        estado: datosReserva.estado || "PENDIENTE",
      });

      res.json({
        message: "Reserva actualizada exitosamente desde administración",
      });
    } catch (error) {
      res.status(500).json({
        message: "Error interno del servidor al actualizar la reserva.",
        detalle: error.message,
      });
    }
  },
};
