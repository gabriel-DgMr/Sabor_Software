import React from 'react';
import { useProductosEmpleados } from '../hooks/useProductosEmpleados';
import ProductosEmpleadosUI from '../components/ProductosEmpleadosUI';

const ProductosEmpleados = () => {
  const hookData = useProductosEmpleados();
  return <ProductosEmpleadosUI {...hookData} />;
};

export default ProductosEmpleados;
