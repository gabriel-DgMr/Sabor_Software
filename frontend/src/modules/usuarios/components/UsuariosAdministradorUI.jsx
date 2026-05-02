import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import MenuLateral from '../../dashboard/components/MenuLateralAdministrador';
import UsuarioItem from './UsuarioItem';
import UsuarioFiltros from './UsuarioFiltros';
import UsuarioModalConfirmacion from './UsuarioModalConfirmacion';
import UsuarioFormularioModal from './UsuarioFormularioModal';
import '../styles/usuarios.css';

/**
 * UsuariosAdministradorUI - Vista de gestión de usuarios para el administrador.
 * Aplica BEM (.tablero, .gestion-usuarios)
 */
const UsuariosAdministradorUI = ({
  user,
  isAuthenticated,
  authLoading,
  usuarios,
  roles,
  cargando,
  usuarioEditando,
  nuevoRol,
  setNuevoRol,
  filtro,
  setFiltro,
  busqueda,
  setBusqueda,
  confirmacion,
  setConfirmacion,
  usuariosFiltrados,
  iniciarEdicionRol,
  cancelarEdicion,
  confirmarCambioRol,
  ejecutarCambioRol,
  confirmarDesactivacion,
  ejecutarDesactivacion,
  esCliente,
  esEmpleado,
  esAdministrador,
  obtenerEtiquetaRol,
  modalAbierto,
  usuarioParaEditar,
  abrirModalCreacion,
  abrirModalEdicion,
  cerrarModal,
  guardarUsuario,
}) => {
  const { t } = useTranslation();

  const obtenerColorRol = nombreRol => {
    if (esAdministrador(nombreRol)) return '#dc2626'; // Rojo
    if (esEmpleado(nombreRol)) return '#2563eb'; // Azul
    return '#16a34a'; // Verde
  };

  const conteoRoles = {
    todos: usuarios.length,
    clientes: usuarios.filter(u => esCliente(u.nombre_rol)).length,
    empleados: usuarios.filter(u => esEmpleado(u.nombre_rol)).length,
    administradores: usuarios.filter(u => esAdministrador(u.nombre_rol)).length,
  };

  if (authLoading || cargando) {
    return (
      <div className="tablero">
        <MenuLateral />
        <main className="tablero__principal">
          <div className="cargando">
            <div className="spinner"></div>
            <p>{t('admin.usuarios.cargando')}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.nombre_rol !== 'Administrador') {
    return (
      <div className="tablero">
        <MenuLateral />
        <main className="tablero__principal">
          <div className="notificacion notificacion--error">{t('admin.usuarios.sin_permiso')}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="tablero">
      <MenuLateral />
      <main className="tablero__principal">
        <header className="encabezado-tablero">
          <div className="encabezado-tablero__titulos">
            <h1 className="encabezado-tablero__titulo">{t('admin.usuarios.titulo')}</h1>
          </div>
          <button className="boton boton--primario" onClick={abrirModalCreacion}>
            + {t('admin.usuarios.nuevo')}
          </button>
        </header>

        <div className="gestion-usuarios">
          <UsuarioFiltros
            busqueda={busqueda}
            conteoRoles={conteoRoles}
            filtro={filtro}
            setBusqueda={setBusqueda}
            setFiltro={setFiltro}
          />

          <div className="usuarios-lista">
            {usuariosFiltrados.length === 0 ? (
              <div className="estado-vacio">
                <p>{t('admin.usuarios.no_encontrados')}</p>
              </div>
            ) : (
              usuariosFiltrados.map(usuario => (
                <UsuarioItem
                  key={usuario.id_usuario}
                  cancelarEdicion={cancelarEdicion}
                  confirmarCambioRol={confirmarCambioRol}
                  confirmarDesactivacion={confirmarDesactivacion}
                  iniciarEdicionRol={iniciarEdicionRol}
                  nuevoRol={nuevoRol}
                  obtenerColorRol={obtenerColorRol}
                  obtenerEtiquetaRol={obtenerEtiquetaRol}
                  roles={roles}
                  setNuevoRol={setNuevoRol}
                  user={user}
                  usuario={usuario}
                  usuarioEditando={usuarioEditando}
                />
              ))
            )}
          </div>
        </div>

        <UsuarioModalConfirmacion
          confirmacion={confirmacion}
          onCerrar={() => setConfirmacion(null)}
          onConfirmar={
            confirmacion?.tipo === 'cambioRol' ? ejecutarCambioRol : ejecutarDesactivacion
          }
        />

        <UsuarioFormularioModal
          isOpen={modalAbierto}
          onClose={cerrarModal}
          onSave={guardarUsuario}
          usuario={usuarioParaEditar}
          roles={roles}
          cargando={cargando}
        />
      </main>
    </div>
  );
};

UsuariosAdministradorUI.propTypes = {
  user: PropTypes.object,
  isAuthenticated: PropTypes.bool.isRequired,
  authLoading: PropTypes.bool.isRequired,
  usuarios: PropTypes.array.isRequired,
  roles: PropTypes.array.isRequired,
  cargando: PropTypes.bool.isRequired,
  usuarioEditando: PropTypes.number,
  nuevoRol: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setNuevoRol: PropTypes.func.isRequired,
  filtro: PropTypes.string.isRequired,
  setFiltro: PropTypes.func.isRequired,
  busqueda: PropTypes.string.isRequired,
  setBusqueda: PropTypes.func.isRequired,
  confirmacion: PropTypes.object,
  setConfirmacion: PropTypes.func.isRequired,
  usuariosFiltrados: PropTypes.array.isRequired,
  iniciarEdicionRol: PropTypes.func.isRequired,
  cancelarEdicion: PropTypes.func.isRequired,
  confirmarCambioRol: PropTypes.func.isRequired,
  ejecutarCambioRol: PropTypes.func.isRequired,
  confirmarDesactivacion: PropTypes.func.isRequired,
  ejecutarDesactivacion: PropTypes.func.isRequired,
  esCliente: PropTypes.func.isRequired,
  esEmpleado: PropTypes.func.isRequired,
  esAdministrador: PropTypes.func.isRequired,
  obtenerEtiquetaRol: PropTypes.func.isRequired,
};

export default UsuariosAdministradorUI;
