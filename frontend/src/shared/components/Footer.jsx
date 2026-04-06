import React from 'react';
import { useTranslation } from 'react-i18next';
import { AiFillInstagram } from 'react-icons/ai';
import { BsTwitterX } from 'react-icons/bs';
import { FaFacebook, FaTiktok, FaYoutube } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import '../styles/shared.css';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="pie-pagina">
      <div className="pie-pagina__contenedor">
        <div className="pie-pagina__info">
          <div className="pie-pagina__marca">
            <h2 className="pie-pagina__logo">SABOR</h2>
            <p className="pie-pagina__eslogan">
              {t('eslogan_footer', 'Sabor auténtico en cada bocado.')}
            </p>
          </div>

          <div className="pie-pagina__redes">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="pie-pagina__enlace-red"
              aria-label="Facebook"
            >
              <FaFacebook />
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="pie-pagina__enlace-red"
              aria-label="TikTok"
            >
              <FaTiktok />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="pie-pagina__enlace-red"
              aria-label="Instagram"
            >
              <AiFillInstagram />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="pie-pagina__enlace-red"
              aria-label="Twitter"
            >
              <BsTwitterX />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="pie-pagina__enlace-red"
              aria-label="YouTube"
            >
              <FaYoutube />
            </a>
          </div>
        </div>

        <div className="pie-pagina__navegacion">
          <div className="pie-pagina__columna">
            <h3 className="pie-pagina__titulo-columna">{t('empresa', 'Empresa')}</h3>
            <Link className="pie-pagina__enlace" to="/quienes-somos">
              {t('quienes_somos')}
            </Link>
            <Link className="pie-pagina__enlace" to="/sobre-nosotros">
              {t('descubrenos')}
            </Link>
          </div>

          <div className="pie-pagina__columna">
            <h3 className="pie-pagina__titulo-columna">{t('soporte', 'Soporte')}</h3>
            <Link className="pie-pagina__enlace" to="/contacto">
              {t('contactanos')}
            </Link>
            <Link className="pie-pagina__enlace" to="/ayuda">
              {t('centro_ayuda', 'Centro de Ayuda')}
            </Link>
          </div>
        </div>
      </div>

      <div className="pie-pagina__inferior">
        <div className="pie-pagina__linea"></div>
        <div className="pie-pagina__copyright">
          <p>
            &copy; {new Date().getFullYear()} SABOR.{' '}
            {t('todos_derechos', 'Todos los derechos reservados.')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
