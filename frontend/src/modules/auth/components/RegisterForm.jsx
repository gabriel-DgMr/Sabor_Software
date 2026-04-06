import React from 'react';
import PropTypes from 'prop-types';
import CampoSesion from './CampoSesion';
import AlertaSesion from './AlertaSesion';

/**
 * RegisterForm - Formulario especializado para registro de nuevos usuarios.
 * BEM: .formulario-autenticacion
 */
const RegisterForm = ({
  formData,
  handleRegister,
  handleInputChange,
  loading,
  errors,
  globalError,
  successMessage,
  t,
}) => {
  return (
    <form noValidate className="formulario-autenticacion" onSubmit={handleRegister}>
      <CampoSesion
        id="nombre-register"
        name="nombre"
        label={t('nombre_completo')}
        placeholder={t('registro_placeholder_nombre')}
        disabled={loading}
        autoComplete="name"
        value={formData.nombre}
        onChange={handleInputChange}
        error={errors.nombre_usuario}
      />

      <CampoSesion
        id="email-register"
        name="email"
        type="email"
        label={t('correo_electronico')}
        placeholder={t('registro_placeholder_email')}
        disabled={loading}
        autoComplete="email"
        value={formData.email}
        onChange={handleInputChange}
        error={errors.correo_usuario}
      />

      <CampoSesion
        id="telefono-register"
        name="telefono"
        type="tel"
        label={t('telefono')}
        placeholder={t('registro_placeholder_telefono')}
        disabled={loading}
        autoComplete="tel"
        value={formData.telefono}
        onChange={handleInputChange}
        error={errors.telefono_usuario}
      />

      <CampoSesion
        id="password-register"
        name="password"
        type="password"
        label={t('contrasena')}
        placeholder={t('registro_placeholder_password')}
        disabled={loading}
        autoComplete="new-password"
        value={formData.password}
        onChange={handleInputChange}
        error={errors.contraseña_usuario}
      />

      <CampoSesion
        id="confirm-password-register"
        name="confirmPassword"
        type="password"
        label={t('confirmar_contrasena')}
        placeholder={t('registro_placeholder_confirm_password')}
        disabled={loading}
        autoComplete="new-password"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        error={errors.confirmPassword}
      />

      <div className="autenticacion__acciones">
        {successMessage && (
          <AlertaSesion message={successMessage} type="success" id="global-success-register" />
        )}
        {globalError && (
          <AlertaSesion message={globalError} type="error" id="global-error-register" />
        )}

        <button
          className="boton-moderno boton-moderno--primario autenticacion__boton"
          disabled={loading}
          type="submit"
        >
          {loading ? t('registrando') : t('registrate')}
        </button>
      </div>
    </form>
  );
};

RegisterForm.propTypes = {
  handleRegister: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  errors: PropTypes.object.isRequired,
  globalError: PropTypes.string,
  successMessage: PropTypes.string,
  t: PropTypes.func.isRequired,
};

export default RegisterForm;
