import PropTypes from 'prop-types';
import React, { createContext, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [closedOrders, setClosedOrders] = useState([]);
  const [currentOrderId, setCurrentOrderId] = useState(1);

  const addItemToCart = (product) => {
    setCartItems((prevItems) => {
      // Asegurarse de que el producto tenga un id
      const productoConId = {
        ...product,
        id: product.id || product.id_producto // Usa el campo correcto si existe
      };
      // Buscar si ya existe el producto (por id o nombre)
      const indexExistente = prevItems.findIndex(
        item => (item.id && productoConId.id && item.id === productoConId.id) || item.nombre === productoConId.nombre
      );
      if (indexExistente !== -1) {
        // Sumar la cantidad
        const nuevosItems = [...prevItems];
        nuevosItems[indexExistente] = {
          ...nuevosItems[indexExistente],
          cantidad: (nuevosItems[indexExistente].cantidad || 1) + (productoConId.cantidad || 1),
          // Si la petición es diferente, concatenar (opcional)
          peticion: productoConId.peticion ? ((nuevosItems[indexExistente].peticion ? nuevosItems[indexExistente].peticion + ' | ' : '') + productoConId.peticion) : nuevosItems[indexExistente].peticion
        };
        return nuevosItems;
      }
      // Si no existe, agregar con cantidad
      return [...prevItems, { ...productoConId, cantidad: productoConId.cantidad || 1 }];
    });
  };

  const removeItemFromCart = (indexToRemove) => {
    setCartItems((prevItems) => prevItems.filter((_, index) => index !== indexToRemove));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const closeCurrentOrder = () => {
    if (cartItems.length > 0) {
      const orderToClose = {
        id: currentOrderId,
        items: [...cartItems],
        recomendaciones: localStorage.getItem('recomendacionesPedido') || '',
        fecha: new Date().toISOString()
      };
      
      setClosedOrders(prev => [...prev, orderToClose]);
      setCartItems([]);
      setCurrentOrderId(prev => prev + 1);
      localStorage.removeItem('recomendacionesPedido');
    }
  };

  const createNewOrder = () => {
    setCartItems([]);
    setCurrentOrderId(prev => prev + 1);
    localStorage.removeItem('recomendacionesPedido');
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      closedOrders,
      currentOrderId,
      addItemToCart, 
      removeItemFromCart, 
      clearCart,
      closeCurrentOrder,
      createNewOrder,
      cartCount: cartItems.reduce((sum, item) => sum + (item.cantidad || 1), 0)
    }}>
      {children}
    </CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { CartContext }; 