import React from 'react';
import PropTypes from 'prop-types';
import CampoSesion from './CampoSesion';
import AlertaSesion from './AlertaSesion';

/**
 * LoginForm - Formulario especializado para inicio de sesión.
 * BEM: .formulario-autenticacion
 */
const LoginForm = ({
  formData,
  handleLogin,
  handleInputChange,
  loading,
  errors,
  globalError,
  successMessage,
  t,
  onShowForgotPassword,
}) => {
  return (
    <form noValidate className="formulario-autenticacion" onSubmit={handleLogin}>
      <CampoSesion
        id="email-login"
        name="email"
        type="email"
        label={t('correo_electronico')}
        placeholder={t('login_placeholder_email')}
        disabled={loading}
        autoComplete="email"
        value={formData.email}
        onChange={handleInputChange}
        error={errors.correo_usuario}
      />

      <CampoSesion
        id="password-login"
        name="password"
        type="password"
        label={t('contrasena')}
        placeholder={t('login_placeholder_password')}
        disabled={loading}
        autoComplete="current-password"
        value={formData.password}
        onChange={handleInputChange}
        error={errors.contraseña_usuario}
      />

      <div className="autenticacion__acciones">
        {successMessage && (
          <AlertaSesion message={successMessage} type="success" id="global-success-login" />
        )}
        {globalError && <AlertaSesion message={globalError} type="error" id="global-error-login" />}

        <button
          className="boton-moderno boton-moderno--primario autenticacion__boton"
          disabled={loading}
          type="submit"
        >
          {loading ? t('login_iniciando') : t('iniciar_sesion')}
        </button>

        <button
          className="enlace-autenticacion"
          type="button"
          onClick={onShowForgotPassword}
          style={{ marginTop: '1rem' }}
        >
          {t('forgot_title')}
        </button>
      </div>
    </form>
  );
};

LoginForm.propTypes = {
  handleLogin: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  errors: PropTypes.object.isRequired,
  globalError: PropTypes.string,
  successMessage: PropTypes.string,
  t: PropTypes.func.isRequired,
  onShowForgotPassword: PropTypes.func.isRequired,
};

export default LoginForm;
