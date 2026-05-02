import PropTypes from 'prop-types';
import React from 'react';
import { useAuth } from '../../app/context/AuthContext';
import LoadingScreen from './LoadingScreen';

const RoleProtectedRoute = ({
  children,
  allowedRoles = [],
  fallback = null,
  requireAllRoles = false,
}) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Si está cargando, mostrar loading
  if (loading) {
    return <LoadingScreen />;
  }

  // Si no está autenticado, no mostrar nada
  if (!isAuthenticated || !user) {
    return fallback || null;
  }

  // Si no hay roles especificados, permitir acceso
  if (allowedRoles.length === 0) {
    return children;
  }

  // Verificar permisos según el rol del usuario
  const hasPermission = requireAllRoles
    ? allowedRoles.every(role => user.nombre_rol === role)
    : allowedRoles.includes(user.nombre_rol);

  // Si tiene permisos, mostrar el contenido
  if (hasPermission) {
    return children;
  }

  // Si no tiene permisos, mostrar fallback o mensaje de error
  return (
    fallback || (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          margin: '20px',
        }}
      >
        <h2 style={{ color: '#dc3545', marginBottom: '10px' }}>Acceso Denegado</h2>
        <p style={{ color: '#6c757d', marginBottom: '20px' }}>
          No tienes permisos para acceder a esta sección.
        </p>
        <p style={{ color: '#6c757d', fontSize: '14px' }}>
          Tu rol actual: <strong>{user.nombre_rol}</strong>
        </p>
        <p style={{ color: '#6c757d', fontSize: '14px' }}>
          Roles permitidos: <strong>{allowedRoles.join(', ')}</strong>
        </p>
      </div>
    )
  );
};

RoleProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  fallback: PropTypes.node,
  requireAllRoles: PropTypes.bool,
};

export default RoleProtectedRoute;
