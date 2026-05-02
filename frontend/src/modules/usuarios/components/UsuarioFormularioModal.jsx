import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import '../styles/usuarios.css';

/**
 * UsuarioFormularioModal - Modal premium para creación y edición de usuarios.
 * Aplica BEM (.modal-usuario)
 */
const UsuarioFormularioModal = ({
  isOpen,
  onClose,
  onSave,
  usuario = null,
  roles = [],
  cargando = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    correo_usuario: '',
    telefono_usuario: '',
    contraseña_usuario: '',
    id_rol: '',
  });

  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre_usuario: usuario.nombre_usuario || '',
        correo_usuario: usuario.correo_usuario || '',
        telefono_usuario: usuario.telefono_usuario || '',
        contraseña_usuario: '', // No cargamos la contraseña por seguridad
        id_rol: usuario.id_rol || '',
      });
    } else {
      setFormData({
        nombre_usuario: '',
        correo_usuario: '',
        telefono_usuario: '',
        contraseña_usuario: '',
        id_rol: roles.find(r => r.nombre_rol === 'Cliente')?.id_rol || '',
      });
    }
    setErrores({});
  }, [usuario, isOpen, roles]);

  const validar = () => {
    const nuevosErrores = {};
    if (!formData.nombre_usuario)
      nuevosErrores.nombre_usuario = t('actualizar_perfil.nombre_obligatorio');
    if (!formData.correo_usuario)
      nuevosErrores.correo_usuario = t('actualizar_perfil.correo_obligatorio');
    if (!usuario && !formData.contraseña_usuario)
      nuevosErrores.contraseña_usuario = t('registro_contrasena_requerida');

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!validar()) return;
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-contenido modal-usuario" onClick={e => e.stopPropagation()}>
        <header className="modal-usuario__encabezado">
          <h2 className="modal-usuario__titulo">
            {usuario ? t('admin.usuarios.editar') : t('admin.usuarios.nuevo')}
          </h2>
          <button className="modal-usuario__cerrar" onClick={onClose}>
            &times;
          </button>
        </header>

        <form className="modal-usuario__formulario" onSubmit={handleSubmit}>
          <div className="modal-usuario__campo">
            <label className="modal-usuario__label">{t('admin.usuarios.formulario.nombre')}</label>
            <input
              type="text"
              name="nombre_usuario"
              className={`modal-usuario__input ${errores.nombre_usuario ? 'modal-usuario__input--error' : ''}`}
              value={formData.nombre_usuario}
              onChange={handleChange}
              placeholder={t('actualizar_perfil.placeholder_nombre')}
            />
            {errores.nombre_usuario && (
              <span className="modal-usuario__error">{errores.nombre_usuario}</span>
            )}
          </div>

          <div className="modal-usuario__campo">
            <label className="modal-usuario__label">{t('admin.usuarios.formulario.correo')}</label>
            <input
              type="email"
              name="correo_usuario"
              className={`modal-usuario__input ${errores.correo_usuario ? 'modal-usuario__input--error' : ''}`}
              value={formData.correo_usuario}
              onChange={handleChange}
              placeholder={t('actualizar_perfil.placeholder_correo')}
            />
            {errores.correo_usuario && (
              <span className="modal-usuario__error">{errores.correo_usuario}</span>
            )}
          </div>

          <div className="modal-usuario__campo">
            <label className="modal-usuario__label">
              {t('admin.usuarios.formulario.telefono')}
            </label>
            <input
              type="tel"
              name="telefono_usuario"
              className="modal-usuario__input"
              value={formData.telefono_usuario}
              onChange={handleChange}
              placeholder={t('actualizar_perfil.placeholder_telefono')}
            />
          </div>

          <div className="modal-usuario__campo">
            <label className="modal-usuario__label">
              {t('admin.usuarios.formulario.contrasena')}
            </label>
            <input
              type="password"
              name="contraseña_usuario"
              className={`modal-usuario__input ${errores.contraseña_usuario ? 'modal-usuario__input--error' : ''}`}
              value={formData.contraseña_usuario}
              onChange={handleChange}
              placeholder={
                usuario
                  ? t('admin.usuarios.formulario.contrasena_ayuda')
                  : t('registro_placeholder_password')
              }
            />
            {errores.contraseña_usuario && (
              <span className="modal-usuario__error">{errores.contraseña_usuario}</span>
            )}
          </div>

          <div className="modal-usuario__campo">
            <label className="modal-usuario__label">{t('admin.usuarios.formulario.rol')}</label>
            <select
              name="id_rol"
              className="modal-usuario__input"
              value={formData.id_rol}
              onChange={handleChange}
            >
              {roles.map(rol => (
                <option key={rol.id_rol} value={rol.id_rol}>
                  {rol.nombre_rol}
                </option>
              ))}
            </select>
          </div>

          <footer className="modal-usuario__acciones">
            <button
              type="button"
              className="boton boton--secundario"
              onClick={onClose}
              disabled={cargando}
            >
              {t('admin.usuarios.formulario.cancelar')}
            </button>
            <button type="submit" className="boton boton--primario" disabled={cargando}>
              {cargando
                ? t('actualizar_perfil.guardando')
                : usuario
                  ? t('admin.usuarios.formulario.guardar')
                  : t('admin.usuarios.formulario.crear')}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

UsuarioFormularioModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  usuario: PropTypes.object,
  roles: PropTypes.array,
  cargando: PropTypes.bool,
};

export default UsuarioFormularioModal;
