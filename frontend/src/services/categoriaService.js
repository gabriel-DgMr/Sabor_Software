const API_URL = 'http://localhost:3000/api';

export const categoriaService = {
    getAllCategorias: async () => {
        try {
            const response = await fetch(`${API_URL}/categorias`);
            if (!response.ok) {
                throw new Error('Error al obtener categorías');
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    }
}; 