import React from 'react';
import { useHistorialDomicilios } from '../hooks/useHistorialDomicilios';
import HistorialDomiciliosUI from '../components/HistorialDomiciliosUI';

const HistorialDomicilios = () => {
  const hookData = useHistorialDomicilios();
  return <HistorialDomiciliosUI {...hookData} />;
};

export default HistorialDomicilios;
