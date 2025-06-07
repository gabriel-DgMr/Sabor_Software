import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import { useAuth } from '../../context/AuthContext.jsx';
import { ANIM_DURATION, VISIBLE_DURATION, animateElements } from '../../utils/animationUtils';

const Register = ({ onShowMessage, onRegisterSuccess }) => {
  const { registerUser, loading } = useAuth();
  const [errors, setErrors] = useState({});

  useEffect(() => {
    return () => setErrors({});
  }, []);

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

  const handleRegister = async e => {
    e.preventDefault();
    setErrors({});

    const form = e.target;
    const nombre_cliente = form.nombre.value.trim();
    const email_cliente = form.email.value.trim();
    const telefono_cliente = form.telefono.value.trim();
    const contraseña_cliente = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    const newErrors = {};
    if (!nombre_cliente) newErrors.nombre = 'El nombre es obligatorio.';
    if (!email_cliente) {
      newErrors.email = 'El correo es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_cliente)) {
      newErrors.email = 'El correo no es válido.';
    }
    if (!telefono_cliente) {
      newErrors.telefono = 'El teléfono es obligatorio.';
    } else if (!/^\d{10}$/.test(telefono_cliente)) {
      newErrors.telefono = 'El teléfono debe tener 10 dígitos.';
    }
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!contraseña_cliente) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else if (!pwdRegex.test(contraseña_cliente)) {
      newErrors.password = 'Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo.';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña.';
    } else if (contraseña_cliente !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

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
      onShowMessage('error', result.message || 'Error en el registro.');
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
            placeholder="Tu Nombre Completo"
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
            placeholder="Tu Correo Electrónico"
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
            placeholder="Tu Número de Teléfono (10 dígitos)"
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
            placeholder="Crea una Contraseña Segura"
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
            placeholder="Confirma tu Contraseña"
            type="password"
          />
          {errors.confirmPassword && (
            <small className="formulario__mensaje-error">{errors.confirmPassword}</small>
          )}
        </div>

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
