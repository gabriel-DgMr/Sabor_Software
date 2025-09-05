import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FaQrcode, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FaCartShopping } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';
import { FaUtensils, FaSortAmountDownAlt, FaSearch } from 'react-icons/fa';

import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import ProductoCard from '../components/ProductoCard.jsx';
import { useCategorias } from '../context/CategoriaContext';
import { useProductos } from '../context/ProductoContext';
import { useCart } from '../context/useCart.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useAuth } from '../context/AuthContext';
import { GoX } from 'react-icons/go';
import { BiSolidDish } from 'react-icons/bi';

// Componente de error visualmente consistente para Home
const HomeError = ({ message }) => {
  if (!message) return null;
  return (
    <div className="error-global">
      <GoX className="GoX" />
      <span>{message}</span>
    </div>
  );
};

const Home = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();

  // Redirección automática basada en roles
  useEffect(() => {
    if (!loading && isAuthenticated && user && user.nombre_rol) {
      switch (user.nombre_rol) {
        case 'Administrador':
          navigate('/HomeAdministrador');
          break;
        case 'Empleado':
          navigate('/HomeEmpleados');
          break;
        case 'Usuario':
        default:
          // Los usuarios regulares pueden quedarse en Home
          break;
      }
    }
  }, [user, isAuthenticated, loading, navigate]);

  // Obtener productos y categorías ANTES de cualquier uso de state
  const { state, aplicarFiltrosLocales, getProductosFiltrados } = useProductos();
  const { categorias, loading: loadingCategorias, error: errorCategorias } = useCategorias();
  const { cartCount } = useCart();

  // NUEVOS ESTADOS PARA FILTRO Y ORDEN
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [orden, setOrden] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Aplicar debounce a la búsqueda para evitar llamadas innecesarias
  const busquedaDebounced = useDebounce(busqueda, 500);

  // Carrusel de imágenes de productos
  const [indiceCarrusel, setIndiceCarrusel] = useState(0);
  const carruselIntervalo = useRef(null);
  const imagenesCarrusel = useMemo(
    () =>
      state.productos.map(p => ({
        src: `http://localhost:3000/uploads/productos/${p.imagen_producto}`,
        alt: p.nombre_producto,
      })),
    [state.productos]
  );

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 0;
      setIsScrolled(scrolled);
    };
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (imagenesCarrusel.length === 0) return;
    carruselIntervalo.current = setInterval(() => {
      setIndiceCarrusel(prev => (prev + 1) % imagenesCarrusel.length);
    }, 3500);
    return () => clearInterval(carruselIntervalo.current);
  }, [imagenesCarrusel.length]);

  const irASiguiente = () => setIndiceCarrusel(prev => (prev + 1) % imagenesCarrusel.length);
  const irAAnterior = () =>
    setIndiceCarrusel(prev => (prev - 1 + imagenesCarrusel.length) % imagenesCarrusel.length);

  // Función optimizada para aplicar filtros
  const aplicarFiltros = useCallback(
    nuevosFiltros => {
      // Si solo hay filtros de orden y búsqueda, usar filtros locales (más rápido)
      if (!nuevosFiltros.categoria && (nuevosFiltros.busqueda || nuevosFiltros.orden)) {
        aplicarFiltrosLocales(nuevosFiltros);
      } else {
        // Si hay filtro de categoría, hacer llamada al backend
        getProductosFiltrados(nuevosFiltros);
      }
    },
    [aplicarFiltrosLocales, getProductosFiltrados]
  );

  // Efecto optimizado para aplicar filtros
  useEffect(() => {
    const filtros = {
      categoria: categoriaSeleccionada,
      busqueda: busquedaDebounced,
      orden,
    };

    // Solo aplicar filtros si hay productos cargados
    if (state.productos.length > 0) {
      aplicarFiltros(filtros);
    }
  }, [categoriaSeleccionada, busquedaDebounced, orden, state.productos.length, aplicarFiltros]);

  // Memoizar los productos mostrados para evitar re-renders innecesarios
  const productosMostrados = useMemo(() => {
    return state.productosFiltrados || state.productos;
  }, [state.productosFiltrados, state.productos]);

  useEffect(() => {
    document.title = 'Sabor: Home';
  }, []);

  // Handlers optimizados para los filtros
  const handleCategoriaChange = useCallback(e => {
    setCategoriaSeleccionada(e.target.value);
  }, []);

  const handleOrdenChange = useCallback(e => {
    setOrden(e.target.value);
  }, []);

  const handleBusquedaChange = useCallback(e => {
    setBusqueda(e.target.value);
  }, []);

  if (state.loading && state.productos.length === 0) return <LoadingScreen />;
  if (state.error)
    return <HomeError message={t('error_cargar_productos', { error: state.error })} />;

  return (
    <div className="home">
      <Header />
      <Link
        className={`carrito-link ${isMobile ? 'carrito-flotante' : isScrolled ? 'carrito-flotante' : 'carrito-fixed'}`}
        to="/carrito"
      >
        <div className="carrito-icono">
          <FaCartShopping className="carrito" size={30} />
          {cartCount > 0 && (
            <span
              aria-label={`Productos en el carrito: ${cartCount}`}
              className="carrito-burbuja-cantidad"
            >
              {cartCount}
            </span>
          )}
        </div>
      </Link>

      <a href="/reservas" className="btn-reserva">
        <span className="reserva-icono">
          <BiSolidDish />
        </span>
      </a>

      {isMobile && (
        <Link className="burbuja-qr" to="/escanear-qr">
          <div className="carrito-icono">
            <FaQrcode className="qr" size={30} />
          </div>
        </Link>
      )}

      <main className="main">
        {/* Sección de categorías */}
        <section className="seccion seccion--categorias">
          <div className="carrusel-productos">
            {imagenesCarrusel.length > 0 && (
              <>
                <button
                  aria-label="Anterior"
                  className="carrusel-productos__flecha carrusel-productos__flecha--izquierda"
                  type="button"
                  onClick={irAAnterior}
                >
                  <FaChevronLeft aria-hidden="true" className="carrusel-productos__icono-flecha" />
                </button>
                <div className="carrusel-productos__diapositiva">
                  <img
                    alt={imagenesCarrusel[indiceCarrusel].alt}
                    className="carrusel-productos__imagen carrusel-productos__imagen--full"
                    src={imagenesCarrusel[indiceCarrusel].src}
                  />
                </div>
                <button
                  aria-label="Siguiente"
                  className="carrusel-productos__flecha carrusel-productos__flecha--derecha"
                  type="button"
                  onClick={irASiguiente}
                >
                  <FaChevronRight aria-hidden="true" className="carrusel-productos__icono-flecha" />
                </button>
              </>
            )}
          </div>
          <div className="contenedor__categorias">
            <div className="categorias">
              <h1 className="categorias__titulo">{t('que_ordenar')}</h1>
              <div className="categorias__contenedor-cards">
                <div className="categorias__card">
                  <h4 className="categorias__nombre">{t('platos_fuertes')}</h4>
                  <img
                    alt="Platos Fuertes"
                    className="categorias__imagen"
                    src="/images/platosfuertes.png"
                  />
                </div>
                <div className="categorias__card">
                  <h4 className="categorias__nombre">{t('entradas')}</h4>
                  <img alt="Entradas" className="categorias__imagen" src="/images/entradas.png" />
                </div>
                <div className="categorias__card">
                  <h4 className="categorias__nombre">{t('bebidas')}</h4>
                  <img alt="Bebidas" className="categorias__imagen" src="/images/bedidas.png" />
                </div>
              </div>
              <h2 className="categorias__reserva"></h2>
            </div>
          </div>
        </section>

        <section className="seccion seccion--navegacion">
          <div className="barra-navegacion">
            {/* Categorías */}
            <div className="barra-navegacion__opcion">
              <label className="barra-navegacion__label">
                <FaUtensils className="barra-navegacion__icon" />
                {t('tipo_plato')}
              </label>
              <select
                className="barra-navegacion__input"
                disabled={loadingCategorias || !!errorCategorias}
                value={categoriaSeleccionada}
                onChange={handleCategoriaChange}
              >
                <option value="seleccionar__cat">{t('seleccionar__categoria')}</option>
                {categorias &&
                  categorias.map(cat => (
                    <option key={cat.id_categoria} value={cat.nombre_categoria}>
                      {cat.nombre_categoria}
                    </option>
                  ))}
              </select>
            </div>

            {/* Filtros */}
            <div className="barra-navegacion__opcion">
              <label className="barra-navegacion__label">
                <FaSortAmountDownAlt className="barra-navegacion__icon" />
                {t('filtrar')}
              </label>
              <select
                className="barra-navegacion__input"
                value={orden}
                onChange={handleOrdenChange}
              >
                <option value="">{t('ordenar_por')}</option>
                <option value="precio_asc">{t('precio_menor_mayor')}</option>
                <option value="precio_desc">{t('precio_mayor_menor')}</option>
                <option value="calificacion">{t('calificacion')}</option>
                <option value="ventas">{t('mas_vendidos')}</option>
              </select>
            </div>

            {/* Buscador */}
            <div className="barra-navegacion__buscador">
              <FaSearch className="barra-navegacion__icon" />
              <input
                className="barra-navegacion__input barra-navegacion__input--buscador"
                placeholder={t('buscar')}
                type="text"
                value={busqueda}
                onChange={handleBusquedaChange}
              />
            </div>
          </div>
        </section>

        {/* Sección de productos */}
        <section className="seccion seccion--productos">
          <div className="productos">
            {state.loading && state.productos.length > 0 ? (
              <div className="productos__loading">
                <div className="loading-spinner" />
                <p>{t('aplicando_filtros')}</p>
              </div>
            ) : productosMostrados.length === 0 ? (
              <div className="productos__mensaje-no-encontrado">{t('no_encontrado')}</div>
            ) : (
              productosMostrados.map(producto => (
                <ProductoCard key={producto.id_producto} producto={producto} />
              ))
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
