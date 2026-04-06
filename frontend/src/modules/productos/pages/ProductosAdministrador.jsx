import React from 'react';
import { useProductosAdministrador } from '../hooks/useProductosAdministrador';
import ProductosAdministradorUI from '../components/ProductosAdministradorUI';

const ProductosAdministrador = () => {
  const hookData = useProductosAdministrador();
  return <ProductosAdministradorUI {...hookData} />;
};

export default ProductosAdministrador;
