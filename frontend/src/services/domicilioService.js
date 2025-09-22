import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || '/api'}/domicilios`;

const domicilioService = {
  // Obtener historial de domicilios (cliente)
  getHistorialDomicilios: () => {
    const token = localStorage.getItem('token'); // token guardado al hacer login
    return axios.get(`${API_URL}/historial`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Obtener todos los domicilios (empleado/admin)
  getDomicilios: () => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/todos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Crear un nuevo domicilio
  crearDomicilio: (data) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Actualizar un domicilio
  actualizarDomicilio: (id, data) => {
    const token = localStorage.getItem('token');
    return axios.put(`${API_URL}/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Eliminar un domicilio
  eliminarDomicilio: (id) => {
    const token = localStorage.getItem('token');
    return axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

export default domicilioService;
