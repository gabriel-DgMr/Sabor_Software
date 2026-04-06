import React from 'react';
import PropTypes from 'prop-types';
import CampoSesion from './CampoSesion';
import '../styles/auth.css';

/**
 * ForgotPasswordUI - Vista para solicitar recuperación de contraseña.
 */
const ForgotPasswordUI = ({ errors, loading, handleSubmit, t }) => {
  return (
    <div className="bloque-autenticacion">
      <h2 className="tarjeta-autenticacion__titulo">{t('forgot_title')}</h2>

      <form noValidate className="formulario-autenticacion" onSubmit={handleSubmit}>
        <CampoSesion
          id="email-forgot"
          name="correo_usuario"
          type="email"
          label={t('correo_electronico')}
          placeholder={t('login_placeholder_email')}
          disabled={loading}
          autoComplete="email"
          error={errors.email}
        />

        <div className="acciones-autenticacion">
          <button className="boton boton--primario" disabled={loading} type="submit">
            {loading ? t('forgot_sending') : t('forgot_send_instructions')}
          </button>
        </div>
      </form>
    </div>
  );
};

ForgotPasswordUI.propTypes = {
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default ForgotPasswordUI;
