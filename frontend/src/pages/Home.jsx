import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaQrcode } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";
import { Link } from 'react-router-dom';
import '../index.css';

import MensajeExito from '../components/DialogoExito.jsx'
import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useCategorias } from '../context/CategoriaContext';
import { useProductos } from '../context/ProductoContext';
import { FormatPriceCOP } from '../utils/format.js';

const Home = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  // Estados para el diálogo de éxito
  const [exitoOpen, setExitoOpen] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  const { t } = useTranslation();

  // NUEVOS ESTADOS PARA FILTRO Y ORDEN
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [orden, setOrden] = useState('');
  const [busqueda, setBusqueda] = useState('');

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

  const { addItemToCart } = useCart();
  const { state, getProductosFiltrados } = useProductos();
  const { categorias, loading: loadingCategorias, error: errorCategorias } = useCategorias();
  const [productoExpandido, setProductoExpandido] = useState(null);

  // Obtener productos desde el backend cada vez que cambian los filtros
  useEffect(() => {
    getProductosFiltrados({
      categoria: categoriaSeleccionada,
      busqueda,
      orden
    });
  }, [categoriaSeleccionada, busqueda, orden]);

  const productosMostrados = state.productos;

  useEffect(() => {
    document.title = 'Sabor: Home';
  }, []);

  // Función para agregar producto y mostrar mensaje de éxito
  const handleAgregar = (producto) => {
    addItemToCart({
      nombre: producto.nombre_producto,
      precio: producto.precio_producto
    });
    setMensajeExito(t('producto_agregado', { nombre: producto.nombre_producto }));
    setExitoOpen(true);
  };

  if (state.loading) return <LoadingScreen />;
  if (state.error) return <div>{t('error_cargar_productos', { error: state.error })}</div>;

  return (
    <div>
      <Header />
      <Link
        className={`carrito-link ${isMobile ? 'carrito-flotante' : (isScrolled ? 'carrito-flotante' : 'carrito-fixed')}`}
        to="/carrito"
      >
        <div className="carrito-icono">
          <FaCartShopping className='carrito' size={30}/>
        </div>
      </Link>

      {isMobile && (
        <Link className="burbuja-qr" to="/escanear-qr">
          <div className="carrito-icono">
            <FaQrcode className='qr' size={30}/>
          </div>
        </Link>
      )}

      <main className="pagina__contenido">
        {/* Sección de categorías */}
        <section className="seccion seccion--categorias">
          <img
            alt="Fondo hamburguesa"
            className="seccion--categorias__imagen"
            src="/images/Hamburguesa-fondo.jpeg"
          />
          <div className="contenedor__categorias">
            <div className="categorias">
              <h1 className="categorias__titulo">{t('que_ordenar')}</h1>
              <div className="categorias__contenedor-cards">
                <div className="categorias__card">
                  <h4 className="categorias__nombre">{t('platos_fuertes')}</h4>
                  <img
                    alt="Platos Fuertes"
                    className="categorias__imagen"
                    src="https://placehold.co/200x150/png?Text=Plato+Fuerte"
                  />
                </div>
                <div className="categorias__card">
                  <h4 className="categorias__nombre">{t('entradas')}</h4>
                  <img
                    alt="Entradas"
                    className="categorias__imagen"
                    src="https://placehold.co/200x150/png?Text=Entradas"
                  />
                </div>
                <div className="categorias__card">
                  <h4 className="categorias__nombre">{t('bebidas')}</h4>
                  <img
                    alt="Bebidas"
                    className="categorias__imagen"
                    src="https://placehold.co/200x150/png?Text=Bebidas"
                  />
                </div>
              </div>
              <h2 className="categorias__reserva">
                <a href="/reservas">{t('reservar_mesa')}</a>
              </h2>
            </div>
          </div>
        </section>

        {/* Sección de navegación */}
        <section className="seccion seccion--navegacion">
          <div className="barra-navegacion">
            <div className="barra-navegacion__opcion">
              <h3 className="barra-navegacion__titulo">{t('tipo_plato')}</h3>
              <select
                className="barra-navegacion__input"
                value={categoriaSeleccionada}
                onChange={e => setCategoriaSeleccionada(e.target.value)}
                disabled={loadingCategorias || !!errorCategorias}
              >
                <option value="">{'Seleccionar categoría'}</option>
                {categorias && categorias.map(cat => (
                  <option key={cat.id_categoria} value={cat.nombre_categoria}>{cat.nombre_categoria}</option>
                ))}
              </select>
            </div>
            <div className="barra-navegacion__opcion barra-navegacion__opcion--filtro">
              <h3 className="barra-navegacion__titulo">{t('filtrar')}</h3>
              <select
                className="barra-navegacion__input"
                value={orden}
                onChange={e => setOrden(e.target.value)}
              >
                <option value="">{'Ordenar por...'}</option>
                <option value="precio_asc">{'Precio: menor a mayor'}</option>
                <option value="precio_desc">{'Precio: mayor a menor'}</option>
                <option value="calificacion">{'Calificación'}</option>
                <option value="ventas">{'Más vendidos'}</option>
              </select>
            </div>
            <div className="barra-navegacion__buscador">
              <input
                className="barra-navegacion__input"
                placeholder={t('buscar')}
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Sección de productos */}
        <section className="seccion seccion--productos">
          <div className="productos">
            {state.loading ? (
              <LoadingScreen />
            ) : productosMostrados.length === 0 ? (
              <div className="productos__mensaje-no-encontrado">
                No hemos encontrado ese producto.
              </div>
            ) : (
              productosMostrados.map((producto) => (
                <div
                  key={producto.id_producto}
                  className="productos__card-producto"
                  onMouseEnter={() => setProductoExpandido(producto.id_producto)}
                  onMouseLeave={() => setProductoExpandido(null)}
                >
                  <img
                    alt={producto.nombre_producto}
                    className="productos__imagen"
                    src={`http://localhost:3000/uploads/productos/${producto.imagen_producto}`}
                  />
                  <div className="productos__info">
                    <h4 className="productos__nombre">{producto.nombre_producto}</h4>
                    <p
                      className={`productos__descripcion${productoExpandido === producto.id_producto ? ' expandida' : ''}`}
                    >
                      {producto.descripcion_producto}
                    </p>
                    <div className="productos__footer">
                      <p className="productos__precio">{FormatPriceCOP(producto.precio_producto)}</p>
                      <button className="btn-agregarpr" onClick={() => handleAgregar(producto)}>
                        {t('agregar')}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section> 
      </main>
      {/* Diálogo de éxito */}
      <MensajeExito
        open={exitoOpen}
        message={mensajeExito}
        onClose={() => setExitoOpen(false)}
        duration={2000}
      />
      <Footer />
    </div>
  );
};

export default Home;

