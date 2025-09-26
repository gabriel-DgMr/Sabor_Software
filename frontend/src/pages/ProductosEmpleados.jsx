import React, { useEffect } from 'react';

import MenuLateral from '../components/MenuLateralEmpleado.jsx';
import { useProductos } from '../context/ProductoContext';
import { productoService } from '../services/productoService';
import { getImageUrl } from '../utils/imageUtils.js';
import { GoX } from 'react-icons/go';

import '../styles/empleados.css';

// Componente de error visualmente consistente para administración de productos
const ProductosError = ({ message, onRetry }) => {
  if (!message) return null;
  return (
    <div className="error-global">
      <GoX className="GoX" />
      <span>{message}</span>
      {onRetry && <button onClick={onRetry}>Reintentar</button>}
    </div>
  );
};

const ProductosAdministrar = () => {
  const { state, dispatch } = useProductos();

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        const productos = await productoService.obtenerTodos();

        dispatch({ type: 'SET_PRODUCTOS', payload: productos });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    cargarProductos();
  }, [dispatch]);

  const formatearPrecio = precio => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(precio);
  };

  // Agrupar productos por categoría
  const productosPorCategoria = state.productos.reduce((acc, producto) => {
    const categoria = producto.nombre_categoria || 'Sin categoría';
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(producto);
    return acc;
  }, {});

  if (state.loading) {
    return (
      <div className="layout">
        <MenuLateral />
        <main className="productos__administrar">
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Cargando productos...</p>
          </div>
        </main>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="layout">
        <MenuLateral />
        <main className="productos__administrar">
          <ProductosError
            message={`Error al cargar productos: ${state.error}`}
            onRetry={() => window.location.reload()}
          />
        </main>
      </div>
    );
  }

  if (state.productos.length === 0) {
    return (
      <div className="layout">
        <MenuLateral />
        <main className="productos__administrar">
          <div className="empty-state">
            <p>No hay productos disponibles</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="layout">
      <MenuLateral />
      <main className="productos__administrar">
        <h1 className="titulos__empleados">Productos</h1>
        <section className="contenedor__productos__ancho">
          <div className="contenedor__productos-vista">
            {Object.entries(productosPorCategoria).map(([categoria, productosCategoria]) => (
              <article key={categoria} className="productos__vista">
                <h2 className="vista__titulo--primera">Categoria: {categoria}</h2>
                <div className="productos__grid--empleado">
                  {productosCategoria.map(producto => (
                    <div key={producto.id_producto} className="productos__card-producto">
                      <img
                        alt={producto.nombre_producto}
                        className="productos__imagen"
                        src={getImageUrl(producto.imagen_producto)}
                      />
                      <div className="productos__info">
                        <h4 className="productos__nombre">{producto.nombre_producto}</h4>
                        <p className="productos__precio">
                          {formatearPrecio(producto.precio_producto)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProductosAdministrar;
