import PropTypes from 'prop-types';
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { toast } from 'react-toastify';
import * as PedidosService from '../services/pedidos-service';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mesa, setMesa] = useState(() => localStorage.getItem('mesa') || '');

  useEffect(() => {
    if (mesa) {
      localStorage.setItem('mesa', mesa);
    } else {
      localStorage.removeItem('mesa');
    }
  }, [mesa]);

  useEffect(() => {
    const handleBeforeUnload = () => localStorage.removeItem('mesa');
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const loadCart = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const data = await PedidosService.obtenerCarrito();
      setCartItems(data.items || []);
    } catch (err) {
      setError(err.message);
      setCartItems([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addItemToCart = async product => {
    const previousItems = [...cartItems];
    try {
      // Para agregar, usualmente no es tan crítico el parpadeo porque se hace desde fuera del carrito,
      // pero igual lo hacemos "background" si ya estamos en una vista de carrito o similar.
      // Aquí decidimos mantener el loading si el carrito está vacío para una mejor UX inicial.
      if (cartItems.length === 0) setLoading(true);

      const idMesa = product.id_mesa || mesa || localStorage.getItem('mesa');
      await PedidosService.agregarAlCarrito(
        product.id || product.id_producto,
        product.cantidad || 1,
        idMesa,
        product.peticion || product.mensaje
      );
      await loadCart(true); // Sync silencioso
      toast.success('Producto agregado al carrito');
    } catch (err) {
      setCartItems(previousItems);
      setError(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeItemFromCart = async id_producto => {
    const previousItems = [...cartItems];

    // Update optimista
    setCartItems(current => current.filter(item => item.id_producto !== id_producto));

    try {
      await PedidosService.eliminarDelCarrito(id_producto);
      await loadCart(true);
      toast.success('Producto eliminado');
    } catch (err) {
      setCartItems(previousItems);
      setError(err.message);
      toast.error(err.message);
      throw err;
    }
  };

  const updateItemQuantity = async (id_producto, cantidad) => {
    const previousItems = [...cartItems];

    // Update optimista
    setCartItems(current =>
      current.map(item => (item.id_producto === id_producto ? { ...item, cantidad } : item))
    );

    try {
      await PedidosService.actualizarCantidadCarrito(id_producto, cantidad);
      await loadCart(true); // Sync silencioso en background
    } catch (err) {
      setCartItems(previousItems);
      setError(err.message);
      toast.error(err.message);
      throw err;
    }
  };

  const updateItemMessage = async (id_producto, mensaje) => {
    const previousItems = [...cartItems];

    // Update optimista
    setCartItems(current =>
      current.map(item => (item.id_producto === id_producto ? { ...item, mensaje } : item))
    );

    try {
      await PedidosService.actualizarMensajeCarrito(id_producto, mensaje);
      await loadCart(true);
    } catch (err) {
      setCartItems(previousItems);
      setError(err.message);
      toast.error(err.message);
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await PedidosService.vaciarCarrito();
      setCartItems([]);
      toast.success('Carrito vaciado');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const confirmarPedido = async datos => {
    try {
      setLoading(true);
      const result = await PedidosService.confirmarPedidoAPI({
        ...datos,
        id_mesa: datos.id_mesa || mesa || localStorage.getItem('mesa'),
      });
      setCartItems([]);
      toast.success('¡Pedido confirmado!');
      return result;
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearMesa = useCallback(() => {
    setMesa('');
    localStorage.removeItem('mesa');
  }, []);

  const cartCount = cartItems.length;
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.precio_unitario * (item.cantidad || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        cartCount,
        cartTotal,
        addItemToCart,
        removeItemFromCart,
        updateItemQuantity,
        updateItemMessage,
        clearCart,
        confirmarPedido,
        loadCart,
        mesa,
        setMesa,
        clearMesa,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { CartContext };
