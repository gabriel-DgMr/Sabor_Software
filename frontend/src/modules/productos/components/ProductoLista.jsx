import React from 'react';
import PropTypes from 'prop-types';
import ProductoItem from './ProductoItem';

/**
 * ProductoLista - Renderiza la lista de productos en una grilla premium.
 */
const ProductoLista = ({
  productos,
  loadingStates = { delete: {}, edit: {} },
  handleEditProduct = () => {},
  handleDeleteProduct = () => {},
  admin = false,
}) => {
  if (productos.length === 0) {
    return (
      <div className="estado-vacio">
        <p>No se encontraron productos que coincidan con la búsqueda.</p>
      </div>
    );
  }

  return (
    <>
      {productos.map(producto => (
        <ProductoItem
          key={producto.id_producto}
          admin={admin}
          isDeleting={loadingStates.delete[producto.id_producto]}
          isEditing={loadingStates.edit[producto.id_producto]}
          producto={producto}
          onDelete={handleDeleteProduct}
          onEdit={handleEditProduct}
        />
      ))}
    </>
  );
};

ProductoLista.propTypes = {
  productos: PropTypes.array.isRequired,
  loadingStates: PropTypes.object,
  handleEditProduct: PropTypes.func,
  handleDeleteProduct: PropTypes.func,
  admin: PropTypes.bool,
};

export default ProductoLista;
