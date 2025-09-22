const API_URL = import.meta.env.VITE_API_URL || '/api';

export const productoService = {
  obtenerTodos: async (idioma = 'es') => {
    try {
      const response = await fetch(`${API_URL}/productos?lang=${idioma}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener los productos');
      }

      return response.json();
    } catch (error) {
      console.error('Error en obtener productos:', error);
      throw error;
    }
  },
  crear: async producto => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const formData = new FormData();

      // Agregar los campos del producto al FormData
      formData.append('nombre_producto', producto.nombre_producto);
      formData.append('descripcion_producto', producto.descripcion_producto);
      formData.append('precio_producto', producto.precio_producto);
      formData.append('id_categoria_producto', producto.id_categoria_producto);

      if (!producto.imagen_producto) {
        throw new Error('La imagen es obligatoria');
      }
      formData.append('imagen_producto', producto.imagen_producto);

      const response = await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error del servidor:', errorData);
        throw new Error(errorData.message || errorData.error || 'Error al crear el producto');
      }

      return response.json();
    } catch (error) {
      console.error('Error en crear producto:', error);
      throw error;
    }
  },
  actualizar: async (id, producto) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const formData = new FormData();

      // Agregar los campos del producto al FormData
      formData.append('nombre_producto', producto.nombre_producto);
      formData.append('descripcion_producto', producto.descripcion_producto);
      formData.append('precio_producto', producto.precio_producto);
      formData.append('id_categoria_producto', producto.id_categoria_producto);
      if (producto.imagen_producto) {
        formData.append('imagen_producto', producto.imagen_producto);
      }

      const response = await fetch(`${API_URL}/productos/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
  eliminar: async id => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${API_URL}/productos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
  getProductos: async (filtros = {}, idioma = 'es') => {
    const params = new URLSearchParams();
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
    if (filtros.orden) params.append('orden', filtros.orden);
    params.append('lang', idioma);
    const url = `${API_URL}/productos?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al obtener productos');
    return await response.json();
  },
};
