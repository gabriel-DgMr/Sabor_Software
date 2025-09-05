import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const useRoleRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const redirectByRole = userRole => {
    switch (userRole) {
      case 'Administrador':
        navigate('/HomeAdministrador');
        break;
      case 'Empleado':
        navigate('/HomeEmpleados');
        break;
      case 'Usuario':
      default:
        navigate('/');
        break;
    }
  };

  const redirectIfAuthenticated = () => {
    if (!loading && isAuthenticated && user && user.nombre_rol) {
      redirectByRole(user.nombre_rol);
    }
  };

  return {
    redirectByRole,
    redirectIfAuthenticated,
    userRole: user?.nombre_rol,
    isAuthenticated,
    loading,
  };
};
