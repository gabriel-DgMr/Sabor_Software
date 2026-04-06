import React from 'react';
import PropTypes from 'prop-types';
import AlertaSesion from './AlertaSesion';
import '../styles/auth.css';

/**
 * AuthLayout - Provee el cascarón visual premium para la autenticación.
 * BEM: .autenticacion, .autenticacion__contenedor
 */
const AuthLayout = ({
  isOpen,
  onClose,
  view,
  setView,
  globalMessage,
  t,
  isPage = false,
  children,
}) => {
  if (!isPage && !isOpen) return null;

  return (
    <div
      className={`autenticacion ${isPage ? 'autenticacion--pagina' : ''}`}
      onClick={!isPage ? onClose : undefined}
    >
      <div className="autenticacion__contenedor" onClick={e => e.stopPropagation()}>
        {!isPage && (
          <button aria-label="Cerrar" className="autenticacion__cerrar" onClick={onClose}>
            &times;
          </button>
        )}

        <div className="autenticacion__visual">
          <div className="autenticacion__visual-overlay">
            <h2 className="autenticacion__visual-texto">{t('experiencia_gastronomica_unica')}</h2>
            <p className="autenticacion__subtitulo" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {t('sabor_descripcion_corta')}
            </p>
          </div>
        </div>

        <div className="autenticacion__formulario-seccion">
          <div className="autenticacion__header">
            <h2 className="autenticacion__titulo">
              {view === 'login' && t('iniciar_sesion')}
              {view === 'register' && t('crear_cuenta')}
              {view === 'verify-email' && t('verificar_email')}
              {view === 'forgot-password' && t('forgot_title')}
            </h2>
            <p className="autenticacion__subtitulo">
              {view === 'login' && t('login_subtitulo')}
              {view === 'register' && t('register_subtitulo')}
            </p>
          </div>

          {children}

          {globalMessage.text && (
            <AlertaSesion
              message={globalMessage.text}
              type={globalMessage.type === 'success' ? 'success' : 'error'}
            />
          )}

          <div
            className="conmutador-autenticacion"
            style={{ borderTop: 'none', marginTop: '2rem' }}
          >
            {view === 'login' && (
              <p>
                {t('no_tienes_cuenta')}{' '}
                <button className="enlace-autenticacion" onClick={() => setView('register')}>
                  {t('registrate')}
                </button>
              </p>
            )}
            {view === 'register' && (
              <p>
                {t('ya_tienes_cuenta')}{' '}
                <button className="enlace-autenticacion" onClick={() => setView('login')}>
                  {t('iniciar_sesion')}
                </button>
              </p>
            )}
            {view === 'forgot-password' && (
              <p>
                {t('forgot_remembered')}{' '}
                <button className="enlace-autenticacion" onClick={() => setView('login')}>
                  {t('volver_al_login')}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

AuthLayout.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  view: PropTypes.string.isRequired,
  setView: PropTypes.func.isRequired,
  globalMessage: PropTypes.shape({
    type: PropTypes.string,
    text: PropTypes.string,
  }).isRequired,
  t: PropTypes.func.isRequired,
  isPage: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export default AuthLayout;
