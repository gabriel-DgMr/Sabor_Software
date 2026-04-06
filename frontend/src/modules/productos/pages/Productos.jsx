import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { GoX } from 'react-icons/go';
import { useLocation } from 'react-router-dom';

// Componentes Compartidos
import Footer from '../../../shared/components/Footer.jsx';
import Header from '../../../shared/components/Header.jsx';
import LoadingScreen from '../../../shared/components/LoadingScreen.jsx';

// Contextos y Hooks
import { useCategorias } from '../../../shared/context/CategoriaContext';
import { useProductos } from '../../../shared/context/ProductoContext';
import { useDebounce } from '../../../shared/hooks/useDebounce.js';

// Sub-componentes
import BarraFiltros from '../../home/components/BarraFiltros.jsx';
import GrillaProductos from '../../home/components/GrillaProductos.jsx';

// Estilos
import '../../home/styles/home.css'; // Reutilizamos estilos base
import '../../../index.css';

const ErrorDisplay = ({ message }) => {
  if (!message) return null;
  return (
    <div className="error-global">
      <GoX className="GoX" />
      <span>{message}</span>
    </div>
  );
};

const Productos = () => {
  const { t } = useTranslation();
  const location = useLocation();

  // Estados de Productos y Categorías
  const { state, aplicarFiltrosLocales, getProductosFiltrados } = useProductos();
  const { categorias, loading: loadingCategorias, error: errorCategorias } = useCategorias();

  // Estados de Filtro y Búsqueda
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [orden, setOrden] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const busquedaDebounced = useDebounce(busqueda, 500);

  // Efecto para scroll al inicio al cargar
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Sabor: Productos';
  }, []);

  // Aplicación de Filtros
  const aplicarFiltros = useCallback(
    nuevosFiltros => {
      // Si no hay categoría, podemos filtrar localmente para mayor velocidad si ya tenemos productos
      if (!nuevosFiltros.categoria && state.productos.length > 0) {
        aplicarFiltrosLocales(nuevosFiltros);
      } else {
        getProductosFiltrados(nuevosFiltros);
      }
    },
    [aplicarFiltrosLocales, getProductosFiltrados, state.productos.length]
  );

  useEffect(() => {
    const filtros = {
      categoria: categoriaSeleccionada,
      busqueda: busquedaDebounced,
      orden,
    };
    aplicarFiltros(filtros);
  }, [categoriaSeleccionada, busquedaDebounced, orden, aplicarFiltros]);

  // Handlers
  const handleCategoriaChange = useCallback(e => setCategoriaSeleccionada(e.target.value), []);
  const handleOrdenChange = useCallback(e => setOrden(e.target.value), []);
  const handleBusquedaChange = useCallback(e => setBusqueda(e.target.value), []);

  if (state.loading && state.productosFiltrados.length === 0) return <LoadingScreen />;

  return (
    <div className="productos-page">
      <Header />

      <main className="main" style={{ paddingTop: '100px', minHeight: '80vh' }}>
        <div
          className="container"
          style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}
        >
          <h1 style={{ textAlign: 'center', marginBottom: '40px', color: 'var(--text-color)' }}>
            {t('nuestro_menu', 'Nuestro Menú')}
          </h1>

          <BarraFiltros
            busqueda={busqueda}
            categoriaSeleccionada={categoriaSeleccionada}
            categorias={categorias}
            errorCategorias={errorCategorias}
            handleBusquedaChange={handleBusquedaChange}
            handleCategoriaChange={handleCategoriaChange}
            handleOrdenChange={handleOrdenChange}
            loadingCategorias={loadingCategorias}
            orden={orden}
            t={t}
          />

          {state.error && (
            <ErrorDisplay message={t('error_cargar_productos', { error: state.error })} />
          )}

          <GrillaProductos
            loading={state.loading}
            productos={state.productos}
            productosFiltrados={state.productosFiltrados}
            t={t}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Productos;
