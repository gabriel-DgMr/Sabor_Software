import React, { useState } from 'react';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import { FiPower } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';

const MenuLateral = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const opcionesGenerales = [
    { nombre: 'Inicio', ruta: '/HomeEmpleados' },
    { nombre: 'Productos', ruta: '/empleado/productos' },
    { nombre: 'Reservaciones', ruta: '/empleado/reservaciones' },
    { nombre: 'Pedidos', ruta: '/empleado/pedidos' },
    { nombre: 'Domicilios', ruta: '/empleado/domicilios' },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Botón hamburguesa para tablet/móvil */}
      <button
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        className="menu-lateral__hamburguesa"
        onClick={toggleMenu}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <nav
        aria-label="Menú lateral de navegación"
        className={`menu-lateral ${isOpen ? 'menu-lateral--abierto' : ''}`}
      >
        <img alt="Logo Sabor" className="menu-lateral__logo" src="/images/logo_sabor.png" />

        <hr className="menu-lateral__separador" />
        <div className="menu-lateral__contenedor-cliente">
          <button aria-label="Cerrar sesión" className="menu-lateral__cliente">
            <FaUserCircle size={32} />
            <span className="menu-lateral__cliente-nombre">{user?.nombre_usuario}</span>
          </button>

          <button
            className="menu-lateral-cerrar"
            onClick={() => {
              logout();
              closeMenu();
            }}
          >
            <FiPower size={30} />
          </button>
        </div>
        <hr className="menu-lateral__separador" />

        {/* Opciones generales */}
        <section className="menu-lateral__seccion">
          <ul className="menu-lateral__lista">
            {opcionesGenerales.map(({ nombre, ruta }) => (
              <li key={ruta} className="menu-lateral__item">
                <button
                  aria-current={location.pathname === ruta ? 'page' : undefined}
                  className={`menu-lateral__link ${
                    location.pathname === ruta || (nombre === 'Panel de control' && enPanel)
                      ? 'menu-lateral__link--activo'
                      : ''
                  }`}
                  onClick={() => {
                    navigate(ruta);
                    closeMenu();
                  }}
                >
                  {nombre}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </nav>
    </>
  );
};

export default MenuLateral;
