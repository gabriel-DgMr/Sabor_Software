import React from 'react';
import PropTypes from 'prop-types';
import '../styles/pedidos.css';
import Footer from '../../../shared/components/Footer.jsx';
import Header from '../../../shared/components/Header.jsx';

const ModificarPedidoUI = ({
  cartItems,
  recomendaciones,
  setRecomendaciones,
  eliminarItem,
  agregarProducto,
  confirmarCambios,
  regresar,
  t,
}) => {
  return (
    <div className="pagina-carrito">
      <Header />
      <main className="seccion-carrito">
        <div className="contenedor-carrito contenedor-carrito--unico">
          <div className="carrito-seccion">
            <header className="carrito-seccion__encabezado">
              <h1 className="carrito-seccion__titulo">{t('modificar_titulo')}</h1>
            </header>

            <div className="carrito-lista">
              {cartItems.map((item, index) => (
                <div key={index} className="carrito-item">
                  <div className="carrito-item__info">
                    <h3 className="carrito-item__nombre">{item.nombre_producto || item.nombre}</h3>
                    <p className="carrito-item__precio">
                      {(item.precio_unitario || item.precio || 0).toLocaleString('es-CO')} COP
                    </p>
                  </div>
                  <button
                    className="boton-moderno boton-moderno--peligro"
                    onClick={() => eliminarItem(index)}
                    title={t('carrito_eliminar')}
                  >
                    🗑️
                  </button>
                </div>
              ))}

              <div className="carrito-item carrito-item--columna">
                <h3 className="carrito-item__nombre" style={{ marginBottom: '1.5rem' }}>
                  {t('modificar_info_adicional')}
                </h3>
                <textarea
                  className="input-textarea"
                  placeholder={t('modificar_placeholder')}
                  value={recomendaciones}
                  onChange={e => setRecomendaciones(e.target.value)}
                />
              </div>

              <button
                className="boton-moderno boton-moderno--secundario"
                style={{ width: '100%', marginTop: '2rem' }}
                onClick={agregarProducto}
              >
                + {t('modificar_agregar_producto')}
              </button>

              <div
                className="carrito-resumen__acciones"
                style={{ marginTop: '3rem', flexDirection: 'row' }}
              >
                <button
                  className="boton-moderno boton-moderno--primario"
                  style={{ flex: 1 }}
                  onClick={confirmarCambios}
                >
                  {t('modificar_confirmar_cambios')}
                </button>
                <button
                  className="boton-moderno boton-moderno--blanco"
                  style={{ flex: 1 }}
                  onClick={regresar}
                >
                  {t('modificar_regresar')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

ModificarPedidoUI.propTypes = {
  cartItems: PropTypes.array.isRequired,
  recomendaciones: PropTypes.string.isRequired,
  setRecomendaciones: PropTypes.func.isRequired,
  eliminarItem: PropTypes.func.isRequired,
  agregarProducto: PropTypes.func.isRequired,
  confirmarCambios: PropTypes.func.isRequired,
  regresar: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default ModificarPedidoUI;
