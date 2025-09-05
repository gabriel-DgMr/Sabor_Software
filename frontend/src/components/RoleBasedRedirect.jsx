import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleBasedRedirect = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // Redireccionar según el rol del usuario
      switch (user.nombre_rol) {
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
    }
  }, [user, isAuthenticated, loading, navigate]);

  // Mostrar loading mientras se determina la redirección
  if (loading || (isAuthenticated && user)) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          color: '#666',
        }}
      >
        Redirigiendo...
      </div>
    );
  }

  return children;
};

RoleBasedRedirect.propTypes = {
  children: PropTypes.node.isRequired,
};

export default RoleBasedRedirect;
