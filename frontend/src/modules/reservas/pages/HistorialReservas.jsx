import React from 'react';
import { useHistorialReservas } from '../hooks/useHistorialReservas';
import HistorialReservasUI from '../components/HistorialReservasUI';

const HistorialReservas = () => {
  const hookData = useHistorialReservas();
  return <HistorialReservasUI {...hookData} />;
};

export default HistorialReservas;
