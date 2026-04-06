import React from 'react';
import { useActualizarDatos } from '../hooks/useActualizarDatos';
import ActualizarDatosUI from '../components/ActualizarDatosUI';

const ActualizarDatos = () => {
  const hookData = useActualizarDatos();
  return <ActualizarDatosUI {...hookData} />;
};

export default ActualizarDatos;
