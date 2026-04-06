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
      </header>

      {mensaje && (
        <div className="notificacion notificacion--exito" id="mensaje-exito-actualizar">
          {mensaje}
        </div>
      )}

      {globalError && (
        <div className="notificacion notificacion--error" id="mensaje-error-actualizar">
          {globalError}
        </div>
      )}

      <div className="formulario-perfil__imagen-seccion">
        <div className="formulario-perfil__avatar-contenedor">
          {imagenPreview ? (
            <img alt="Avatar" className="formulario-perfil__avatar" src={imagenPreview} />
          ) : (
            <div className="formulario-perfil__avatar-vacio">👤</div>
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
            className="boton boton--secundario boton--pequeno"
            type="button"
            onClick={() => fileInputRef.current.click()}
          >
            {t('actualizar_perfil.cambiar_imagen')}
          </button>
          {imagenPreview && (
            <button
              className="boton boton--peligro boton--pequeno"
              type="button"
              onClick={removeImage}
            >
              {t('actualizar_perfil.eliminar_imagen')}
            </button>
          )}
        </div>
      </div>

      <div className="formulario-perfil__campos">
        <div className="formulario-perfil__campo">
          <label className="formulario-perfil__label">{t('actualizar_perfil.nombre')}:</label>
          <input
            className={`formulario-perfil__input ${errors.nombre ? 'formulario-perfil__input--error' : ''}`}
            type="text"
            value={nombre}
            onChange={e => handleInputChange('nombre', e.target.value)}
          />
          {errors.nombre && <span className="formulario-perfil__error">{errors.nombre}</span>}
        </div>

        <div className="formulario-perfil__campo">
          <label className="formulario-perfil__label">{t('actualizar_perfil.correo')}:</label>
          <input
            className={`formulario-perfil__input ${errors.correo ? 'formulario-perfil__input--error' : ''}`}
            type="email"
            value={correo}
            onChange={e => handleInputChange('correo', e.target.value)}
          />
          {errors.correo && <span className="formulario-perfil__error">{errors.correo}</span>}
        </div>

        <div className="formulario-perfil__campo">
          <label className="formulario-perfil__label">{t('actualizar_perfil.telefono')}:</label>
          <input
            className={`formulario-perfil__input ${errors.telefono ? 'formulario-perfil__input--error' : ''}`}
            type="tel"
            value={telefono}
            onChange={e => handleInputChange('telefono', e.target.value)}
          />
          {errors.telefono && <span className="formulario-perfil__error">{errors.telefono}</span>}
        </div>
      </div>

      <footer className="formulario-perfil__pie">
        <button className="boton boton--primario boton--ancho" disabled={cargando} type="submit">
          {cargando ? t('comun.cargando') : t('actualizar_perfil.boton_guardar')}
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
