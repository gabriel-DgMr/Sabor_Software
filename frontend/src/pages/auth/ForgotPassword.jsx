/**
 * Componente ForgotPassword
 * 
 * Este componente maneja la solicitud inicial de recuperación de contraseña.
 * Permite al usuario ingresar su correo electrónico para recibir un enlace de recuperación.
 */

import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { ANIM_DURATION, VISIBLE_DURATION, animateElements } from '../../utils/animationUtils';

const ForgotPassword = ({ onShowMessage }) => {
  // Estados para manejar la carga y errores del formulario
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /**
   * Maneja los errores de validación de campos
   * Muestra los mensajes de error con animación y los oculta después de un tiempo
   * @param {Object} newErrors - Objeto con los errores de validación
   */
  const manejarErroresDeCampo = newErrors => {
    setErrors(newErrors);
    // Animar la aparición de los mensajes de error
    setTimeout(() => animateElements('.formulario__mensaje-error', 'fade-in'), 0);
    // Ocultar los mensajes después de VISIBLE_DURATION
    setTimeout(() => {
      document.querySelectorAll('.formulario__mensaje-error').forEach(el => {
        el.classList.remove('fade-in');
        el.classList.add('fade-out');
      });
      // Limpiar los errores después de la animación
      setTimeout(() => setErrors({}), ANIM_DURATION);
    }, VISIBLE_DURATION);
  };

  /**
   * Maneja el envío del formulario de recuperación de contraseña
   * Valida el correo electrónico y envía la solicitud al servidor
   * @param {Event} e - Evento del formulario
   */
  const handleSubmit = async e => {
    e.preventDefault();
    setErrors({});

    const form = e.target;
    const email_cliente = form.email.value.trim();

    // Validación del correo electrónico
    const newErrors = {};
    if (!email_cliente) {
      newErrors.email = 'El correo es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_cliente)) {
      newErrors.email = 'El correo no es válido.';
    }

    // Si hay errores, mostrarlos y detener el proceso
    if (Object.keys(newErrors).length > 0) {
      manejarErroresDeCampo(newErrors);
      return;
    }

    try {
      setLoading(true);
      // Enviar solicitud al servidor
      const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email_cliente }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al solicitar recuperación de contraseña');
      }

      // Mostrar mensaje de éxito y limpiar el formulario
      onShowMessage('success', 'Se ha enviado un correo con las instrucciones para recuperar tu contraseña.');
      form.reset();
    } catch (error) {
      onShowMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formulario__contenedor formulario__contenedor--forgot-password">
      <h2 className="modal__titulo">Recuperar Contraseña</h2>
      <form noValidate className="formulario" onSubmit={handleSubmit}>
        <div className="formulario__campo">
          <label className="formulario__label" htmlFor="email-forgot">
            Correo Electrónico*
          </label>
          <input
            autoComplete="email"
            className={`formulario__input ${errors.email ? 'input--error' : ''}`}
            disabled={loading}
            id="email-forgot"
            name="email"
            placeholder="Tu Correo Electrónico"
            type="email"
          />
          {errors.email && <small className="formulario__mensaje-error">{errors.email}</small>}
        </div>

        <button className="formulario__boton-principal" disabled={loading} type="submit">
          {loading ? 'Enviando...' : 'Enviar Instrucciones'}
        </button>
      </form>
    </div>
  );
};

ForgotPassword.propTypes = {
  onShowMessage: PropTypes.func.isRequired,
};

export default ForgotPassword; 