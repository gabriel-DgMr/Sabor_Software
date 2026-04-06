import React from 'react';
import { useCarrito } from '../hooks/useCarrito';
import CarritoUI from '../components/CarritoUI';

export default function Carrito() {
  const hookData = useCarrito();
  return <CarritoUI {...hookData} />;
}
