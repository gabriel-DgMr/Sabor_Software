import React from 'react';
import PropTypes from 'prop-types';

/**
 * ActualizarPerfilForm - Formulario especializado para que el usuario actualice su información personal.
 * Aplica BEM (.formulario-perfil)
 */
const ActualizarPerfilForm = ({
  nombre,
  setNombre,
  correo,
  setCorreo,
  telefono,
  setTelefono,
  imagenPreview,
  mensaje,
  errors,
  globalError,
  cargando,
  fileInputRef,
  handleImageChange,
  removeImage,
  handleSubmit,
  t,
}) => {
  return (
    <form className="formulario-perfil" onSubmit={handleSubmit}>
      <header className="formulario-perfil__encabezado">
        <h2 className="formulario-perfil__titulo">{t('actualizar_perfil.titulo')}</h2>
        <p className="formulario-perfil__subtitulo">{t('actualizar_perfil.subtitulo')}</p>
      </header>

      {(mensaje || globalError) && (
        <div className="formulario-perfil__notificaciones">
          {mensaje && (
            <div className="notificacion notificacion--exito" id="mensaje-exito-actualizar">
              <i className="fas fa-check-circle"></i> {mensaje}
            </div>
          )}

          {globalError && (
            <div className="notificacion notificacion--error" id="mensaje-error-actualizar">
              <i className="fas fa-exclamation-circle"></i> {globalError}
            </div>
          )}
        </div>
      )}

      <div className="formulario-perfil__imagen-seccion">
        <div className="formulario-perfil__avatar-contenedor">
          {imagenPreview ? (
            <img alt="Avatar" className="formulario-perfil__avatar" src={imagenPreview} />
          ) : (
            <div className="formulario-perfil__avatar-vacio">
              <i className="fas fa-user-circle"></i>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          accept="image/*"
          className="oculto"
          type="file"
          onChange={handleImageChange}
        />

        <div className="formulario-perfil__imagen-botones">
          <button
            className="boton-moderno boton-moderno--secundario"
            type="button"
            onClick={() => fileInputRef.current.click()}
          >
            <i className="fas fa-camera"></i> {t('actualizar_perfil.cambiar_foto')}
          </button>
          {imagenPreview && (
            <button
              className="boton-moderno boton-moderno--peligro"
              style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}
              type="button"
              onClick={removeImage}
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          )}
        </div>
      </div>

      <div className="formulario-perfil__campos">
        <div className="formulario-perfil__campo">
          <label className="formulario-perfil__label">{t('actualizar_perfil.nombre')}</label>
          <input
            className={`formulario-perfil__input ${errors.nombre ? 'formulario-perfil__input--error' : ''}`}
            placeholder={t('actualizar_perfil.placeholder_nombre')}
            type="text"
            value={nombre}
            onChange={e => handleInputChange('nombre', e.target.value)}
          />
          {errors.nombre && <span className="formulario-perfil__error">{errors.nombre}</span>}
        </div>

        <div className="formulario-perfil__campo">
          <label className="formulario-perfil__label">{t('actualizar_perfil.correo')}</label>
          <input
            className={`formulario-perfil__input ${errors.correo ? 'formulario-perfil__input--error' : ''}`}
            placeholder={t('actualizar_perfil.placeholder_correo')}
            type="email"
            value={correo}
            onChange={e => handleInputChange('correo', e.target.value)}
          />
          {errors.correo && <span className="formulario-perfil__error">{errors.correo}</span>}
        </div>

        <div className="formulario-perfil__campo">
          <label className="formulario-perfil__label">{t('actualizar_perfil.telefono')}</label>
          <input
            className={`formulario-perfil__input ${errors.telefono ? 'formulario-perfil__input--error' : ''}`}
            placeholder={t('actualizar_perfil.placeholder_telefono')}
            type="tel"
            value={telefono}
            onChange={e => handleInputChange('telefono', e.target.value)}
          />
          {errors.telefono && <span className="formulario-perfil__error">{errors.telefono}</span>}
        </div>
      </div>

      <footer className="formulario-perfil__pie">
        <button
          className="boton-moderno boton-moderno--primario"
          style={{ width: '100%' }}
          disabled={cargando}
          type="submit"
        >
          {cargando ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> {t('cargando')}
            </>
          ) : (
            <>
              <i className="fas fa-save"></i> {t('actualizar_perfil.guardar')}
            </>
          )}
        </button>
      </footer>
    </form>
  );
};

ActualizarPerfilForm.propTypes = {
  nombre: PropTypes.string.isRequired,
  setNombre: PropTypes.func.isRequired,
  correo: PropTypes.string.isRequired,
  setCorreo: PropTypes.func.isRequired,
  telefono: PropTypes.string.isRequired,
  setTelefono: PropTypes.func.isRequired,
  imagenPreview: PropTypes.string,
  mensaje: PropTypes.string,
  errors: PropTypes.object,
  globalError: PropTypes.string,
  cargando: PropTypes.bool.isRequired,
  fileInputRef: PropTypes.object.isRequired,
  handleImageChange: PropTypes.func.isRequired,
  removeImage: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default ActualizarPerfilForm;
