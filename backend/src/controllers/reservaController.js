import { reservaModel } from "../models/reservaModel.js"; // Importar el nuevo modelo de reserva
import * as authModel from "../models/authModel.js"; // Importar authModel para manejar clientes
import nodemailer from "nodemailer";
import { config } from "../config/config.js";

// Configurar el transporter de nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

/**
 * Maneja la solicitud para crear una nueva reserva.
 * @param {Object} req - El objeto de solicitud de Express.
 * @param {Object} res - El objeto de respuesta de Express.
 */
export const hacerReserva = async (req, res) => {
  console.log("BODY RECIBIDO EN BACKEND:", req.body);
  // Permitir reservas sin autenticación
  // Si req.user existe, usar su email, si no, usar el del body
  const datosReserva = req.body;
  console.log(
    "Datos de reserva recibidos para validación y creación:",
    datosReserva,
  );

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
    console.log("Errores de validación:", errors);
    return res
      .status(400)
      .json({ message: "Error en los datos de la reserva.", errors });
  }

  try {
    // 1. Buscar cliente por email (incluyendo no verificados/inactivos)
    let cliente = await authModel.getUserByEmailIncludingUnverified(
      datosReserva.email,
    );

    // 2. Si el cliente no existe, crearlo
    if (!cliente) {
      console.log("cliente no encontrado, creando nuevo...");
      try {
        const nuevoclienteId = await authModel.registerUser({
          nombre_cliente: datosReserva.nombre,
          email_cliente: datosReserva.email,
          telefono_cliente: datosReserva.telefono,
          contraseña_cliente: "temporal_password_for_reservation",
        });
        // Obtener el objeto cliente recién creado para obtener el id
        cliente = await authModel.getUserByEmailIncludingUnverified(
          datosReserva.email,
        );
        if (!cliente) {
          throw new Error("Error al obtener el cliente recién creado.");
        }
        console.log("cliente creado con ID:", cliente.id_usuario);
      } catch (error) {
        // Si el correo o teléfono ya existe, buscar el cliente existente y continuar
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
          console.log("cliente ya existía, usando ID:", cliente.id_usuario);
        } else {
          throw error;
        }
      }
    }

    const id_usuario = cliente.id_usuario;

    // Verificar si el cliente está activo y verificado
    if (!cliente.activo || !cliente.email_verificado) {
      return res.status(403).json({
        message:
          "No puedes crear una reservación hasta que verifiques tu cuenta. Por favor revisa tu correo electrónico.",
      });
    }

    // Usar el nuevo modelo para crear la reserva en la base de datos MySQL
    // Pasar id_usuario en lugar de nombre, telefono, email
    const reservaId = await reservaModel.createReserva({
      id_usuario: id_usuario,
      numero_personas: datosReserva.personas,
      fecha_reservacion: datosReserva.fecha,
      hora_reservacion: datosReserva.hora,
      notas: datosReserva.peticiones,
    });

    console.log("Reserva guardada con éxito con ID:", reservaId);

    // Obtener los detalles de la reserva incluyendo la mesa asignada
    const reservaDetails = await reservaModel.getReservaById(reservaId);

    // Enviar correo de confirmación
    const mailOptions = {
      from: config.email.user,
      to: datosReserva.email,
      subject: "Confirmación de Reserva - Sabor",
      html: `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      
      <!-- Encabezado -->
      <h2 style="color: #e65100; text-align: center; margin-bottom: 10px;">¡Tu reserva ha sido confirmada!</h2>
      <p style="text-align: center; font-size: 16px;">Hola <strong>${datosReserva.nombre}</strong>,</p>
      <p style="text-align: center; font-size: 15px;">Tu mesa en <strong>Sabor</strong> ya está lista para recibirte.</p>
      
      <!-- Detalles de la reserva -->
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 12px; margin: 25px 0; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
        <h3 style="color: #444; margin-top: 0; margin-bottom: 15px;">Detalles de la Reserva</h3>
        <ul style="list-style: none; padding: 0; margin: 0; font-size: 15px; line-height: 1.6;">
          <li><strong>Fecha:</strong> ${datosReserva.fecha}</li>
          <li><strong>Hora:</strong> ${datosReserva.hora}</li>
          <li><strong>Número de personas:</strong> ${datosReserva.personas}</li>
          <li><strong>Mesa asignada:</strong> ${reservaDetails.id_mesa}</li>
          ${datosReserva.peticiones ? `<li><strong>Peticiones especiales:</strong> ${datosReserva.peticiones}</li>` : ""}
        </ul>
      </div>

      <!-- Número de reserva -->
      <p style="font-size: 15px; text-align: center; margin: 20px 0;">
        <strong style="color: #e65100;">Número de reserva:</strong> #${reservaId}
      </p>

      <!-- Botón -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://tusabor.com/reservas/${reservaId}" 
          style="background-color: #ff6f00; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">
          Ver mi reserva
        </a>
      </div>

      <!-- Importante -->
      <div style="background-color: #fff8f1; padding: 18px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #ff9800;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #444;">Importante:</p>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.5; color: #555;">
          <li>Llega 10 minutos antes de tu hora reservada</li>
          <li>Si necesitas cancelar o modificar tu reserva, hazlo con al menos 2 horas de anticipación</li>
          <li>La reserva se mantendrá por 15 minutos después de la hora programada</li>
        </ul>
      </div>

      <!-- Despedida -->
      <p style="text-align: center; font-size: 15px;">Te esperamos con gusto en <strong>Sabor</strong>.</p>

      <!-- Footer -->
      <p style="color: #999; font-size: 13px; text-align: center; margin-top: 40px;">
        Saludos,<br>
        El equipo de Sabor
      </p>
    </div>
  `,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(201)
      .json({ message: "Reserva creada con éxito!", reservaId: reservaId });
  } catch (error) {
    console.error("Error al guardar la reserva:", error);
    if (error.message && error.message.includes("No hay disponibilidad")) {
      return res.status(400).json({ message: error.message });
    }
    // Siempre responder con JSON en caso de error
    res.status(500).json({
      message: "Error interno del servidor al crear la reserva.",
      detalle: error.message,
    });
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
 * Obtener historial de reservaciones del cliente autenticado
 */
export const getHistorialReservas = async (req, res) => {
  try {
    console.log("req.user en getHistorialReservas:", req.user);
    if (!req.user || !req.user.id) {
      console.log("cliente no autenticado o id faltante");
      return res
        .status(401)
        .json({ message: "No autorizado: cliente no autenticado." });
    }
    const id_usuario = req.user.id;
    console.log("id_usuario usado para buscar reservas:", id_usuario);
    const reservas = await reservaModel.getReservasByUser(id_usuario);
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
