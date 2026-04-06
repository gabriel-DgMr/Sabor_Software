import * as contactoQueries from "./queries.js";

/**
 * Procesa y guarda un mensaje de contacto.
 * @param {Object} contactData - Datos del contacto.
 * @returns {Promise<number>} ID del mensaje creado.
 */
export const procesarMensajeContacto = async (contactData) => {
  // Aquí se podrían agregar validaciones adicionales o envío de correos en el futuro
  return await contactoQueries.crearMensajeContacto(contactData);
};
