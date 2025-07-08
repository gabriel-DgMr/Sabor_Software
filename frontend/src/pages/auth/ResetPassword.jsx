/**
 * Componente ResetPassword
 * 
 * Este componente maneja el proceso de restablecimiento de contraseña.
 * Se muestra cuando el usuario hace clic en el enlace de recuperación enviado por correo.
 * Permite al usuario establecer una nueva contraseña después de verificar el token.
 */

import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { ANIM_DURATION, VISIBLE_DURATION, animateElements } from '../../utils/animationUtils';

const ResetPassword = ({ onShowMessage }) => {
  const { t } = useTranslation();
  // Estados para manejar la carga, errores y datos del formulario
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [email, setEmail] = useState('');
  const [isTokenVerified, setIsTokenVerified] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  /**
   * Efecto para verificar la validez del token de recuperación
   * Se ejecuta una sola vez al montar el componente
   */
  useEffect(() => {
    let isMounted = true;

    const verifyToken = async () => {
      // Evitar verificación si no hay token o ya fue verificado
      if (!token || isTokenVerified) return;

      try {
        setLoading(true);
        // Verificar el token con el servidor
        const response = await fetch(`http://localhost:3000/api/auth/reset-password/${token}`);
        const data = await response.json();
        
        // Evitar actualizaciones si el componente se desmontó
        if (!isMounted) return;

        if (response.ok) {
          setEmail(data.email);
          setIsTokenVerified(true);
        } else {
          onShowMessage('error', t('reset_invalid_link'));
          setTimeout(() => navigate('/login'), VISIBLE_DURATION + ANIM_DURATION);
        }
      } catch (_error) {
        if (!isMounted) return;
        onShowMessage('error', t('reset_error_verifying_link'));
        setTimeout(() => navigate('/login'), VISIBLE_DURATION + ANIM_DURATION);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    verifyToken();

    // Limpiar al desmontar el componente
    return () => {
      isMounted = false;
    };
  }, [token, navigate, onShowMessage, isTokenVerified, t]);

  /**
   * Maneja los errores de validación de campos
   * Muestra los mensajes de error con animación y los oculta después de un tiempo
   * @param {Object} newErrors - Objeto con los errores de validación
   */
  const manejarErroresDeCampo = newErrors => {
    setErrors(newErrors);
    setTimeout(() => animateElements('.formulario__mensaje-error', 'fade-in'), 0);
    setTimeout(() => {
      document.querySelectorAll('.formulario__mensaje-error').forEach(el => {
        el.classList.remove('fade-in');
        el.classList.add('fade-out');
      });
      setTimeout(() => setErrors({}), ANIM_DURATION);
    }, VISIBLE_DURATION);
  };

  /**
   * Maneja el envío del formulario de restablecimiento de contraseña
   * Valida la nueva contraseña y la envía al servidor
   * @param {Event} e - Evento del formulario
   */
  const handleSubmit = async e => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const form = e.target;
    const contraseña_cliente = form.password.value;
    const confirmarContraseña = form.confirmPassword.value;

    // Validación de la nueva contraseña
    const newErrors = {};
    if (!contraseña_cliente) {
      newErrors.password = t('reset_password_required');
    } else if (contraseña_cliente.length < 8) {
      newErrors.password = t('reset_password_min_length');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(contraseña_cliente)) {
      newErrors.password = t('reset_password_complexity');
    }

    // Validación de confirmación de contraseña
    if (!confirmarContraseña) {
      newErrors.confirmPassword = t('reset_confirm_required');
    } else if (contraseña_cliente !== confirmarContraseña) {
      newErrors.confirmPassword = t('contrasenas_no_coinciden');
    }

    // Si hay errores, mostrarlos y detener el proceso
    if (Object.keys(newErrors).length > 0) {
      manejarErroresDeCampo(newErrors);
      setLoading(false);
      return;
    }

    try {
      // Enviar la nueva contraseña al servidor
      const response = await fetch(`http://localhost:3000/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contraseña_cliente }),
      });

      const data = await response.json();

      if (response.ok) {
        onShowMessage('success', t('reset_success'));
      } else {
        onShowMessage('error', data.message || t('reset_error'));
      }
    } catch (_error) {
      onShowMessage('error', t('reset_error_server'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formulario__contenedor formulario__contenedor--reset-password">
      <h2 className="modal__titulo">{t('reset_title')}</h2>
      <p className="formulario__subtitulo">
        {t('reset_subtitle', { email })}
      </p>
      <form noValidate className="formulario" onSubmit={handleSubmit}>
        <div className="formulario__campo">
          <label className="formulario__label" htmlFor="password-reset">
            {t('reset_new_password')}
          </label>
          <input
            autoComplete="new-password"
            className={`formulario__input ${errors.password ? 'input--error' : ''}`}
            disabled={loading}
            id="password-reset"
            name="password"
            placeholder={t('reset_placeholder_password')}
            type="password"
          />
          {errors.password && <small className="formulario__mensaje-error">{errors.password}</small>}
        </div>

        <div className="formulario__campo">
          <label className="formulario__label" htmlFor="confirm-password-reset">
            {t('reset_confirm_password')}
          </label>
          <input
            autoComplete="new-password"
            className={`formulario__input ${errors.confirmPassword ? 'input--error' : ''}`}
            disabled={loading}
            id="confirm-password-reset"
            name="confirmPassword"
            placeholder={t('reset_placeholder_confirm')}
            type="password"
          />
          {errors.confirmPassword && (
            <small className="formulario__mensaje-error">{errors.confirmPassword}</small>
          )}
        </div>

        <button className="formulario__boton-principal" disabled={loading} type="submit">
          {loading ? t('reset_updating') : t('reset_update_password')}
        </button>
      </form>
    </div>
  );
};

ResetPassword.propTypes = {
  onShowMessage: PropTypes.func.isRequired,
};

export default ResetPassword; 