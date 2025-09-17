import api from './api';

const dashboardService = {
  getMetrics: async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const res = await api.get('/dashboard/metrics', {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
    return res.data;
  },

  getSalesMetrics: async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const res = await api.get('/dashboard/sales', {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
    return res.data;
  },

  getEmployeeMetrics: async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const res = await api.get('/dashboard/employees', {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
    return res.data;
  },
};

export default dashboardService;
