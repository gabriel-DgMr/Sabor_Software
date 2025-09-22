/**
 * Componente ForgotPassword
 *
 * Este componente maneja la solicitud inicial de recuperación de contraseña.
 * Permite al cliente ingresar su correo electrónico para recibir un enlace de recuperación.
 */

import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ANIM_DURATION, VISIBLE_DURATION, animateElements } from '../../utils/animationUtils';
import { validarEmail } from '../../utils/validaciones';

const ForgotPassword = ({ onShowMessage }) => {
  const { t } = useTranslation();
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
    const correo_usuario = form.correo_usuario.value;

    // Validación del correo electrónico usando funciones centralizadas
    const newErrors = {};
    if (!correo_usuario) {
      newErrors.correo = t('forgot_email_required');
    } else {
      const correoError = validarEmail(correo_usuario);
      if (correoError) {
        newErrors.correo = t('forgot_email_invalid');
      }
    }

    // Si hay errores, mostrarlos y detener el proceso
    if (Object.keys(newErrors).length > 0) {
      manejarErroresDeCampo(newErrors);
      return;
    }

    try {
      setLoading(true);
      // Enviar solicitud al servidor
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || '/api'}/auth/forgot-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ correo_usuario: correo_usuario.trim() }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('forgot_error_request'));
      }

      // Mostrar mensaje de éxito y limpiar el formulario
      onShowMessage('success', t('forgot_success'));
      form.reset();
    } catch (error) {
      onShowMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formulario__contenedor formulario__contenedor--forgot-password">
      <h2 className="modal__titulo">{t('forgot_title')}</h2>
      <form noValidate className="formulario" onSubmit={handleSubmit}>
        <div className="formulario__campo">
          <label className="formulario__label" htmlFor="email-forgot">
            {t('correo_electronico')}
          </label>
          <input
            autoComplete="email"
            className={`formulario__input ${errors.email ? 'input--error' : ''}`}
            disabled={loading}
            id="email-forgot"
            name="correo_usuario"
            placeholder={t('login_placeholder_email')}
            type="email"
          />
          {errors.email && <small className="formulario__mensaje-error">{errors.email}</small>}
        </div>

        <button className="formulario__boton-principal" disabled={loading} type="submit">
          {loading ? t('forgot_sending') : t('forgot_send_instructions')}
        </button>
      </form>
    </div>
  );
};

ForgotPassword.propTypes = {
  onShowMessage: PropTypes.func.isRequired,
};

export default ForgotPassword;
