const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Servicio para la gestión de productos.
 * Centraliza todas las peticiones a la API relacionadas con el dominio de productos.
 */
export const productosService = {
  /**
   * Obtiene todos los productos con soporte para internacionalización y filtros.
   */
  obtenerTodos: async (filtros = {}, idioma = 'es') => {
    try {
      const params = new URLSearchParams();
      if (filtros.categoria) params.append('categoria', filtros.categoria);
      if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
      if (filtros.orden) params.append('orden', filtros.orden);
      params.append('lang', idioma);

      const response = await fetch(`${API_URL}/productos?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener los productos');
      }

      const data = await response.json();
      return data.map(producto => ({
        ...producto,
        calificacion_promedio: Number(producto.calificacion_promedio ?? producto.calificacion ?? 0),
        total_calificaciones: Number(producto.total_calificaciones ?? 0),
        calificacion: Number(producto.calificacion_promedio ?? producto.calificacion ?? 0),
      }));
    } catch (error) {
      console.error('Error en obtenerTodos productos:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo producto utilizando FormData para el envío de imágenes.
   */
  crear: async producto => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const formData = new FormData();
      formData.append('nombre_producto', producto.nombre_producto);
      formData.append('descripcion_producto', producto.descripcion_producto);
      formData.append('descripcion_en', producto.descripcion_en || '');
      formData.append('precio_producto', producto.precio_producto);
      formData.append('id_categoria_producto', producto.id_categoria_producto);

      if (producto.stock !== undefined) {
        formData.append('stock', producto.stock);
      }

      if (producto.imagen_producto) {
        formData.append('imagen_producto', producto.imagen_producto);
      }

      const response = await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Error al crear el producto');
      }

      return response.json();
    } catch (error) {
      console.error('Error en crear producto:', error);
      throw error;
    }
  },

  /**
   * Actualiza un producto existente.
   */
  actualizar: async (id, producto) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const formData = new FormData();
      formData.append('nombre_producto', producto.nombre_producto);
      formData.append('descripcion_producto', producto.descripcion_producto);
      formData.append('descripcion_en', producto.descripcion_en || '');
      formData.append('precio_producto', producto.precio_producto);
      formData.append('id_categoria_producto', producto.id_categoria_producto);

      if (producto.stock !== undefined) {
        formData.append('stock', producto.stock);
      }
      if (producto.imagen_producto) {
        formData.append('imagen_producto', producto.imagen_producto);
      }

      const response = await fetch(`${API_URL}/productos/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el producto');
      }

      return response.json();
    } catch (error) {
      console.error('Error en actualizar producto:', error);
      throw error;
    }
  },

  /**
   * Elimina un producto por su ID.
   */
  eliminar: async id => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`${API_URL}/productos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar el producto');
      }

      return response.json();
    } catch (error) {
      console.error('Error en eliminar producto:', error);
      throw error;
    }
  },

  /**
   * Obtiene las traducciones de un producto específico.
   */
  obtenerTraducciones: async id => {
    try {
      const response = await fetch(`${API_URL}/productos/${id}/traducciones`);
      if (!response.ok) throw new Error('Error al obtener las traducciones del producto');
      return response.json();
    } catch (error) {
      console.error('Error en obtenerTraducciones:', error);
      throw error;
    }
  },
};
