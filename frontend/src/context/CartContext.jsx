import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [closedOrders, setClosedOrders] = useState([]);
  const [currentOrderId, setCurrentOrderId] = useState(1);

  const addItemToCart = (product) => {
    setCartItems((prevItems) => {
      // Aquí podríamos agregar lógica para verificar si el producto ya está en el carrito
      // y actualizar la cantidad en lugar de agregarlo de nuevo como un item separado.
      // Por ahora, simplemente agregamos el producto como un nuevo item.
      const PrecioNumerico = { ...product, precio: parseFloat(product.precio) };
      return [...prevItems, PrecioNumerico];
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

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 