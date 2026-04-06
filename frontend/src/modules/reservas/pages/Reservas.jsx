import React from 'react';
import { useReservas } from '../hooks/useReservas';
import ReservasUI from '../components/ReservasUI';

const Reservas = () => {
  const hookData = useReservas();
  return <ReservasUI {...hookData} />;
};

export default Reservas;
