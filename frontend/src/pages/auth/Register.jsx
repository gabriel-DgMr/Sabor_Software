import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import { useAuth } from '../../context/AuthContext.jsx';
import { ANIM_DURATION, VISIBLE_DURATION, animateElements } from '../../utils/animationUtils';
import { validarCaracteresEspeciales } from '../../utils/validaciones';


const Register = ({ onShowMessage, onRegisterSuccess }) => {
  const { registerUser, loading } = useAuth();
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    return () => setErrors({});
  }, []);

  const handleRegister = async e => {
    e.preventDefault();
    setErrors({});
    setGlobalError('');

    const form = e.target;
    const nombre_cliente = form.nombre.value.trim();
    const email_cliente = form.email.value.trim();
    const telefono_cliente = form.telefono.value.trim();
    const contraseña_cliente = form.password.value.trim();
    const confirmPassword = form.confirmPassword.value.trim();

    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    const newErrors = {};

  // Validación de caracteres especiales y espacios para todos los campos
  const errorNombre = validarCaracteresEspeciales(form.nombre.value, 'nombre'); 
    if (errorNombre) {
      newErrors.nombre = errorNombre;
    } else if (!nombre_cliente) {
      newErrors.nombre = 'El nombre es obligatorio.';
    } else if (nombre_cliente !== form.nombre.value) {
      newErrors.nombre = 'No se permiten espacios al inicio ni al final del nombre.';
    } else if (/\s{2,}/.test(form.nombre.value)) {
      newErrors.nombre = 'No se permiten espacios dobles o múltiples en el nombre.';
    }

    const errorEmail = validarCaracteresEspeciales(form.email.value, 'correo');
    if (errorEmail) {
      newErrors.email = errorEmail;
    } else if (!email_cliente) {
      newErrors.email = 'El correo es obligatorio.';
    } else if (email_cliente !== form.email.value) {
      newErrors.email = 'No se permiten espacios al inicio ni al final del correo.';
    } else if (/\s{2,}/.test(form.email.value)) {
      newErrors.email = 'No se permiten espacios dobles o múltiples en el correo.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_cliente)) {
      newErrors.email = 'El correo no es válido.';
    }

    const errorTelefono = validarCaracteresEspeciales(form.telefono.value, 'teléfono');
    if (errorTelefono) {
      newErrors.telefono = errorTelefono;
    } else if (!telefono_cliente) {
      newErrors.telefono = 'El teléfono es obligatorio.';
    } else if (telefono_cliente !== form.telefono.value) {
      newErrors.telefono = 'No se permiten espacios al inicio ni al final del teléfono.';
    } else if (/\s{2,}/.test(form.telefono.value)) {
      newErrors.telefono = 'No se permiten espacios dobles o múltiples en el teléfono.';
    } else if (!/^\d{10}$/.test(telefono_cliente)) {
      newErrors.telefono = 'El teléfono debe tener 10 dígitos.';
    }
    
    const errorPassword = validarCaracteresEspeciales(form.password.value, 'contraseña');
    if (errorPassword) {
      newErrors.password = errorPassword;
    } else if (!contraseña_cliente) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else if (contraseña_cliente !== form.password.value) {
      newErrors.password = 'No se permiten espacios al inicio ni al final de la contraseña.';
    } else if (/\s{2,}/.test(form.password.value)) {
      newErrors.password = 'No se permiten espacios dobles o múltiples en la contraseña.';
    } else if (!pwdRegex.test(contraseña_cliente)) {
      newErrors.password = 'Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo.';
    }

    const errorConfirmPassword = validarCaracteresEspeciales(form.confirmPassword.value, 'confirmación de contraseña');
    if (errorConfirmPassword) {
      newErrors.confirmPassword = errorConfirmPassword;
    } else if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña.';
    } else if (confirmPassword !== form.confirmPassword.value) {
      newErrors.confirmPassword = 'No se permiten espacios al inicio ni al final de la confirmación de contraseña.';
    } else if (/\s{2,}/.test(form.confirmPassword.value)) {
      newErrors.confirmPassword = 'No se permiten espacios dobles o múltiples en la confirmación de contraseña.';
    } else if (contraseña_cliente !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
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

    if (Object.keys(newErrors).length > 0) {
      manejarErroresDeCampo(newErrors);
      return;
    }

    const result = await registerUser({
      nombre_cliente,
      email_cliente,
      telefono_cliente,
      contraseña_cliente,
    });

    if (result && result.success) {
      onShowMessage('success', result.message || 'Registro exitoso. Ahora puedes iniciar sesión.');
      if (onRegisterSuccess) onRegisterSuccess();
      form.reset();
    } else {
      setGlobalError(result.message || 'Error en el registro.');
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
      <h2 className="modal__titulo">Crear Cuenta</h2>
      <form noValidate className="formulario" onSubmit={handleRegister}>
        <div className="formulario__campo">
          <label className="formulario__label" htmlFor="nombre-register">
            Nombre Completo*
          </label>
          <input
            autoComplete="name"
            className={`formulario__input ${errors.nombre ? 'input--error' : ''}`}
            disabled={loading}
            id="nombre-register"
            name="nombre"
            placeholder="Ej: Juan Carlos Perez"
            type="text"
          />
          {errors.nombre && <small className="formulario__mensaje-error">{errors.nombre}</small>}
        </div>

        <div className="formulario__campo">
          <label className="formulario__label" htmlFor="email-register">
            Correo Electrónico*
          </label>
          <input
            autoComplete="email"
            className={`formulario__input ${errors.email ? 'input--error' : ''}`}
            disabled={loading}
            id="email-register"
            name="email"
            placeholder="Ej: juan.perez@gmail.com"
            type="email"
          />
          {errors.email && <small className="formulario__mensaje-error">{errors.email}</small>}
        </div>

        <div className="formulario__campo">
          <label className="formulario__label" htmlFor="telefono-register">
            Teléfono*
          </label>
          <input
            autoComplete="tel"
            className={`formulario__input ${errors.telefono ? 'input--error' : ''}`}
            disabled={loading}
            id="telefono-register"
            name="telefono"
            placeholder="Ej: 5512345678"
            type="tel"
          />
          {errors.telefono && <small className="formulario__mensaje-error">{errors.telefono}</small>}
        </div>

        <div className="formulario__campo">
          <label className="formulario__label" htmlFor="password-register">
            Contraseña*
          </label>
          <input
            autoComplete="new-password"
            className={`formulario__input ${errors.password ? 'input--error' : ''}`}
            disabled={loading}
            id="password-register"
            name="password"
            placeholder="Ej: Contraseña123!"
            type="password"
          />
          {errors.password && <small className="formulario__mensaje-error">{errors.password}</small>}
        </div>

        <div className="formulario__campo">
          <label className="formulario__label" htmlFor="confirmPassword-register">
            Confirmar Contraseña*
          </label>
          <input
            autoComplete="new-password"
            className={`formulario__input ${errors.confirmPassword ? 'input--error' : ''}`}
            disabled={loading}
            id="confirmPassword-register"
            name="confirmPassword"
            placeholder="Ej: Contraseña123!"
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
            style={{ textAlign: 'center', marginBottom: '1rem' }}
          >
            {globalError}
          </div>
        )}

        <button className="formulario__boton-principal" disabled={loading} type="submit">
          {loading ? 'Registrando...' : 'Registrarse'}
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
