import React from 'react';
import { useHistorialPedidos } from '../hooks/useHistorialPedidos';
import HistorialPedidosUI from '../components/HistorialPedidosUI';

const HistorialPedidos = () => {
  const hookData = useHistorialPedidos();
  return <HistorialPedidosUI {...hookData} />;
};

export default HistorialPedidos;
