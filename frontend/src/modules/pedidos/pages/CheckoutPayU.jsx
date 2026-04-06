import React from 'react';
import { useCheckoutPayU } from '../hooks/useCheckoutPayU.jsx';
import CheckoutPayUUI from '../components/CheckoutPayUUI';

const CheckoutPayU = () => {
  const hookData = useCheckoutPayU();
  return <CheckoutPayUUI {...hookData} />;
};

export default CheckoutPayU;
