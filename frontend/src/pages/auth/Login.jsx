import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../context/AuthContext.jsx';
import { ANIM_DURATION, VISIBLE_DURATION, animateElements } from '../../utils/animationUtils';
import { validarLogin } from '../../utils/validaciones';
import { GoX } from 'react-icons/go';

const Login = ({ onShowMessage, onLoginSuccess, onShowForgotPassword, onShowVerification }) => {
  const { login, loading } = useAuth();
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    return () => setErrors({});
  }, []);

  const manejarErroresDeCampo = newErrors => {
    setErrors(newErrors);
    setGlobalError('');
    setTimeout(() => animateElements('.formulario__mensaje-error', 'fade-in'), 0);
    setTimeout(() => {
      document.querySelectorAll('.formulario__mensaje-error').forEach(el => {
        el.classList.remove('fade-in');
        el.classList.add('fade-out');
      });
      setTimeout(() => setErrors({}), ANIM_DURATION);
    }, VISIBLE_DURATION);
  };

  const handleLogin = async e => {
    e.preventDefault();
    setErrors({});

    const form = e.target;
    const formData = {
      correo_usuario: form.email.value,
      contraseña_usuario: form.password.value,
    };

    // Usar validaciones centralizadas
    const validationErrors = validarLogin(formData);

    if (Object.keys(validationErrors).length > 0) {
      manejarErroresDeCampo(validationErrors);
      return;
    }

    const result = await login(formData.correo_usuario.trim(), formData.contraseña_usuario);

    if (result && result.success) {
      onShowMessage('success', t('login_exito'));
      if (onLoginSuccess) onLoginSuccess();
    } else {
      // Mostrar solo el mensaje real del backend
      setGlobalError(result.message || t('login_error'));
      setTimeout(() => animateElements('#global-error-login', 'fade-in'), 0);
      setTimeout(() => {
        const el = document.getElementById('global-error-login');
        if (el) {
          el.classList.remove('fade-in');
          el.classList.add('fade-out');
        }
        setTimeout(() => setGlobalError(''), ANIM_DURATION);
      }, VISIBLE_DURATION);
    }
  };

  return (
    <div className="formulario__contenedor formulario__contenedor--login">
      <h2 className="modal__titulo">{t('iniciar_sesion')}</h2>
      <form noValidate className="formulario" onSubmit={handleLogin}>
        <div className="formulario__campo">
          <label className="formulario__label" htmlFor="email-login">
            {t('correo_electronico')}
          </label>
          <input
            autoComplete="email"
            className={`formulario__input ${errors.correo_usuario ? 'input--error' : ''}`}
            disabled={loading}
            id="email-login"
            name="email"
            placeholder={t('login_placeholder_email')}
            type="email"
          />
          {errors.correo_usuario && (
            <small className="formulario__mensaje-error">{errors.correo_usuario}</small>
          )}
        </div>

        <div className="formulario__campo">
          <label className="formulario__label" htmlFor="password-login">
            {t('contrasena')}
          </label>
          <input
            autoComplete="current-password"
            className={`formulario__input ${errors.contraseña_usuario ? 'input--error' : ''}`}
            disabled={loading}
            id="password-login"
            name="password"
            placeholder={t('login_placeholder_password')}
            type="password"
          />
          {errors.contraseña_usuario && (
            <small className="formulario__mensaje-error">{errors.contraseña_usuario}</small>
          )}
        </div>
        {globalError && <LoginAlert message={globalError} id="global-error-login" />}
        <button className="formulario__boton-principal" disabled={loading} type="submit">
          {loading ? t('login_iniciando') : t('iniciar_sesion')}
        </button>
        <button
          className="formulario__olvidar-contraseña"
          type="button"
          onClick={() => onShowForgotPassword()}
        >
          {t('login_olvidaste_contrasena')}
        </button>
      </form>
      {typeof window !== 'undefined' && localStorage.getItem('pendingVerificationEmail') && (
        <button
          className="formulario__boton-secundario"
          style={{ marginTop: '1rem' }}
          type="button"
          onClick={onShowVerification}
        >
          {t('volver_a_verificar_email') || 'Verificar mi email'}
        </button>
      )}
    </div>
  );
};

Login.propTypes = {
  onShowMessage: PropTypes.func.isRequired,
  onLoginSuccess: PropTypes.func.isRequired,
  onShowForgotPassword: PropTypes.func.isRequired,
  onShowVerification: PropTypes.func.isRequired,
};

// Componente de alerta visualmente consistente para login
const LoginAlert = ({ message, id }) => {
  if (!message) return null;
  return (
    <div id={id} className="alerta-sin-tarjeta alerta-sin-tarjeta--grande">
      <GoX className="GoX" />
      <span>{message}</span>
    </div>
  );
};

export default Login;
