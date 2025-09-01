import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

export default function SobreNosotros() {
  const { t } = useTranslation();
  const refsAnim = useRef([]);

  useEffect(() => {
    const elementos = refsAnim.current;
    if (!('IntersectionObserver' in window)) {
      elementos.forEach(el => el && el.classList.add('animacion-revelar--visible'));
      return;
    }
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animacion-revelar--visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    elementos.forEach(el => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const setRef = el => {
    if (el && !refsAnim.current.includes(el)) refsAnim.current.push(el);
  };

  return (
    <>
      <Helmet>
        <title>Sobre Nosotros - Sabor | Restaurante Colombiano</title>
        <meta
          name="description"
          content="Conoce la historia de Sabor, nuestro equipo y nuestra pasión por la gastronomía colombiana."
        />
        <meta
          name="keywords"
          content="restaurante colombiano, gastronomía colombiana, equipo, historia, misión, visión, valores"
        />
        <meta property="og:title" content="Sobre Nosotros - Sabor" />
        <meta
          property="og:description"
          content="Descubre la historia, misión y visión del restaurante Sabor."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/sobre-nosotros" />
      </Helmet>

      <Header />

      <main className="sobre-nosotros" role="main">
        {/* HERO */}
        <section className="sobre-nosotros__hero" aria-label={t('sobre_titulo')}>
          <div className="sobre-nosotros__hero-capa" />
          <div className="sobre-nosotros__hero-contenido animacion-revelar" ref={setRef}>
            <h1 className="sobre-nosotros__titulo-principal">
              {t('sobre_titulo')}
              <span className="sobre-nosotros__titulo-resalte"> Sabor</span>
            </h1>
            <p className="sobre-nosotros__subtitulo-hero">
              {t('sobre_subtitulo', 'Descubre nuestra pasión por la gastronomía colombiana')}
            </p>
          </div>
          <div
            className="sobre-nosotros__hero-decor sobre-nosotros__hero-decor--uno"
            aria-hidden="true"
          />
          <div
            className="sobre-nosotros__hero-decor sobre-nosotros__hero-decor--dos"
            aria-hidden="true"
          />
        </section>

        {/* CONTENIDO PRINCIPAL */}
        <div className="sobre-nosotros__contenedor">
          <div className="sobre-nosotros__grid">
            {/* Historia */}
            <article
              className="sobre-nosotros__tarjeta animacion-revelar"
              ref={setRef}
              aria-labelledby="historia-titulo"
            >
              <header className="sobre-nosotros__tarjeta-cabecera">
                <span className="sobre-nosotros__icono" aria-hidden="true">
                  📜
                </span>
                <h2 id="historia-titulo" className="sobre-nosotros__tarjeta-titulo">
                  {t('sobre_historia_titulo')}
                </h2>
              </header>
              <p className="sobre-nosotros__texto">{t('sobre_historia')}</p>
            </article>

            {/* Equipo */}
            <article
              className="animacion-revelar--visible sobre-nosotros__tarjeta animacion-revelar"
              ref={setRef}
              aria-labelledby="equipo-titulo"
            >
              <header className="sobre-nosotros__tarjeta-cabecera">
                <span className="sobre-nosotros__icono" aria-hidden="true">
                  👥
                </span>
                <h2 id="equipo-titulo" className="sobre-nosotros__tarjeta-titulo">
                  {t('sobre_equipo_titulo')}
                </h2>
              </header>
              <p className="sobre-nosotros__texto">{t('sobre_equipo')}</p>
            </article>

            {/* Contacto */}
            <article
              className="sobre-nosotros__tarjeta animacion-revelar"
              ref={setRef}
              aria-labelledby="contacto-titulo"
            >
              <header className="sobre-nosotros__tarjeta-cabecera">
                <span className="sobre-nosotros__icono" aria-hidden="true">
                  ☎️
                </span>
                <h2 id="contacto-titulo" className="sobre-nosotros__tarjeta-titulo">
                  {t('sobre_contacto_titulo')}
                </h2>
              </header>
              <p className="sobre-nosotros__texto">{t('sobre_contacto')}</p>
              <ul className="sobre-nosotros__lista-contacto">
                <li className="sobre-nosotros__item-contacto">
                  <span className="sobre-nosotros__etiqueta">Email:</span>
                  <a
                    href="mailto:sabor.software@sabor.com"
                    className="sobre-nosotros__enlace"
                    rel="noopener noreferrer"
                  >
                    sabor.software@sabor.com
                  </a>
                </li>
                <li className="sobre-nosotros__item-contacto">
                  <span className="sobre-nosotros__etiqueta">Tel:</span>
                  <a href="tel:+573044541620" className="sobre-nosotros__enlace">
                    +57 304 454 1620
                  </a>
                </li>
              </ul>
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
