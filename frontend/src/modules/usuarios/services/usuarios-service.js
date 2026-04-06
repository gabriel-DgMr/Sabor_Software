const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Servicio para la gestión de usuarios y perfiles.
 * Centraliza la comunicación con la API para el dominio de usuarios.
 */
export const usuariosService = {
  /**
   * Obtiene todos los usuarios registrados (requiere admin).
   */
  obtenerTodos: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/usuarios`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Error al obtener la lista de usuarios');
      return await response.json();
    } catch (error) {
      console.error('Error en usuariosService.obtenerTodos:', error);
      throw error;
    }
  },

  /**
   * Obtiene un usuario específico por su ID.
   */
  obtenerPorId: async id => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/usuario/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Error al obtener el usuario');
      return await response.json();
    } catch (error) {
      console.error('Error en usuariosService.obtenerPorId:', error);
      throw error;
    }
  },

  /**
   * Actualiza el rol de un usuario.
   */
  actualizarRol: async (id, idRol) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/actualizar-rol/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_rol: idRol }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el rol');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en usuariosService.actualizarRol:', error);
      throw error;
    }
  },

  /**
   * Obtiene el listado de roles disponibles en el sistema.
   */
  obtenerRoles: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Error al obtener los roles');
      return await response.json();
    } catch (error) {
      console.error('Error en usuariosService.obtenerRoles:', error);
      throw error;
    }
  },

  /**
   * Desactiva (elimina lógicamente) un usuario.
   */
  desactivar: async id => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/eliminarusuario/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al desactivar el usuario');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en usuariosService.desactivar:', error);
      throw error;
    }
  },

  /**
   * Actualiza los datos del perfil del usuario actual (nombre, correo, teléfono, imagen).
   */
  actualizarPerfil: async (id, formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/actualizarusuario/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          // No establecer Content-Type para dejar que el navegador ponga el boundary de FormData
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al actualizar el perfil');
      return data;
    } catch (error) {
      console.error('Error en usuariosService.actualizarPerfil:', error);
      throw error;
    }
  },
};
