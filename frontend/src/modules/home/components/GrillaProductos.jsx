import React from 'react';
import PropTypes from 'prop-types';
import ProductoCard from '../../productos/components/ProductoCard.jsx';

const GrillaProductos = ({ t, loading, productos, productosFiltrados }) => {
  const productosAMostrar = productosFiltrados || productos;

  return (
    <section className="seccion seccion--productos">
      <div className="productos">
        {loading && productos.length > 0 ? (
          <div className="productos__loading">
            <div className="loading-spinner" />
            <p>{t('aplicando_filtros')}</p>
          </div>
        ) : productosAMostrar.length === 0 ? (
          <div className="productos__mensaje-no-encontrado">{t('no_encontrado')}</div>
        ) : (
          productosAMostrar.map(producto => (
            <ProductoCard key={producto.id_producto} producto={producto} />
          ))
        )}
      </div>
    </section>
  );
};

GrillaProductos.propTypes = {
  t: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  productos: PropTypes.array.isRequired,
  productosFiltrados: PropTypes.array,
};

export default GrillaProductos;
