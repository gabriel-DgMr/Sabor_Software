import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MenuLateral from '../components/MenuLateralAdministrador';
import { usuarioService } from '../services/usuarioService';
import '../styles/empleados.css';

const UsuariosAdministrador = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [nuevoRol, setNuevoRol] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [confirmacion, setConfirmacion] = useState(null);

  const normalizarRol = rol => rol?.toLowerCase().trim() || 'cliente';
  const esAdministrador = rol => normalizarRol(rol) === 'administrador';
  const esEmpleado = rol => normalizarRol(rol) === 'empleado';
  const esCliente = rol => !esAdministrador(rol) && !esEmpleado(rol);
  const obtenerEtiquetaRol = nombreRol => {
    if (esAdministrador(nombreRol)) return 'Administrador';
    if (esEmpleado(nombreRol)) return 'Empleado';
    return 'Cliente';
  };

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      if (!isAuthenticated || authLoading) {
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError(null);

        // Cargar usuarios y roles en paralelo
        const [usuariosData, rolesData] = await Promise.all([
          usuarioService.obtenerTodosLosUsuarios(),
          usuarioService.obtenerRoles().catch(() => [
            { id_rol: 1, nombre_rol: 'Cliente' },
            { id_rol: 2, nombre_rol: 'Empleado' },
            { id_rol: 3, nombre_rol: 'Administrador' },
          ]),
        ]);

        setUsuarios(usuariosData);
        const rolesNormalizados = (rolesData || []).map(rol => ({
          ...rol,
          nombre_rol: obtenerEtiquetaRol(rol.nombre_rol),
        }));
        setRoles(rolesNormalizados);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Por favor, intenta de nuevo.');
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [isAuthenticated, authLoading]);

  const normalizarRol = rol => rol?.toLowerCase().trim() || 'cliente';
  const esAdministrador = rol => normalizarRol(rol) === 'administrador';
  const esEmpleado = rol => normalizarRol(rol) === 'empleado';
  const esCliente = rol => !esAdministrador(rol) && !esEmpleado(rol);

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(usuario => {
    const coincideBusqueda =
      usuario.nombre_usuario?.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.correo_usuario?.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.telefono_usuario?.includes(busqueda);

    if (filtro === 'todos') return coincideBusqueda;
    if (filtro === 'clientes') return coincideBusqueda && esCliente(usuario.nombre_rol);
    if (filtro === 'empleados') return coincideBusqueda && esEmpleado(usuario.nombre_rol);
    if (filtro === 'administradores')
      return coincideBusqueda && esAdministrador(usuario.nombre_rol);

    return coincideBusqueda;
  });

  // Iniciar edición de rol
  const iniciarEdicionRol = usuario => {
    setUsuarioEditando(usuario.id_usuario);
    const rolCorrespondiente = roles.find(
      r => r.nombre_rol === obtenerEtiquetaRol(usuario.nombre_rol)
    );
    setNuevoRol(
      rolCorrespondiente?.id_rol || roles.find(r => r.nombre_rol === 'Cliente')?.id_rol || ''
    );
  };

  // Cancelar edición
  const cancelarEdicion = () => {
    setUsuarioEditando(null);
    setNuevoRol('');
  };

  // Confirmar cambio de rol
  const confirmarCambioRol = usuario => {
    const rolSeleccionado = roles.find(r => r.id_rol === parseInt(nuevoRol));
    setConfirmacion({
      tipo: 'cambioRol',
      usuario,
      nuevoRol: rolSeleccionado,
      mensaje: `¿Estás seguro de cambiar el rol de ${usuario.nombre_usuario} a ${rolSeleccionado?.nombre_rol}?`,
    });
  };

  // Ejecutar cambio de rol
  const ejecutarCambioRol = async () => {
    try {
      setCargando(true);
      await usuarioService.actualizarRolUsuario(
        confirmacion.usuario.id_usuario,
        parseInt(nuevoRol)
      );

      // Actualizar la lista local
      setUsuarios(prev =>
        prev.map(u =>
          u.id_usuario === confirmacion.usuario.id_usuario
            ? { ...u, id_rol: parseInt(nuevoRol), nombre_rol: confirmacion.nuevoRol.nombre_rol }
            : u
        )
      );

      setUsuarioEditando(null);
      setNuevoRol('');
      setConfirmacion(null);

      // Mostrar mensaje de éxito
      setError(null);
      setTimeout(() => {
        setError(`Rol de ${confirmacion.usuario.nombre_usuario} actualizado exitosamente`);
        setTimeout(() => setError(null), 3000);
      }, 100);
    } catch (err) {
      console.error('Error al actualizar rol:', err);
      setError(err.message || 'Error al actualizar el rol del usuario');
    } finally {
      setCargando(false);
    }
  };

  // Confirmar desactivación de usuario
  const confirmarDesactivacion = usuario => {
    if (usuario.id_usuario === user?.id_usuario) {
      setError('No puedes desactivar tu propia cuenta');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setConfirmacion({
      tipo: 'desactivacion',
      usuario,
      mensaje: `¿Estás seguro de desactivar la cuenta de ${usuario.nombre_usuario}? Esta acción no se puede deshacer.`,
    });
  };

  // Ejecutar desactivación
  const ejecutarDesactivacion = async () => {
    try {
      setCargando(true);
      await usuarioService.desactivarUsuario(confirmacion.usuario.id_usuario);

      // Remover usuario de la lista
      setUsuarios(prev => prev.filter(u => u.id_usuario !== confirmacion.usuario.id_usuario));

      setConfirmacion(null);

      // Mostrar mensaje de éxito
      setError(null);
      setTimeout(() => {
        setError(`Usuario ${confirmacion.usuario.nombre_usuario} desactivado exitosamente`);
        setTimeout(() => setError(null), 3000);
      }, 100);
    } catch (err) {
      console.error('Error al desactivar usuario:', err);
      setError(err.message || 'Error al desactivar el usuario');
    } finally {
      setCargando(false);
    }
  };

  // Obtener color del rol
  const obtenerColorRol = nombreRol => {
    if (esAdministrador(nombreRol)) return '#dc2626';
    if (esEmpleado(nombreRol)) return '#2563eb';
    return '#16a34a';
  };

  const obtenerEtiquetaRol = nombreRol => {
    if (esAdministrador(nombreRol)) return 'Administrador';
    if (esEmpleado(nombreRol)) return 'Empleado';
    return 'Cliente';
  };

  // Renderizar estado de carga
  if (authLoading || cargando) {
    return (
      <div className="layout">
        <MenuLateral />
        <div className="contenido-principal">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando usuarios...</p>
          </div>
        </div>
      </div>
    );
  }

  // Verificar autenticación y permisos
  if (!isAuthenticated || !user || user.nombre_rol !== 'Administrador') {
    return (
      <div className="layout">
        <MenuLateral />
        <div className="contenido-principal">
          <div className="error-container">
            <p>No tienes permisos para acceder a esta sección</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      <MenuLateral />
      <div className="contenido-principal">
        <h1 className="titulos__empleados">Gestión de Usuarios</h1>

        {/* Mensaje de error/éxito */}
        {error && (
          <div
            className={`usuarios__mensaje ${error.includes('exitosamente') ? 'usuarios__mensaje--exito' : 'usuarios__mensaje--error'}`}
          >
            {error}
          </div>
        )}

        {/* Controles y filtros */}
        <div className="usuarios__controles">
          <div className="usuarios__filtros">
            <button
              className={`usuarios__filtro ${filtro === 'todos' ? 'usuarios__filtro--activo' : ''}`}
              onClick={() => setFiltro('todos')}
            >
              Todos ({usuarios.length})
            </button>
            <button
              className={`usuarios__filtro ${filtro === 'clientes' ? 'usuarios__filtro--activo' : ''}`}
              onClick={() => setFiltro('clientes')}
            >
              Clientes ({usuarios.filter(u => esCliente(u.nombre_rol)).length})
            </button>
            <button
              className={`usuarios__filtro ${filtro === 'empleados' ? 'usuarios__filtro--activo' : ''}`}
              onClick={() => setFiltro('empleados')}
            >
              Empleados ({usuarios.filter(u => esEmpleado(u.nombre_rol)).length})
            </button>
            <button
              className={`usuarios__filtro ${filtro === 'administradores' ? 'usuarios__filtro--activo' : ''}`}
              onClick={() => setFiltro('administradores')}
            >
              Administradores ({usuarios.filter(u => esAdministrador(u.nombre_rol)).length})
            </button>
          </div>

          <div className="usuarios__busqueda">
            <input
              type="text"
              placeholder="Buscar por nombre, correo o teléfono..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="usuarios__input-busqueda"
            />
          </div>
        </div>

        {/* Lista de usuarios */}
        <div className="usuarios__lista">
          {usuariosFiltrados.length === 0 ? (
            <div className="usuarios__vacio">
              <p>No se encontraron usuarios que coincidan con los filtros aplicados</p>
            </div>
          ) : (
            usuariosFiltrados.map(usuario => (
              <div key={usuario.id_usuario} className="usuario">
                <div className="usuario__contenido">
                  <div className="usuario__info-principal">
                    <h3 className="usuario__nombre">{usuario.nombre_usuario}</h3>
                    <p className="usuario__correo">{usuario.correo_usuario}</p>
                    <p className="usuario__telefono">{usuario.telefono_usuario}</p>
                  </div>

                  <div className="usuario__info-adicional">
                    <p className="usuario__fecha">
                      Registrado: {new Date(usuario.fecha_registro).toLocaleDateString('es-ES')}
                    </p>
                    {usuario.fecha_modificacion && (
                      <p className="usuario__fecha">
                        Modificado:{' '}
                        {new Date(usuario.fecha_modificacion).toLocaleDateString('es-ES')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="usuario__acciones">
                  <div className="usuario__rol-container">
                    {usuarioEditando === usuario.id_usuario ? (
                      <div className="usuario__rol-editor">
                        <select
                          value={nuevoRol}
                          onChange={e => setNuevoRol(e.target.value)}
                          className="usuario__select-rol"
                        >
                          {roles.map(rol => (
                            <option key={rol.id_rol} value={rol.id_rol}>
                              {rol.nombre_rol}
                            </option>
                          ))}
                        </select>
                        <div className="usuario__botones-rol">
                          <button
                            onClick={() => confirmarCambioRol(usuario)}
                            className="usuario__boton usuario__boton--guardar"
                            disabled={nuevoRol === usuario.id_rol}
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelarEdicion}
                            className="usuario__boton usuario__boton--cancelar"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="usuario__rol-display">
                        <span
                          className="usuario__rol"
                          style={{
                            backgroundColor: obtenerColorRol(usuario.nombre_rol),
                            color: 'white',
                          }}
                        >
                          {obtenerEtiquetaRol(usuario.nombre_rol)}
                        </span>
                        <button
                          onClick={() => iniciarEdicionRol(usuario)}
                          className="usuario__boton usuario__boton--editar-rol"
                          title="Cambiar rol"
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="usuario__acciones-principales">
                    <button
                      onClick={() => confirmarDesactivacion(usuario)}
                      className="usuario__boton usuario__boton--desactivar"
                      disabled={usuario.id_usuario === user?.id_usuario}
                      title={
                        usuario.id_usuario === user?.id_usuario
                          ? 'No puedes desactivar tu propia cuenta'
                          : 'Desactivar usuario'
                      }
                    >
                      Desactivar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal de confirmación */}
        {confirmacion && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal__header">
                <h3>Confirmar acción</h3>
              </div>
              <div className="modal__body">
                <p>{confirmacion.mensaje}</p>
              </div>
              <div className="modal__footer">
                <button
                  onClick={() => setConfirmacion(null)}
                  className="modal__boton modal__boton--cancelar"
                >
                  Cancelar
                </button>
                <button
                  onClick={
                    confirmacion.tipo === 'cambioRol' ? ejecutarCambioRol : ejecutarDesactivacion
                  }
                  className={`modal__boton ${confirmacion.tipo === 'desactivacion' ? 'modal__boton--peligro' : 'modal__boton--confirmar'}`}
                >
                  {confirmacion.tipo === 'cambioRol' ? 'Cambiar rol' : 'Desactivar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsuariosAdministrador;
