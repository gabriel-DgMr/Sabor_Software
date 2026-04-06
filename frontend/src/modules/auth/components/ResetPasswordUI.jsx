import React from 'react';
import PropTypes from 'prop-types';
import CampoSesion from './CampoSesion';
import '../styles/auth.css';

const ResetPasswordUI = ({ email, loading, errors, t, handleSubmit }) => {
  return (
    <div className="bloque-autenticacion">
      <h2 className="autenticacion__titulo">{t('reset_title')}</h2>
      <p className="autenticacion__subtitulo">{t('reset_subtitle', { email })}</p>

      <form noValidate className="formulario-autenticacion" onSubmit={handleSubmit}>
        <CampoSesion
          id="password-reset"
          name="password"
          type="password"
          label={t('reset_new_password')}
          placeholder={t('reset_placeholder_password')}
          disabled={loading}
          autoComplete="new-password"
          error={errors.password}
        />

        <CampoSesion
          id="confirm-password-reset"
          name="confirmPassword"
          type="password"
          label={t('reset_confirm_password')}
          placeholder={t('reset_placeholder_confirm')}
          disabled={loading}
          autoComplete="new-password"
          error={errors.confirmPassword}
        />

        <div className="autenticacion__acciones">
          <button
            className="boton-moderno boton-moderno--primario autenticacion__boton"
            disabled={loading}
            type="submit"
          >
            {loading ? t('reset_updating') : t('reset_update_password')}
          </button>
        </div>
      </form>
    </div>
  );
};

ResetPasswordUI.propTypes = {
  email: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  errors: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};

export default ResetPasswordUI;
