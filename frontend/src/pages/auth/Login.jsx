import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../context/AuthContext.jsx';
import { ANIM_DURATION, VISIBLE_DURATION, animateElements } from '../../utils/animationUtils';
import { validarLogin } from '../../utils/validaciones';

const Login = ({ onShowMessage, onLoginSuccess, onShowForgotPassword }) => {
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
      email_cliente: form.email.value,
      contraseña_cliente: form.password.value
    };

    // Usar validaciones centralizadas
    const validationErrors = validarLogin(formData);

    if (Object.keys(validationErrors).length > 0) {
      manejarErroresDeCampo(validationErrors);
      return;
    }

    const result = await login(formData.email_cliente.trim(), formData.contraseña_cliente);

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
            className={`formulario__input ${errors.email_cliente ? 'input--error' : ''}`}
            disabled={loading}
            id="email-login"
            name="email"
            placeholder={t('login_placeholder_email')}
            type="email"
          />
          {errors.email_cliente && <small className="formulario__mensaje-error">{errors.email_cliente}</small>}
        </div>

        <div className="formulario__campo">
          <label className="formulario__label" htmlFor="password-login">
            {t('contrasena')}
          </label>
          <input
            autoComplete="current-password"
            className={`formulario__input ${errors.contraseña_cliente ? 'input--error' : ''}`}
            disabled={loading}
            id="password-login"
            name="password"
            placeholder={t('login_placeholder_password')}
            type="password"
          />
          {errors.contraseña_cliente && <small className="formulario__mensaje-error">{errors.contraseña_cliente}</small>}
        </div>
        {globalError && (
          <div
            className="formulario__mensaje-error"
            id="global-error-login"
            style={{ textAlign: 'center', marginBottom: '1rem' }}
          >
            {globalError}
          </div>
        )}
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
    </div>
  );
};

Login.propTypes = {
  onShowMessage: PropTypes.func.isRequired,
  onLoginSuccess: PropTypes.func.isRequired,
  onShowForgotPassword: PropTypes.func.isRequired,
};

export default Login;
