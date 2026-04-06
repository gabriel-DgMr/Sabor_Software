import React from 'react';
import { usePedidosEmpleados } from '../hooks/usePedidosEmpleados';
import PedidosEmpleadosUI from '../components/PedidosEmpleadosUI';

const PedidosEmpleados = () => {
  const hookData = usePedidosEmpleados();
  return <PedidosEmpleadosUI {...hookData} />;
};

export default PedidosEmpleados;
