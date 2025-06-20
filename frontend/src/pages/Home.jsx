import React, { useEffect, useState } from 'react';
import { FaCartShopping } from "react-icons/fa6";
import { Link } from 'react-router-dom';
import '../index.css';

import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useProductos } from '../context/ProductoContext';

import AuthPage from './auth/index.jsx';

const Home = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 0;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { addItemToCart } = useCart();
  const { state } = useProductos();
  const [productoExpandido, setProductoExpandido] = useState(null);

  useEffect(() => {
    document.title = 'Sabor: Home';
  }, []);

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
  };

  if (state.loading) return <LoadingScreen />;
  if (state.error) return <div>Error al cargar productos: {state.error}</div>;

  return (
    <div>
      <Header />
      <Link className={`carrito-link ${isScrolled ? 'carrito-flotante' : 'carrito-fixed'}`} to="/carrito">
        <div className="carrito-icono">
          <FaCartShopping  className='carrito' size={30}/>
        </div>
      </Link>

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
              <h1 className="categorias__titulo">¿Qué vas a ordenar hoy?</h1>
              <div className="categorias__contenedor-cards">
                <div className="categorias__card">
                  <h4 className="categorias__nombre">Platos Fuertes</h4>
                  <img
                    alt="Platos Fuertes"
                    className="categorias__imagen"
                    src="https://placehold.co/200x150/png?Text=Plato+Fuerte"
                  />
                </div>
                <div className="categorias__card">
                  <h4 className="categorias__nombre">Entradas</h4>
                  <img
                    alt="Entradas"
                    className="categorias__imagen"
                    src="https://placehold.co/200x150/png?Text=Entradas"
                  />
                </div>
                <div className="categorias__card">
                  <h4 className="categorias__nombre">Bebidas</h4>
                  <img
                    alt="Bebidas"
                    className="categorias__imagen"
                    src="https://placehold.co/200x150/png?Text=Bebidas"
                  />
                </div>
              </div>
              <h2 className="categorias__reserva">
                <a href="/reservas">¿O quieres reservar una mesa?</a>
              </h2>
            </div>
          </div>
        </section>

        {/* Sección de navegación */}
        <section className="seccion seccion--navegacion">
          <div className="barra-navegacion">
            <div className="barra-navegacion__opcion">
              <h3 className="barra-navegacion__titulo">Promociones</h3>
            </div>
            <div className="barra-navegacion__opcion">
              <h3 className="barra-navegacion__titulo">Tipo de plato</h3>
            </div>
            <div className="barra-navegacion__opcion barra-navegacion__opcion--filtro">
              <h3 className="barra-navegacion__titulo">Filtrar</h3>
            </div>
            <div className="barra-navegacion__buscador">
              <input className="barra-navegacion__input" placeholder="Buscar" type="text" />
            </div>
          </div>
        </section>

        {/* Sección de productos */}
      <section className="seccion seccion--productos">
        <div className="productos">
          {state.productos.map((producto) => (
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
                  <p className="productos__precio">{formatearPrecio(producto.precio_producto)}</p>
                  <button className="btn-agregarpr" onClick={() => addItemToCart({
                    nombre: producto.nombre_producto,
                    precio: producto.precio_producto
                  })}>Agregar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section> 
      </main>
      <Footer />
    </div>
  );
};

export default Home;

