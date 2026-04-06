import api from '../../../shared/services/api';

const bannersService = {
  // Public endpoints
  getAllBanners: async () => {
    try {
      const response = await api.get('/banners');
      return response.data;
    } catch (error) {
      console.error('Error fetching banners:', error);
      throw error;
    }
  },

  // Admin endpoints
  getAdminBanners: async () => {
    try {
      const response = await api.get('/banners?admin=true');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin banners:', error);
      throw error;
    }
  },

  createBanner: async formData => {
    try {
      const response = await api.post('/banners', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating banner:', error);
      throw error;
    }
  },

  updateBanner: async (id, formData) => {
    try {
      const response = await api.put(`/banners/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating banner:', error);
      throw error;
    }
  },

  deleteBanner: async id => {
    try {
      const response = await api.delete(`/banners/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting banner:', error);
      throw error;
    }
  },
};

export default bannersService;
