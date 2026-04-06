import React from 'react';
import PropTypes from 'prop-types';

/**
 * UsuarioItem - Representación individual de un usuario en la lista de gestión.
 * Aplica BEM (.tarjeta-usuario)
 */
const UsuarioItem = ({
  usuario,
  user,
  usuarioEditando,
  nuevoRol,
  setNuevoRol,
  roles,
  iniciarEdicionRol,
  cancelarEdicion,
  confirmarCambioRol,
  confirmarDesactivacion,
  obtenerEtiquetaRol,
  obtenerColorRol,
}) => {
  const esPropioUsuario = usuario.id_usuario === user?.id_usuario;

  return (
    <div className="usuarios-lista__item">
      <article className="tarjeta-usuario">
        <header className="tarjeta-usuario__encabezado">
          <div className="tarjeta-usuario__titulos">
            <h3 className="tarjeta-usuario__nombre">{usuario.nombre_usuario}</h3>
            {usuarioEditando !== usuario.id_usuario && (
              <span
                className="tarjeta-usuario__rol"
                style={{ backgroundColor: obtenerColorRol(usuario.nombre_rol), color: 'white' }}
              >
                {obtenerEtiquetaRol(usuario.nombre_rol)}
              </span>
            )}
          </div>

          {usuarioEditando !== usuario.id_usuario && (
            <button
              className="boton-icono"
              onClick={() => iniciarEdicionRol(usuario)}
              title="Editar rol"
            >
              ✏️
            </button>
          )}
        </header>

        <div className="tarjeta-usuario__cuerpo">
          <p className="tarjeta-usuario__dato">📧 {usuario.correo_usuario}</p>
          <p className="tarjeta-usuario__dato">📞 {usuario.telefono_usuario || 'Sin teléfono'}</p>
          <p className="tarjeta-usuario__dato tarjeta-usuario__dato--secundario">
            📅 Registro: {new Date(usuario.fecha_registro).toLocaleDateString()}
          </p>
        </div>

        {usuarioEditando === usuario.id_usuario && (
          <div className="tarjeta-usuario__editor-rol">
            <select
              className="usuarios-busqueda__input"
              value={nuevoRol}
              onChange={e => setNuevoRol(e.target.value)}
            >
              {roles.map(rol => (
                <option key={rol.id_rol} value={rol.id_rol}>
                  {rol.nombre_rol}
                </option>
              ))}
            </select>
            <div className="tarjeta-usuario__botones-confirmar">
              <button
                className="boton boton--primario boton--pequeno"
                onClick={() => confirmarCambioRol(usuario)}
              >
                Guardar
              </button>
              <button className="boton boton--secundario boton--pequeno" onClick={cancelarEdicion}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        <footer className="tarjeta-usuario__acciones">
          <button
            className="boton boton--peligro boton--pequeno"
            disabled={esPropioUsuario}
            onClick={() => confirmarDesactivacion(usuario)}
            title={esPropioUsuario ? 'No puedes desactivar tu propia cuenta' : 'Desactivar usuario'}
          >
            Desactivar Cuenta
          </button>
        </footer>
      </article>
    </div>
  );
};

UsuarioItem.propTypes = {
  usuario: PropTypes.object.isRequired,
  user: PropTypes.object,
  usuarioEditando: PropTypes.number,
  nuevoRol: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setNuevoRol: PropTypes.func.isRequired,
  roles: PropTypes.array.isRequired,
  iniciarEdicionRol: PropTypes.func.isRequired,
  cancelarEdicion: PropTypes.func.isRequired,
  confirmarCambioRol: PropTypes.func.isRequired,
  confirmarDesactivacion: PropTypes.func.isRequired,
  obtenerEtiquetaRol: PropTypes.func.isRequired,
  obtenerColorRol: PropTypes.func.isRequired,
};

export default UsuarioItem;
