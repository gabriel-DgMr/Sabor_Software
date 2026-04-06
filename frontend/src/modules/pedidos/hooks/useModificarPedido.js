import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from './useCart.js';

export const useModificarPedido = () => {
  const navigate = useNavigate();
  const { cartItems, removeItemFromCart } = useCart();
  const [recomendaciones, setRecomendaciones] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    const recomendacionesGuardadas = localStorage.getItem('recomendacionesPedido');
    if (recomendacionesGuardadas) {
      setRecomendaciones(recomendacionesGuardadas);
    }
  }, []);

  const eliminarItem = index => {
    removeItemFromCart(index);
  };

  const agregarProducto = () => {
    navigate('/');
  };

  const confirmarCambios = () => {
    localStorage.setItem('recomendacionesPedido', recomendaciones);
    navigate('/carrito');
  };

  const regresar = () => {
    navigate('/carrito');
  };

  return {
    cartItems,
    recomendaciones,
    setRecomendaciones,
    eliminarItem,
    agregarProducto,
    confirmarCambios,
    regresar,
    t,
  };
};
