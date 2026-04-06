import React from 'react';
import { useReservacionesEmpleados } from '../hooks/useReservacionesEmpleados';
import ReservacionesEmpleadosUI from '../components/ReservacionesEmpleadosUI';

const ReservacionesEmpleados = () => {
  const hookData = useReservacionesEmpleados();
  return <ReservacionesEmpleadosUI {...hookData} />;
};

export default ReservacionesEmpleados;
