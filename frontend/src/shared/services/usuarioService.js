const API_URL = import.meta.env.VITE_API_URL || '/api';

export const usuarioService = {
  // Obtener todos los usuarios
  async obtenerTodosLosUsuarios() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/usuarios`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener usuarios');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en obtenerTodosLosUsuarios:', error);
      throw error;
    }
  },

  // Obtener usuario por ID
  async obtenerUsuarioPorId(id) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/usuario/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener usuario');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en obtenerUsuarioPorId:', error);
      throw error;
    }
  },

  // Actualizar rol de usuario
  async actualizarRolUsuario(id, nuevoRol) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/actualizar-rol/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_rol: nuevoRol }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar rol');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en actualizarRolUsuario:', error);
      throw error;
    }
  },

  // Obtener roles disponibles
  async obtenerRoles() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener roles');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en obtenerRoles:', error);
      throw error;
    }
  },

  // Desactivar usuario
  async desactivarUsuario(id) {
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
        throw new Error(errorData.message || 'Error al desactivar usuario');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en desactivarUsuario:', error);
      throw error;
    }
  },
};
