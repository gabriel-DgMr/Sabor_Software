import axios from "axios";

const API_URL = "http://localhost:3000/api/domicilios";

const domicilioService = {
  // Obtener historial de domicilios
  getHistorialDomicilios: () => {
    const token = localStorage.getItem("token"); // <-- aquí tomas el token guardado al hacer login
    return axios.get(`${API_URL}/historial`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Crear un nuevo domicilio
  crearDomicilio: (data) => {
    const token = localStorage.getItem("token");
    return axios.post(`${API_URL}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Actualizar un domicilio
  actualizarDomicilio: (id, data) => {
    const token = localStorage.getItem("token");
    return axios.put(`${API_URL}/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Eliminar un domicilio
  eliminarDomicilio: (id) => {
    const token = localStorage.getItem("token");
    return axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

export default domicilioService;
