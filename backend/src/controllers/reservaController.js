import { reservaModel } from "../models/reservaModel.js"; // Importar el nuevo modelo de reserva
import * as authModel from "../models/authModel.js"; // Importar authModel para manejar clientes
import { generateReservationPassword } from "../utils/passwordGenerator.js";
import { sendTemporaryPasswordEmail } from "../services/emailService.js";
import { createSecureLogger } from "../utils/logger.js";

const logger = createSecureLogger("reservaController");

/**
 * Maneja la solicitud para crear una nueva reserva.
 * @param {Object} req - El objeto de solicitud de Express.
 * @param {Object} res - El objeto de respuesta de Express.
 */
export const hacerReserva = async (req, res) => {
  const startTime = Date.now();

  // ✅ MEJORADO: Logging seguro
  logger.info("Nueva solicitud de reserva recibida", {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    hasAuth: !!req.user,
  });

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
    // Validación simple de 10 dígitos
    errors.telefono = "El teléfono debe tener 10 dígitos.";
  }
  if (
    !datosReserva.email ||
    typeof datosReserva.email !== "string" ||
    datosReserva.email.trim() === ""
  ) {
    errors.email = "El correo electrónico es obligatorio.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosReserva.email.trim())) {
    // Validación básica de email
    errors.email = "El formato del correo electrónico no es válido.";
  }

  // Si hay errores de validación, enviar respuesta 400
  if (Object.keys(errors).length > 0) {
    logger.warn("Errores de validación en reserva", {
      errors: Object.keys(errors),
      ip: req.ip,
    });
    return res
      .status(400)
      .json({ message: "Error en los datos de la reserva.", errors });
  }

  try {
    // 1. Buscar cliente por email (incluyendo no verificados/inactivos)
    let cliente = await authModel.getUserByEmailIncludingUnverified(
      datosReserva.email,
    );

    // ✅ MEJORADO: Si el cliente no existe, crearlo con contraseña temporal segura
    if (!cliente) {
      logger.info("Cliente no encontrado, creando cuenta temporal", {
        email: datosReserva.email.replace(/(.{3}).+(.{3}@.+)/, "$1***$2"),
        ip: req.ip,
      });

      try {
        // ✅ MEJORADO: Generar contraseña temporal segura
        const tempPasswordData = generateReservationPassword();

        const nuevoClienteId = await authModel.registerUser({
          nombre_cliente: datosReserva.nombre,
          email_cliente: datosReserva.email,
          telefono_cliente: datosReserva.telefono,
          contraseña_cliente: tempPasswordData.password,
        });

        // Obtener el objeto cliente recién creado
        cliente = await authModel.getUserByEmailIncludingUnverified(
          datosReserva.email,
        );
        if (!cliente) {
          throw new Error("Error al obtener el cliente recién creado.");
        }

        // ✅ MEJORADO: Enviar email con contraseña temporal
        try {
          await sendTemporaryPasswordEmail({
            email: datosReserva.email,
            nombre: datosReserva.nombre,
            password: tempPasswordData.password,
            expiresIn: tempPasswordData.expiresIn,
            reason: "reserva",
          });

          logger.info("Cuenta temporal creada y email enviado", {
            clienteId: cliente.id_cliente,
            email: datosReserva.email.replace(/(.{3}).+(.{3}@.+)/, "$1***$2"),
            passwordStrength: tempPasswordData.strength.level,
          });
        } catch (emailError) {
          logger.error("Error enviando email de contraseña temporal", {
            clienteId: cliente.id_cliente,
            error: emailError.message,
          });

          // No fallar la reserva por error de email, pero informar al usuario
          logger.warn("Reserva continuará sin notificación por email");
        }
      } catch (error) {
        // Si el correo o teléfono ya existe, buscar el cliente existente
        if (
          error.message.includes("correo ya está registrado") ||
          error.message.includes("teléfono ya está registrado")
        ) {
          cliente = await authModel.getUserByEmailIncludingUnverified(
            datosReserva.email,
          );
          if (!cliente) {
            throw new Error(
              "Error al obtener el cliente existente tras intento de registro.",
            );
          }

          logger.info("Cliente ya existía, usando cuenta existente", {
            clienteId: cliente.id_cliente,
            email: datosReserva.email.replace(/(.{3}).+(.{3}@.+)/, "$1***$2"),
          });
        } else {
          logger.error("Error creando cliente temporal", {
            error: error.message,
            email: datosReserva.email.replace(/(.{3}).+(.{3}@.+)/, "$1***$2"),
          });
          throw error;
        }
      }
    }

    const id_cliente = cliente.id_cliente;

    // Verificar si el cliente está activo y verificado
    if (!cliente.activo || !cliente.email_verificado) {
      logger.warn("Intento de reserva con cuenta no verificada", {
        clienteId: cliente.id_cliente,
        activo: cliente.activo,
        verificado: cliente.email_verificado,
        ip: req.ip,
      });

      return res.status(403).json({
        message:
          "No puedes crear una reservación hasta que verifiques tu cuenta. Por favor revisa tu correo electrónico.",
      });
    }

    // Usar el nuevo modelo para crear la reserva en la base de datos MySQL
    const reservaId = await reservaModel.createReserva({
      id_cliente: id_cliente,
      numero_personas: datosReserva.personas,
      fecha_reservacion: datosReserva.fecha,
      hora_reservacion: datosReserva.hora,
      notas: datosReserva.peticiones,
    });

    // ✅ MEJORADO: Logging seguro de reserva exitosa
    const processingTime = Date.now() - startTime;
    logger.info("Reserva creada exitosamente", {
      reservaId: reservaId,
      clienteId: id_cliente,
      fecha: datosReserva.fecha,
      hora: datosReserva.hora,
      personas: datosReserva.personas,
      processingTime: `${processingTime}ms`,
      ip: req.ip,
    });

    res.status(201).json({
      message: "Reserva creada con éxito!",
      reservaId: reservaId,
      fecha: datosReserva.fecha,
      hora: datosReserva.hora,
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;

    // ✅ MEJORADO: Logging seguro de errores
    logger.error("Error al crear reserva", {
      error: error.message,
      processingTime: `${processingTime}ms`,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    if (error.message.includes("No hay disponibilidad")) {
      return res.status(400).json({ message: error.message });
    }

    res
      .status(500)
      .json({ message: "Error interno del servidor al crear la reserva." });
  }
};

// Obtener horarios disponibles para una fecha
export const getHorariosDisponibles = async (req, res) => {
  try {
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({
        message: "Se requiere la fecha para obtener los horarios disponibles",
      });
    }

    const horariosDisponibles =
      await reservaModel.getHorariosDisponibles(fecha);
    res.json({ horariosDisponibles });
  } catch (error) {
    console.error("Error al obtener horarios disponibles:", error);
    res.status(500).json({ message: "Error al obtener horarios disponibles" });
  }
};

// Verificar disponibilidad específica
export const checkDisponibilidad = async (req, res) => {
  try {
    const { fecha, hora } = req.query;

    if (!fecha || !hora) {
      return res.status(400).json({
        message: "Se requieren fecha y hora para verificar disponibilidad",
      });
    }

    const disponible = await reservaModel.checkDisponibilidad(fecha, hora);
    res.json({ disponible });
  } catch (error) {
    console.error("Error al verificar disponibilidad:", error);
    res.status(500).json({ message: "Error al verificar disponibilidad" });
  }
};

/**
 * Obtener historial de reservaciones del usuario autenticado
 */
export const getHistorialReservas = async (req, res) => {
  try {
    console.log("req.user en getHistorialReservas:", req.user);
    if (!req.user || !req.user.id) {
      console.log("Usuario no autenticado o id faltante");
      return res
        .status(401)
        .json({ message: "No autorizado: usuario no autenticado." });
    }
    const id_cliente = req.user.id;
    console.log("id_cliente usado para buscar reservas:", id_cliente);
    const reservas = await reservaModel.getReservasByUser(id_cliente);
    console.log("Reservas encontradas:", reservas);
    res.json(reservas);
  } catch (error) {
    console.error("Error en getHistorialReservas:", error);
    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      res.status(500).json({ message: "Error de acceso a la base de datos." });
    } else if (error.code === "ER_BAD_FIELD_ERROR") {
      res
        .status(500)
        .json({ message: "Error en la consulta de la base de datos." });
    } else {
      res.status(500).json({
        message: "Error al obtener historial de reservaciones",
        detalle: error.message,
      });
    }
  }
};
