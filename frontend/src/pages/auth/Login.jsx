import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext.jsx';
import { ANIM_DURATION, VISIBLE_DURATION, animateElements } from '../../utils/animationUtils';
import { validarLogin } from '../../utils/validaciones';
import { GoX, GoCheck } from 'react-icons/go';
import './AuthPage.css';

const Login = ({ onShowMessage, onLoginSuccess, onShowForgotPassword, onShowVerification }) => {
  const { login, loading, user } = useAuth();
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    return () => setErrors({});
  }, []);

  const manejarErroresDeCampo = newErrors => {
    setErrors(newErrors);
    setGlobalError('');
    setSuccessMessage('');
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
    setGlobalError('');
    setSuccessMessage('');

    const form = e.target;
    const formData = {
      correo_usuario: form.email.value,
      contraseña_usuario: form.password.value,
    };

    const validationErrors = validarLogin(formData);
    if (Object.keys(validationErrors).length > 0) {
      manejarErroresDeCampo(validationErrors);
      return;
    }

    const result = await login(formData.correo_usuario.trim(), formData.contraseña_usuario);

    if (result && result.success) {
      // Mostrar mensaje de éxito en alertas globales

      // Mostrar mensaje de éxito en el propio formulario
      setSuccessMessage(t('login_exito'));

      // Redireccionar según el rol del usuario después de un pequeño delay
      setTimeout(() => {
        navigate('/redirect');
      }, 1000);

      if (onLoginSuccess) onLoginSuccess();
    } else {
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
            className={`formulario__input_login ${errors.correo_usuario ? 'input--error' : ''}`}
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
            className={`formulario__input_login ${errors.contraseña_usuario ? 'input--error' : ''}`}
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

        {/* 📌 Bloque de alertas arriba del botón */}
        <div className="formulario__alertas">
          {successMessage && (
            <LoginAlert message={successMessage} id="global-success-login" type="success" />
          )}
          {globalError && <LoginAlert message={globalError} id="global-error-login" type="error" />}
        </div>

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

const LoginAlert = ({ message, id, type }) => {
  if (!message) return null;

  const Icon = type === 'success' ? GoCheck : GoX;

  return (
    <div
      id={id}
      className={`alerta-sin-tarjeta alerta-sin-tarjeta--grande ${
        type === 'success' ? 'success' : 'error'
      }`}
    >
      <Icon className="alerta__icono" />
      <span>{message}</span>
    </div>
  );
};

LoginAlert.propTypes = {
  message: PropTypes.string.isRequired,
  id: PropTypes.string,
  type: PropTypes.oneOf(['success', 'error']),
};

export default Login;
