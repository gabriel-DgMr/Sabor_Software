import { useAuth } from '../context/AuthContext';

export const usePermissions = () => {
  const { user, isAuthenticated, loading } = useAuth();

  const hasRole = role => {
    if (!isAuthenticated || !user || loading) return false;
    return user.nombre_rol === role;
  };

  const hasAnyRole = roles => {
    if (!isAuthenticated || !user || loading) return false;
    return roles.includes(user.nombre_rol);
  };

  const hasAllRoles = roles => {
    if (!isAuthenticated || !user || loading) return false;
    return roles.every(role => user.nombre_rol === role);
  };

  const isAdmin = () => hasRole('Administrador');
  const isEmployee = () => hasRole('Empleado');
  const isUser = () => hasRole('Usuario');

  const canManageUsers = () => isAdmin();
  const canManageProducts = () => isAdmin();
  const canManageOrders = () => hasAnyRole(['Administrador', 'Empleado']);
  const canManageReservations = () => hasAnyRole(['Administrador', 'Empleado']);
  const canViewDashboard = () => isAdmin();
  const canManageInventory = () => isAdmin();

  const canRead = () => isAuthenticated && user;
  const canWriteOwn = () => isAuthenticated && user;
  const canWrite = () => hasAnyRole(['Administrador', 'Empleado']);
  const canDelete = () => isAdmin();

  return {
    // Estado de autenticación
    isAuthenticated,
    loading,
    user,
    userRole: user?.nombre_rol,

    // Verificaciones de rol
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isEmployee,
    isUser,

    // Verificaciones de permisos específicos
    canManageUsers,
    canManageProducts,
    canManageOrders,
    canManageReservations,
    canViewDashboard,
    canManageInventory,

    // Verificaciones de permisos básicos
    canRead,
    canWriteOwn,
    canWrite,
    canDelete,
  };
};
