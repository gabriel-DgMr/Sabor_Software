import React from 'react';
import PropTypes from 'prop-types';
import MenuLateral from '../../dashboard/components/MenuLateralEmpleado';
import ProductoLista from './ProductoLista';
import '../styles/productos.css';

/**
 * ProductosEmpleadosUI - Vista de catálogo para empleados.
 * Utiliza ProductoLista en modo lectura.
 */
const ProductosEmpleadosUI = ({ state }) => {
  if (state.loading) {
    return (
      <div className="tablero">
        <MenuLateral />
        <main className="tablero__principal">
          <div className="cargando">
            <div className="spinner" />
            <p>Cargando catálogo...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="tablero">
      <MenuLateral />
      <main className="tablero__principal">
        <header className="encabezado-tablero">
          <h1 className="encabezado-tablero__titulo">Catálogo de Productos</h1>
        </header>

        {state.error && (
          <div className="notificacion notificacion--error">
            Error al cargar productos: {state.error}
          </div>
        )}

        <div className="tablero-productos">
          <ProductoLista admin={false} productos={state.productos} />
        </div>
      </main>
    </div>
  );
};

ProductosEmpleadosUI.propTypes = {
  state: PropTypes.object.isRequired,
};

export default ProductosEmpleadosUI;
