import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import { useAuth } from '../../context/AuthContext.jsx';
import { ANIM_DURATION, VISIBLE_DURATION, animateElements } from '../../utils/animationUtils';
import { validarCaracteresEspeciales } from '../../utils/validaciones';


const Login = ({ onShowMessage, onLoginSuccess, onShowForgotPassword }) => {
  const { login, loading } = useAuth();
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');

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
    const email_cliente = form.email.value.trim();
    const contraseña_cliente = form.password.value;

    const newErrors = {};

    // Validar caracteres especiales en el correo
    const errorEmail = validarCaracteresEspeciales(email_cliente, "correo");
    if (errorEmail) {
      newErrors.email = errorEmail;
    }

    // Validar caracteres especiales en la contraseña
    const errorPassword = validarCaracteresEspeciales(contraseña_cliente, "contraseña");
    if (errorPassword) {
      newErrors.password = errorPassword;
    }

    if (!email_cliente) {
      newErrors.email = 'El correo es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_cliente)) {
      newErrors.email = 'El correo no es válido.';
    }
    if (!contraseña_cliente) {
      newErrors.password = 'La contraseña es obligatoria.';
    }

    if (Object.keys(newErrors).length > 0) {
      manejarErroresDeCampo(newErrors);
      return;
    }

    const result = await login(email_cliente, contraseña_cliente);

    if (result && result.success) {
      onShowMessage('success', 'Inicio de sesión exitoso.');
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setGlobalError(result.message || 'Error al iniciar sesión.');
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
      <h2 className="modal__titulo">Iniciar Sesión</h2>
      <form noValidate className="formulario" onSubmit={handleLogin}>
        <div className="formulario__campo">
          <label className="formulario__label" htmlFor="email-login">
            Correo Electrónico*
          </label>
          <input
            autoComplete="email"
            className={`formulario__input ${errors.email ? 'input--error' : ''}`}
            disabled={loading}
            id="email-login"
            name="email"
            placeholder="Tu Correo Electrónico"
            type="email"
          />
          {errors.email && <small className="formulario__mensaje-error">{errors.email}</small>}
        </div>

        <div className="formulario__campo">
          <label className="formulario__label" htmlFor="password-login">
            Contraseña*
          </label>
          <input
            autoComplete="current-password"
            className={`formulario__input ${errors.password ? 'input--error' : ''}`}
            disabled={loading}
            id="password-login"
            name="password"
            placeholder="Tu Contraseña"
            type="password"
          />
          {errors.password && <small className="formulario__mensaje-error">{errors.password}</small>}
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
          {loading ? 'Iniciando...' : 'Iniciar Sesión'}
        </button>
        <button
          type="button"
          className="formulario__olvidar-contraseña"
          onClick={() => onShowForgotPassword()}
        >
          ¿Olvidaste tu contraseña?
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
