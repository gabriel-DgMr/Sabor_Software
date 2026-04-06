import { useState, useEffect } from 'react';
import { useAuth } from '../../../app/context/AuthContext';
import { usuariosService } from '../services/usuarios-service';

export const useUsuariosAdministrador = () => {
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

  useEffect(() => {
    const cargarDatos = async () => {
      if (!isAuthenticated || authLoading) {
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError(null);

        const [usuariosData, rolesData] = await Promise.all([
          usuariosService.obtenerTodos(),
          usuariosService.obtenerRoles().catch(() => [
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

  const iniciarEdicionRol = usuario => {
    setUsuarioEditando(usuario.id_usuario);
    const rolCorrespondiente = roles.find(
      r => r.nombre_rol === obtenerEtiquetaRol(usuario.nombre_rol)
    );
    setNuevoRol(
      rolCorrespondiente?.id_rol || roles.find(r => r.nombre_rol === 'Cliente')?.id_rol || ''
    );
  };

  const cancelarEdicion = () => {
    setUsuarioEditando(null);
    setNuevoRol('');
  };

  const confirmarCambioRol = usuario => {
    const rolSeleccionado = roles.find(r => r.id_rol === parseInt(nuevoRol));
    setConfirmacion({
      tipo: 'cambioRol',
      usuario,
      nuevoRol: rolSeleccionado,
      mensaje: `¿Estás seguro de cambiar el rol de ${usuario.nombre_usuario} a ${rolSeleccionado?.nombre_rol}?`,
    });
  };

  const ejecutarCambioRol = async () => {
    try {
      setCargando(true);
      await usuariosService.actualizarRol(confirmacion.usuario.id_usuario, parseInt(nuevoRol));

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

  const ejecutarDesactivacion = async () => {
    try {
      setCargando(true);
      await usuariosService.desactivar(confirmacion.usuario.id_usuario);

      setUsuarios(prev => prev.filter(u => u.id_usuario !== confirmacion.usuario.id_usuario));
      setConfirmacion(null);
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

  return {
    user,
    isAuthenticated,
    authLoading,
    usuarios,
    roles,
    cargando,
    error,
    setError,
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
  };
};
