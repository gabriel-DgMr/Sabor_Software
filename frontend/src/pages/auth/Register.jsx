import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext.jsx';
import { ANIM_DURATION, VISIBLE_DURATION, animateElements } from '../../utils/animationUtils';
import { validarRegistro } from '../../utils/validaciones';
import { GoCheck, GoX } from 'react-icons/go';

import EmailVerification from './EmailVerification.jsx';

// Componente de alerta visualmente consistente para register
const RegisterAlert = ({ type, message }) => {
  if (!message) return null;
  const icon = type === 'success' ? <GoCheck className="GoCheck" /> : <GoX className="GoX" />;
  return (
    <div className="alerta-sin-tarjeta alerta-sin-tarjeta--grande">
      {icon}
      <span>{message}</span>
    </div>
  );
};

const Register = ({ onShowMessage: _onShowMessage, onRegisterSuccess: _onRegisterSuccess }) => {
  const { registerUser, loading } = useAuth();
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
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
      nombre_usuario: form.nombre.value,
      correo_usuario: form.email.value,
      telefono_usuario: form.telefono.value,
      contraseña_usuario: form.password.value,
    };
    const confirmPassword = form.confirmPassword.value;

    // Usar validaciones centralizadas
    const validationErrors = validarRegistro(formData);

    // Validar confirmación de contraseña
    if (!confirmPassword) {
      validationErrors.confirmPassword = t('confirma_contrasena');
    } else if (confirmPassword !== formData.contraseña_usuario) {
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
      nombre_usuario: formData.nombre_usuario.trim(),
      correo_usuario: formData.correo_usuario.trim(),
      telefono_usuario: formData.telefono_usuario.trim(),
      contraseña_usuario: formData.contraseña_usuario,
    });

    if (result && result.success) {
      if (result.requiresVerification) {
        // Mostrar pantalla de verificación
        setRegisteredEmail(formData.correo_usuario.trim());
        setShowVerification(true);
        localStorage.setItem('pendingVerificationEmail', formData.correo_usuario.trim());
      } else {
        setSuccessMessage(result.message || t('registro_exitoso'));
        setTimeout(() => {
          setSuccessMessage('');
          navigate('/');
        }, 2000);
        form.reset();
      }
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

  const handleVerificationSuccess = () => {
    setSuccessMessage(t('cuenta_activada_exitosamente'));
    setTimeout(() => {
      setSuccessMessage('');
      setShowVerification(false);
      localStorage.removeItem('pendingVerificationEmail');
      if (_onRegisterSuccess) {
        _onRegisterSuccess();
      } else {
        navigate('/');
      }
    }, 2000);
  };

  const handleBackToLogin = () => {
    setShowVerification(false);
    localStorage.removeItem('pendingVerificationEmail');
    if (_onRegisterSuccess) {
      _onRegisterSuccess();
    }
  };

  if (showVerification) {
    return (
      <EmailVerification
        email={registeredEmail}
        onBackToLogin={handleBackToLogin}
        onVerificationSuccess={handleVerificationSuccess}
      />
    );
  }

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
            className={`formulario__input_login ${errors.nombre_usuario ? 'input--error' : ''}`}
            disabled={loading}
            id="nombre-register"
            name="nombre"
            placeholder={t('ej_nombre')}
            type="text"
          />
          {errors.nombre_usuario && (
            <small className="formulario__mensaje-error">{errors.nombre_usuario}</small>
          )}
        </div>

        <div className="formulario__campo">
          <label className="formulario__label" htmlFor="email-register">
            {t('correo_electronico')}
          </label>
          <input
            autoComplete="email"
            className={`formulario__input_login ${errors.correo_usuario ? 'input--error' : ''}`}
            disabled={loading}
            id="email-register"
            name="email"
            placeholder={t('ej_email')}
            type="email"
          />
          {errors.correo_usuario && (
            <small className="formulario__mensaje-error">{errors.correo_usuario}</small>
          )}
        </div>

        <div className="formulario__campo">
          <label className="formulario__label" htmlFor="telefono-register">
            {t('telefono')}
          </label>
          <input
            autoComplete="tel"
            className={`formulario__input_login ${errors.telefono_usuario ? 'input--error' : ''}`}
            disabled={loading}
            id="telefono-register"
            name="telefono"
            placeholder={t('ej_telefono')}
            type="tel"
          />
          {errors.telefono_usuario && (
            <small className="formulario__mensaje-error">{errors.telefono_usuario}</small>
          )}
        </div>

        <div className="formulario__campo">
          <label className="formulario__label" htmlFor="password-register">
            {t('contrasena')}
          </label>
          <input
            autoComplete="new-password"
            className={`formulario__input_login ${errors.contraseña_usuario ? 'input--error' : ''}`}
            disabled={loading}
            id="password-register"
            name="password"
            placeholder={t('ej_contrasena')}
            type="password"
          />
          {errors.contraseña_usuario && (
            <small className="formulario__mensaje-error">{errors.contraseña_usuario}</small>
          )}
        </div>

        <div className="formulario__campo">
          <label className="formulario__label" htmlFor="confirmPassword-register">
            {t('confirmar_contrasena')}
          </label>
          <input
            autoComplete="new-password"
            className={`formulario__input_login ${errors.confirmPassword ? 'input--error' : ''}`}
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

        {globalError && <RegisterAlert type="error" message={globalError} />}

        {successMessage && <RegisterAlert type="success" message={successMessage} />}

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
