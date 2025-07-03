import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext.jsx';
import { ANIM_DURATION, VISIBLE_DURATION, animateElements } from '../../utils/animationUtils';
import { validarRegistro } from '../../utils/validaciones';

const Register = ({ onShowMessage: _onShowMessage, onRegisterSuccess: _onRegisterSuccess }) => {
  const { registerUser, loading } = useAuth();
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    return () => setErrors({});
  }, []);

  const handleRegister = async e => {
    e.preventDefault();
    setErrors({});
    setGlobalError('');

    const form = e.target;
    const formData = {
      nombre_cliente: form.nombre.value,
      email_cliente: form.email.value,
      telefono_cliente: form.telefono.value,
      contraseña_cliente: form.password.value
    };
    const confirmPassword = form.confirmPassword.value;

    // Usar validaciones centralizadas
    const validationErrors = validarRegistro(formData);
    
    // Validar confirmación de contraseña
    if (!confirmPassword) {
      validationErrors.confirmPassword = t('confirma_contrasena');
    } else if (confirmPassword !== formData.contraseña_cliente) {
      validationErrors.confirmPassword = t('contrasenas_no_coinciden');
    }
      

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

    if (Object.keys(validationErrors).length > 0) {
      manejarErroresDeCampo(validationErrors);
      return;
    }

    const result = await registerUser({
      nombre_cliente: formData.nombre_cliente.trim(),
      email_cliente: formData.email_cliente.trim(),
      telefono_cliente: formData.telefono_cliente.trim(),
      contraseña_cliente: formData.contraseña_cliente,
    });

    if (result && result.success) {
      setSuccessMessage(result.message || t('registro_exitoso'));
      setTimeout(() => {
        setSuccessMessage('');
        navigate('/');
      }, 2000);
      form.reset();
      return;
    } else {
      setGlobalError(result.message || t('error_registro'));
      setTimeout(() => animateElements('#global-error-register', 'fade-in'), 0);
      setTimeout(() => {
        const el = document.getElementById('global-error-register');
        if (el) {
          el.classList.remove('fade-in');
          el.classList.add('fade-out');
        }
        setTimeout(() => setGlobalError(''), ANIM_DURATION);
      }, VISIBLE_DURATION);
    }
  };

  return (
    <div className="formulario__contenedor formulario__contenedor--register">
      <h2 className="modal__titulo">{t('crear_cuenta')}</h2>
      <form noValidate className="formulario" onSubmit={handleRegister}>
        <div className="formulario__campo">
          <label className="formulario__label" htmlFor="nombre-register">
            {t('nombre_completo')}
          </label>
          <input
            autoComplete="name"
            className={`formulario__input ${errors.nombre_cliente ? 'input--error' : ''}`}
            disabled={loading}
            id="nombre-register"
            name="nombre"
            placeholder={t('ej_nombre')}
            type="text"
          />
          {errors.nombre_cliente && <small className="formulario__mensaje-error">{errors.nombre_cliente}</small>}
        </div>

        <div className="formulario__campo">
          <label className="formulario__label" htmlFor="email-register">
            {t('correo_electronico')}
          </label>
          <input
            autoComplete="email"
            className={`formulario__input ${errors.email_cliente ? 'input--error' : ''}`}
            disabled={loading}
            id="email-register"
            name="email"
            placeholder={t('ej_email')}
            type="email"
          />
          {errors.email_cliente && <small className="formulario__mensaje-error">{errors.email_cliente}</small>}
        </div>

        <div className="formulario__campo">
          <label className="formulario__label" htmlFor="telefono-register">
            {t('telefono')}
          </label>
          <input
            autoComplete="tel"
            className={`formulario__input ${errors.telefono_cliente ? 'input--error' : ''}`}
            disabled={loading}
            id="telefono-register"
            name="telefono"
            placeholder={t('ej_telefono')}
            type="tel"
          />
          {errors.telefono_cliente && <small className="formulario__mensaje-error">{errors.telefono_cliente}</small>}
        </div>

        <div className="formulario__campo">
          <label className="formulario__label" htmlFor="password-register">
            {t('contrasena')}
          </label>
          <input
            autoComplete="new-password"
            className={`formulario__input ${errors.contraseña_cliente ? 'input--error' : ''}`}
            disabled={loading}
            id="password-register"
            name="password"
            placeholder={t('ej_contrasena')}
            type="password"
          />
          {errors.contraseña_cliente && <small className="formulario__mensaje-error">{errors.contraseña_cliente}</small>}
        </div>

        <div className="formulario__campo">
          <label className="formulario__label" htmlFor="confirmPassword-register">
            {t('confirmar_contrasena')}
          </label>
          <input
            autoComplete="new-password"
            className={`formulario__input ${errors.confirmPassword ? 'input--error' : ''}`}
            disabled={loading}
            id="confirmPassword-register"
            name="confirmPassword"
            placeholder={t('ej_contrasena')}
            type="password"
          />
          {errors.confirmPassword && (
            <small className="formulario__mensaje-error">{errors.confirmPassword}</small>
          )}
        </div>

        {globalError && (
          <div
            className="formulario__mensaje-error"
            id="global-error-register"
          >
            {globalError}
          </div>
        )}

        {successMessage && (
          <div className="formulario__mensaje-exito">
            {successMessage}
          </div>
        )}

        <button className="formulario__boton-principal" disabled={loading} type="submit">
          {loading ? t('registrando') : t('registrarse')}
        </button>
      </form>
    </div>
  );
};

Register.propTypes = {
  onShowMessage: PropTypes.func.isRequired,
  onRegisterSuccess: PropTypes.func.isRequired,
};

export default Register;
