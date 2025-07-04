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
      return [...prevItems, productoConId];
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
      createNewOrder
    }}>
      {children}
    </CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { CartContext }; 