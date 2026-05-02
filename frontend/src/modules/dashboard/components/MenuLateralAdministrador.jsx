import React, { useState } from 'react';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import { FiPower } from 'react-icons/fi';
import ReactCountryFlag from 'react-country-flag';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../../app/context/AuthContext.jsx';
import '../styles/menu-lateral.css';

const MenuLateral = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleIdioma = lang => {
    i18n.changeLanguage(lang);
  };

  const opcionesGenerales = [
    { nombre: t('admin.menu.inicio'), ruta: '/HomeAdministrador' },
    { nombre: t('admin.menu.usuarios'), ruta: '/administrador/usuarios' },
    { nombre: t('admin.menu.reservas'), ruta: '/administrador/reservaciones' },
    { nombre: t('admin.menu.productos'), ruta: '/administrador/productos' },
    { nombre: t('admin.menu.pedidos'), ruta: '/administrador/pedidos' },
    { nombre: t('admin.menu.domicilios'), ruta: '/administrador/domicilios' },
    { nombre: t('admin.menu.banners'), ruta: '/administrador/banners' },
    { nombre: t('admin.menu.panel'), ruta: '/administrador/panel' },
  ];

  const opcionesPanel = [
    { nombre: 'Ventas', ruta: '/administrar/panel/ventas' },
    { nombre: 'Usuarios', ruta: '/administrar/panel/usuarios' },
    { nombre: 'Inventario', ruta: '/administrar/panel/inventario' },
  ];

  const enPanel = location.pathname.startsWith('/administrar/panel');

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Botón hamburguesa para tablet/móvil */}
      <button
        aria-label={isOpen ? t('admin.menu.cerrar') : t('admin.menu.abrir')}
        className="menu-lateral__hamburguesa"
        onClick={toggleMenu}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <nav
        aria-label="Menú lateral de navegación"
        className={`menu-lateral ${isOpen ? 'menu-lateral--abierto' : ''}`}
      >
        <img alt="Logo Sabor" className="menu-lateral__logo" src="/images/logo_sabor_blanco.png" />

        <hr className="menu-lateral__separador" />

        <div className="menu-lateral__contenedor-cliente">
          <button aria-label={t('admin.menu.usuarios')} className="menu-lateral__cliente">
            <FaUserCircle size={32} />
            <span className="menu-lateral__cliente-nombre">{user?.nombre_usuario}</span>
          </button>

          <div className="menu-lateral__acciones">
            <div className="menu-lateral__idiomas">
              <button
                className={`menu-lateral__idioma-boton ${i18n.language === 'es' ? 'menu-lateral__idioma-boton--activo' : ''}`}
                onClick={() => handleIdioma('es')}
                title="Español"
              >
                <ReactCountryFlag svg countryCode="ES" />
              </button>
              <button
                className={`menu-lateral__idioma-boton ${i18n.language === 'en' ? 'menu-lateral__idioma-boton--activo' : ''}`}
                onClick={() => handleIdioma('en')}
                title="English"
              >
                <ReactCountryFlag svg countryCode="US" />
              </button>
            </div>

            <button
              className="menu-lateral-cerrar"
              onClick={() => {
                logout();
                closeMenu();
              }}
              title={t('admin.menu.logout', 'Cerrar sesión')}
            >
              <FiPower size={30} />
            </button>
          </div>
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
                    location.pathname === ruta || (nombre === t('admin.menu.panel') && enPanel)
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

        {/* Opciones del panel (solo dentro de /panel/administrar) */}
        {enPanel && (
          <section className="menu-lateral__seccion">
            <ul className="menu-lateral__lista">
              {opcionesPanel.map(({ nombre, ruta }) => (
                <li key={ruta} className="menu-lateral__item">
                  <button
                    aria-current={location.pathname === ruta ? 'page' : undefined}
                    className={`menu-lateral__link menu-lateral__link--panel ${
                      location.pathname === ruta
                        ? 'menu-lateral__link--activo--panel menu-lateral__link--activo'
                        : ''
                    }`}
                    onClick={() => {
                      navigate(ruta);
                      closeMenu();
                    }}
                  >
                    {t(nombre.toLowerCase().replace(/ /g, '_'), nombre)}
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
