import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaUserCircle } from 'react-icons/fa';

import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';

const DESARROLLADORES = [
  {
    nombre: 'Juan Felipe Velasquez',
    rol: 'FullStack Developer',
    foto: '/images/dev-juan.png',
    descripcionKey: 'quienes_dev_juan',
  },
  {
    nombre: 'Gabriel Jose Durango',
    rol: 'FullStack Developer',
    foto: '/images/dev-gabriel.jpg',
    descripcionKey: 'quienes_dev_gabriel',
  },
  {
    nombre: 'Miguel Angel Sanchez',
    rol: 'FukkStack Developer',
    foto: '/images/dev-miguel.jpg',
    descripcionKey: 'quienes_dev_miguel',
  },
  {
    nombre: 'Juliana Rodriguez',
    rol: 'FullStack Developer',
    foto: '/images/dev-juliana.jpg',
    descripcionKey: 'quienes_dev_juliana',
  },
];

export default function QuienesSomos() {
  const { t } = useTranslation();
  const [devSeleccionado, setDevSeleccionado] = useState(null);

  const toggleSeleccion = idx => {
    setDevSeleccionado(prev => (prev === idx ? null : idx));
  };

  return (
    <>
      <Header />
      <main className="quienes-somos__main" role="main">
        <div className="quienes-somos__encabezado">
          <div className="quienes-somos__container">
            <h1 className="quienes-somos__titulo" itemProp="name">
              {t('quienes_titulo')}
            </h1>
            <p className="quienes-somos__descripcion" itemProp="description">
              {t('quienes_descripcion')}
            </p>
          </div>
        </div>

        <section
          aria-label="Desarrolladores de la página"
          className="quienes-somos__desarrolladores"
        >
          <h2 className="quienes-somos__subtitulo quienes-somos__subtitulo--desarrolladores">
            {t('quienes_equipo_titulo')}
          </h2>

          <div className="quienes-somos__burbujas">
            {DESARROLLADORES.map((dev, idx) => {
              const activa = devSeleccionado === idx;
              return (
                <div
                  key={dev.nombre}
                  itemScope
                  itemType="https://schema.org/Person"
                  className={`quienes-somos__burbuja${activa ? ' quienes-somos__burbuja--activa' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={activa}
                  aria-expanded={activa}
                  aria-controls={`dev-detalle-${idx}`}
                  onClick={() => toggleSeleccion(idx)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleSeleccion(idx);
                    }
                  }}
                >
                  <FaUserCircle aria-hidden="true" className="quienes-somos__icono-burbuja" />
                  <span className="quienes-somos__nombre-burbuja" itemProp="name">
                    {dev.nombre}
                  </span>
                  <span className="quienes-somos__rol-burbuja" itemProp="jobTitle">
                    {dev.rol}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="quienes-somos__detalle">
          {devSeleccionado !== null && (
            <div
              id={`dev-detalle-${devSeleccionado}`}
              itemScope
              itemType="https://schema.org/Person"
              className="quienes-somos__dev-detalle"
            >
              <img
                alt={`Foto de ${DESARROLLADORES[devSeleccionado].nombre}`}
                className="quienes-somos__dev-foto"
                itemProp="image"
                loading="lazy"
                src={DESARROLLADORES[devSeleccionado].foto}
              />
              <div className="quienes-somos__dev-info">
                <h3 className="quienes-somos__dev-nombre" itemProp="name">
                  {DESARROLLADORES[devSeleccionado].nombre}
                </h3>
                <span className="quienes-somos__dev-rol" itemProp="jobTitle">
                  {DESARROLLADORES[devSeleccionado].rol}
                </span>
                <p className="quienes-somos__dev-descripcion" itemProp="description">
                  {t(DESARROLLADORES[devSeleccionado].descripcionKey)}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Tarjetas Misión, Visión, Valores con contenido deslizante */}
        <section className="quienes-somos__informacion" aria-labelledby="info-mvv-titulo">
          <h2 id="info-mvv-titulo" className="visualmente-oculto">
            Misión, Visión y Valores
          </h2>
          <div className="quienes-somos__tarjetas">
            <article
              className=" tarjeta-info--mision tarjeta-info sparkle"
              tabIndex={0}
              aria-describedby="info-mision"
            >
              <h3 className="tarjeta-info__titulo" tabIndex={0} aria-controls="info-mision">
                {t('quienes_mision_titulo')}
              </h3>
              <div
                className="tarjeta-info__contenido tarjeta-info__contenido--derecha"
                id="info-mision"
              >
                <p>{t('quienes_mision')}</p>
              </div>
            </article>

            <article className="tarjeta-info sparkle" tabIndex={0} aria-describedby="info-vision">
              <h3 className="tarjeta-info__titulo" tabIndex={0} aria-controls="info-vision">
                {t('quienes_vision_titulo')}
              </h3>
              <div
                className="tarjeta-info__contenido tarjeta-info__contenido--izquierda"
                id="info-vision"
              >
                <p>{t('quienes_vision')}</p>
              </div>
            </article>

            <article className="tarjeta-info sparkle" tabIndex={0} aria-describedby="info-valores">
              <h3 className="tarjeta-info__titulo" tabIndex={0} aria-controls="info-valores">
                {t('quienes_valores_titulo')}
              </h3>
              <div
                className="tarjeta-info__contenido tarjeta-info__contenido--derecha"
                id="info-valores"
              >
                <ul className="quienes-somos__valores-lista">
                  <li className="quienes-somos__valor">{t('quienes_valor_1')}</li>
                  <li className="quienes-somos__valor">{t('quienes_valor_2')}</li>
                  <li className="quienes-somos__valor">{t('quienes_valor_3')}</li>
                </ul>
              </div>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
