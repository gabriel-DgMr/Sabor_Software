import React from 'react';
import { useReservacionesAdministrador } from '../hooks/useReservacionesAdministrador';
import ReservacionesAdministradorUI from '../components/ReservacionesAdministradorUI';

const ReservacionesAdministrador = () => {
  const hookData = useReservacionesAdministrador();
  return <ReservacionesAdministradorUI {...hookData} />;
};

export default ReservacionesAdministrador;
