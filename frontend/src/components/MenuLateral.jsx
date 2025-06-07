import React, { useState } from 'react';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';

const MenuLateral = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const opcionesGenerales = [
    { nombre: 'Reservaciones', ruta: '/administrar/reservaciones' },
    { nombre: 'Productos',    ruta: '/administrar/productos' },
    { nombre: 'Pedidos',      ruta: '/administrar/pedidos' },
    { nombre: 'Panel de control', ruta: '/administrar/panel' },
  ];

  const opcionesPanel = [
    { nombre: 'Ventas',       ruta: '/administrar/panel/ventas' },
    { nombre: 'Clientes',     ruta: '/administrar/panel/clientes' },
    { nombre: 'Trabajadores', ruta: '/administrar/panel/trabajadores' },
    { nombre: 'Inventario',   ruta: '/administrar/panel/inventario' },
  ];

  const enPanel = location.pathname.startsWith('/administrar/panel');

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu  = () => setIsOpen(false);

  return (
    <>
      {/* Botón hamburguesa para tablet/móvil */}
      <button
        className="menu-lateral__hamburguesa"
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        onClick={toggleMenu}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <nav
        className={`menu-lateral ${isOpen ? 'menu-lateral--abierto' : ''}`}
        aria-label="Menú lateral de navegación"
      >
        <img
          src="/images/logo_sabor.png"
          alt="Logo Sabor"
          className="menu-lateral__logo"
        />

        <hr className="menu-lateral__separador" />

        <button
          className="menu-lateral__usuario"
          onClick={() => { logout(); closeMenu(); }}
          aria-label="Cerrar sesión"
        >
          <FaUserCircle size={32} />
          <span className="menu-lateral__usuario-nombre">
            {user?.nombre_cliente || 'Invitado'}
          </span>
        </button>

        <hr className="menu-lateral__separador" />

        {/* Opciones generales */}
        <section className="menu-lateral__seccion">
          <h2 className="menu-lateral__titulo">Inicio</h2>
          <ul className="menu-lateral__lista">
            {opcionesGenerales.map(({ nombre, ruta }) => (
              <li key={ruta} className="menu-lateral__item">
                <button
                  className={`menu-lateral__link ${
                    (location.pathname === ruta || (nombre === 'Panel de control' && enPanel)) ? 'menu-lateral__link--activo' : ''
                  }`}
                  onClick={() => { navigate(ruta); closeMenu(); }}
                  aria-current={location.pathname === ruta ? 'page' : undefined}
                >
                  {nombre}
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Opciones del panel (solo dentro de /panel/administrar) */}
        {enPanel && (
          <section className="menu-lateral__seccion">
            <ul className="menu-lateral__lista">
              {opcionesPanel.map(({ nombre, ruta }) => (
                <li key={ruta} className="menu-lateral__item">
                  <button
                    className={`menu-lateral__link menu-lateral__link--panel ${
                      location.pathname === ruta ? 'menu-lateral__link--activo--panel menu-lateral__link--activo' : ''
                    }`}
                    onClick={() => { navigate(ruta); closeMenu(); }}
                    aria-current={location.pathname === ruta ? 'page' : undefined}
                  >
                    {nombre}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </nav>
    </>
  );
};

export default MenuLateral;
