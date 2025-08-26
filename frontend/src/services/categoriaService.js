const API_URL = 'http://localhost:3000/api';

export const categoriaService = {
  getAllCategorias: async (idioma = 'es') => {
    const response = await fetch(`${API_URL}/categorias?idioma=${idioma}`);
    if (!response.ok) {
      throw new Error('Error al obtener categorías');
    }
    return await response.json();
  },

  getCategoriaById: async (id, idioma = 'es') => {
    const response = await fetch(`${API_URL}/categorias/${id}?idioma=${idioma}`);
    if (!response.ok) {
      throw new Error('Error al obtener categoría');
    }
    return await response.json();
  },
};
