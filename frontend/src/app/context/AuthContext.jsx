import PropTypes from 'prop-types';
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../../modules/auth/services/auth-service';
import logger from '../../shared/utils/logger.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar la sesión al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const result = await authService.getPerfil();
          if (result.success) {
            setUser(result.user);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('token');
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        logger.error('Error al verificar autenticación:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (correo_usuario, contraseña_usuario) => {
    try {
      setLoading(true);
      const result = await authService.login(correo_usuario, contraseña_usuario);

      if (result.success) {
        localStorage.setItem('token', result.token);
        setUser(result.user);
        setIsAuthenticated(true);
      }
      return result;
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async userData => {
    try {
      setLoading(true);
      const result = await authService.register(userData);
      return result;
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (localStorage.getItem('token')) {
        await authService.logout();
      }
    } catch (error) {
      logger.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        registerUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
