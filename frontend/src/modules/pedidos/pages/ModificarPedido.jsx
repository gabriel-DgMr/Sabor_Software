import React from 'react';
import { useModificarPedido } from '../hooks/useModificarPedido';
import ModificarPedidoUI from '../components/ModificarPedidoUI';

const ModificarPedido = () => {
  const hookData = useModificarPedido();
  return <ModificarPedidoUI {...hookData} />;
};

export default ModificarPedido;
