import React from 'react';
import { useEscanearQR } from '../hooks/useEscanearQR';
import EscanearQRUI from '../components/EscanearQRUI';

const EscanearQR = () => {
  const hookData = useEscanearQR();
  return <EscanearQRUI {...hookData} />;
};

export default EscanearQR;
