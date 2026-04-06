import React from 'react';
import { usePedidosAdministrador } from '../hooks/usePedidosAdministrador';
import PedidosAdministradorUI from '../components/PedidosAdministradorUI';

const PedidosAdministrador = () => {
  const hookData = usePedidosAdministrador();
  return <PedidosAdministradorUI {...hookData} />;
};

export default PedidosAdministrador;
