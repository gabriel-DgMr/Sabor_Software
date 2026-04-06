import React from 'react';
import { useCheckout } from '../hooks/useCheckout.jsx';
import CheckoutUI from '../components/CheckoutUI';

export default function Checkout() {
  const hookData = useCheckout();
  return <CheckoutUI {...hookData} />;
}
