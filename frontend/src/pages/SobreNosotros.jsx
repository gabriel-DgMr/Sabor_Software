import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';

export default function SobreNosotros() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>Sobre Nosotros - Sabor | Restaurante Colombiano</title>
        <meta
          name="description"
          content="Conoce la historia de Sabor, nuestro equipo y nuestra pasión por la gastronomía colombiana. Descubre cómo nació nuestro restaurante y nuestra misión de brindar experiencias culinarias únicas."
        />
        <meta
          name="keywords"
          content="restaurante colombiano, gastronomía, historia, equipo, sobre nosotros, sabor"
        />
        <meta property="og:title" content="Sobre Nosotros - Sabor" />
        <meta
          property="og:description"
          content="Conoce la historia de Sabor y nuestra pasión por la gastronomía colombiana."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/sobre-nosotros" />
      </Helmet>

      <Header />

      <main className="sobre-nosotros">
        <div className="sobre-nosotros__hero">
          <div className="sobre-nosotros__hero-contenedor">
            <h1 className="sobre-nosotros__titulo-principal">{t('sobre_titulo')}</h1>
            <p className="sobre-nosotros__subtitulo-hero">
              Descubre nuestra pasión por la gastronomía colombiana
            </p>
          </div>
        </div>

        <div className="sobre-nosotros__contenido">
          <div className="sobre-nosotros__seccion">
            <div className="sobre-nosotros__contenedor">
              <article className="sobre-nosotros__historia">
                <header className="sobre-nosotros__encabezado">
                  <h2 className="sobre-nosotros__titulo-seccion">{t('sobre_historia_titulo')}</h2>
                  <div className="sobre-nosotros__decorador"></div>
                </header>
                <div className="sobre-nosotros__texto-contenedor">
                  <p className="sobre-nosotros__parrafo">{t('sobre_historia')}</p>
                </div>
              </article>
            </div>
          </div>

          <div className="sobre-nosotros__seccion sobre-nosotros__seccion--equipo">
            <div className="sobre-nosotros__contenedor--equipo">
              <article className="sobre-nosotros__equipo">
                <header className="sobre-nosotros__encabezado">
                  <h2 className="sobre-nosotros__titulo-seccion">{t('sobre_equipo_titulo')}</h2>
                  <div className="sobre-nosotros__decorador"></div>
                </header>
                <div className="sobre-nosotros__texto-contenedor">
                  <p className="sobre-nosotros__parrafo">{t('sobre_equipo')}</p>
                </div>
              </article>
            </div>
          </div>

          <div className="sobre-nosotros__seccion sobre-nosotros__seccion--contacto">
            <div className="sobre-nosotros__contenedor">
              <article className="sobre-nosotros__contacto">
                <header className="sobre-nosotros__encabezado">
                  <h2 className="sobre-nosotros__titulo-seccion">{t('sobre_contacto_titulo')}</h2>
                  <div className="sobre-nosotros__decorador"></div>
                </header>
                <div className="sobre-nosotros__texto-contenedor">
                  <p className="sobre-nosotros__parrafo">{t('sobre_contacto')}</p>
                  <div className="sobre-nosotros__info-contacto">
                    <div className="sobre-nosotros__item-contacto">
                      <span className="sobre-nosotros__etiqueta">Email:</span>
                      <a href="mailto:sabor.software@sabor.com" className="sobre-nosotros__enlace">
                        sabor.software@sabor.com
                      </a>
                    </div>
                    <div className="sobre-nosotros__item-contacto">
                      <span className="sobre-nosotros__etiqueta">Teléfono:</span>
                      <a href="tel:+573044541620" className="sobre-nosotros__enlace">
                        +57 304 454 1620
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
