import PropTypes from 'prop-types';
import React, { createContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

const API_URL = 'http://localhost:3000/api';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar carrito desde la base de datos
  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setCartItems([]);
        return;
      }

      const response = await fetch(`${API_URL}/pedidos/carrito`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const carrito = await response.json();
        setCartItems(carrito.items || []);
      } else if (response.status === 404) {
        // No hay carrito, crear uno vacío
        setCartItems([]);
      } else {
        throw new Error('Error al cargar el carrito');
      }
    } catch (error) {
      console.error('Error al cargar carrito:', error);
      setError(error.message);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar carrito al montar el componente
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addItemToCart = async (product) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Debes iniciar sesión para agregar productos al carrito');
      }

      const response = await fetch(`${API_URL}/pedidos/carrito/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_producto: product.id || product.id_producto,
          cantidad: product.cantidad || 1
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error al agregar producto al carrito');
      }

      // Recargar el carrito para obtener el estado actualizado
      await loadCart();
    } catch (error) {
      console.error('Error al agregar producto:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeItemFromCart = async (id_producto) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Debes iniciar sesión para modificar el carrito');
      }

      const response = await fetch(`${API_URL}/pedidos/carrito/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id_producto })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error al eliminar producto del carrito');
      }

      // Recargar el carrito
      await loadCart();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (id_producto, cantidad) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Debes iniciar sesión para modificar el carrito');
      }

      const response = await fetch(`${API_URL}/pedidos/carrito/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id_producto, cantidad })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error al actualizar cantidad');
      }

      // Recargar el carrito
      await loadCart();
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setCartItems([]);
        return;
      }

      const response = await fetch(`${API_URL}/pedidos/carrito/vaciar`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error al vaciar el carrito');
      }

      setCartItems([]);
    } catch (error) {
      console.error('Error al vaciar carrito:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const confirmarPedido = async (metodo_pago) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Debes iniciar sesión para confirmar el pedido');
      }

      const response = await fetch(`${API_URL}/pedidos/carrito/confirmar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ metodo_pago })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error al confirmar el pedido');
      }

      // Limpiar carrito después de confirmar
      setCartItems([]);
      return await response.json();
    } catch (error) {
      console.error('Error al confirmar pedido:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + (item.cantidad || 1), 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.precio_unitario * (item.cantidad || 1)), 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      loading,
      error,
      cartCount,
      cartTotal,
      addItemToCart, 
      removeItemFromCart, 
      updateItemQuantity,
      clearCart,
      confirmarPedido,
      loadCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { CartContext }; 