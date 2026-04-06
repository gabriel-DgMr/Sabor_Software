import { useEffect } from 'react';
import { useProductos } from '../../../shared/context/ProductoContext';
import { productosService } from '../services/productos-service';

/**
 * Hook para la gestión de productos desde la vista del empleado.
 * Simplificado para solo lectura y carga inicial.
 */
export const useProductosEmpleados = () => {
  const { state, dispatch } = useProductos();

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const productos = await productosService.obtenerTodos();
        dispatch({ type: 'SET_PRODUCTOS', payload: productos });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    cargarProductos();
  }, [dispatch]);

  return {
    state,
  };
};
