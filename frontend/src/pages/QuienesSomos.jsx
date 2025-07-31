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
    descripcionKey: 'quienes_dev_juan'
  },
  {
    nombre: 'Gabriel Jose Durango',
    rol: 'FullStack Developer',
    foto: '/images/dev-gabriel.jpg',
    descripcionKey: 'quienes_dev_gabriel'
  },
  {
    nombre: 'Miguel Angel Sanchez',
    rol: 'QA - Documentos',
    foto: '/images/dev-miguel.jpg',
    descripcionKey: 'quienes_dev_miguel'
  }
];

export default function QuienesSomos() {
  const { t } = useTranslation();
  const [devSeleccionado, setDevSeleccionado] = useState(null);

  return (
    <>
      <Header />
      <main className="quienes-somos__main">
        <div className="quienes-somos__container">
          <h1 className="quienes-somos__titulo" itemProp="name">{t('quienes_titulo')}</h1>
          <p className="quienes-somos__descripcion" itemProp="description">{t('quienes_descripcion')}</p>
        </div>
        <section aria-label="Desarrolladores de la página" className="quienes-somos__desarrolladores">
          <h2 className="quienes-somos__subtitulo quienes-somos__subtitulo--desarrolladores">{t('quienes_equipo_titulo')}</h2>
          <div className="quienes-somos__burbujas">
            {DESARROLLADORES.map((dev, idx) => (
              <div
                key={dev.nombre}
                itemScope
                aria-pressed={devSeleccionado === idx} className={`quienes-somos__burbuja${devSeleccionado === idx ? ' quienes-somos__burbuja--activa' : ''}`}
                itemType="https://schema.org/Person"
                role="button"
                tabIndex={0}
                onClick={() => setDevSeleccionado(devSeleccionado === idx ? null : idx)}
                onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') setDevSeleccionado(devSeleccionado === idx ? null : idx); }}
              >
                <FaUserCircle aria-hidden="true" className="quienes-somos__icono-burbuja" />
                <span className="quienes-somos__nombre-burbuja" itemProp="name">{dev.nombre}</span>
                <span className="quienes-somos__rol-burbuja" itemProp="jobTitle">{dev.rol}</span>
              </div>
            ))}
          </div>
        </section>
        {devSeleccionado !== null && (
          <div itemScope className="quienes-somos__dev-detalle" itemType="https://schema.org/Person">
            <img
              alt={`Foto de ${DESARROLLADORES[devSeleccionado].nombre}`}
              className="quienes-somos__dev-foto"
              itemProp="image"
              loading="lazy"
              src={DESARROLLADORES[devSeleccionado].foto}
            />
            <div className="quienes-somos__dev-info">
              <h3 className="quienes-somos__dev-nombre" itemProp="name">{DESARROLLADORES[devSeleccionado].nombre}</h3>
              <span className="quienes-somos__dev-rol" itemProp="jobTitle">{DESARROLLADORES[devSeleccionado].rol}</span>
              <p className="quienes-somos__dev-descripcion" itemProp="description">{t(DESARROLLADORES[devSeleccionado].descripcionKey)}</p>
            </div>
          </div>
        )}
        <div className="quienes-somos__container">
        <h2 className="quienes-somos__subtitulo">{t('quienes_mision_titulo')}</h2>
          <p className="quienes-somos__texto">{t('quienes_mision')}</p>
          <h2 className="quienes-somos__subtitulo">{t('quienes_vision_titulo')}</h2>
          <p className="quienes-somos__texto">{t('quienes_vision')}</p>
          <h2 className="quienes-somos__subtitulo">{t('quienes_valores_titulo')}</h2>
          <ul className="quienes-somos__valores-lista">
            <li className="quienes-somos__valor">{t('quienes_valor_1')}</li>
            <li className="quienes-somos__valor">{t('quienes_valor_2')}</li>
            <li className="quienes-somos__valor">{t('quienes_valor_3')}</li>
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
} 