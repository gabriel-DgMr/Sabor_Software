import api from '../../../shared/services/api';
import logger from '../../../shared/utils/logger.js';

/**
 * Servicio de Autenticación
 * Centraliza todas las llamadas a la API relacionadas con identidad y acceso.
 */
const authService = {
  /**
   * Inicia sesión con correo y contraseña.
   */
  login: async (correo_usuario, contraseña_usuario) => {
    try {
      const response = await api.post('/auth/login', {
        correo_usuario,
        contraseña_usuario,
      });
      return { success: true, ...response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al iniciar sesión',
      };
    }
  },

  /**
   * Registra un nuevo usuario.
   */
  register: async userData => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, ...response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error en el registro',
      };
    }
  },

  /**
   * Cierra la sesión del usuario.
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
      return { success: true };
    } catch (error) {
      logger.error('Error al cerrar sesión:', error);
      return { success: false };
    }
  },

  /**
   * Obtiene el perfil del usuario actual.
   */
  getPerfil: async () => {
    try {
      const response = await api.get('/auth/perfil');
      return { success: true, ...response.data };
    } catch (error) {
      return { success: false, message: 'No autorizado' };
    }
  },

  /**
   * Solicita recuperación de contraseña.
   */
  forgotPassword: async correo_usuario => {
    try {
      const response = await api.post('/auth/forgot-password', { correo_usuario });
      return { success: true, ...response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al solicitar recuperación',
      };
    }
  },

  /**
   * Restablece la contraseña con un token.
   */
  resetPassword: async (token, contraseña_usuario) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { contraseña_usuario });
      return { success: true, ...response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al restablecer contraseña',
      };
    }
  },

  /**
   * Verifica el correo electrónico.
   */
  verifyEmail: async token => {
    try {
      const response = await api.get(`/auth/verify-email/${token}`);
      return { success: true, ...response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error en la verificación',
      };
    }
  },

  /**
   * Reenvía el código de verificación.
   */
  resendVerification: async correo_usuario => {
    try {
      const response = await api.post('/auth/resend-verification', { correo_usuario });
      return { success: true, ...response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al reenviar código',
      };
    }
  },
};

export default authService;
