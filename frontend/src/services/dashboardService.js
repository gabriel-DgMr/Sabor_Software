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
};

export default dashboardService;
