import React from 'react';
import { useTranslation } from 'react-i18next';

import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';

export default function QuienesSomos() {
  const { t } = useTranslation();
  return (
    <>
      <Header />
      <main className="quienes-somos__main">
        <div className="quienes-somos__container">
          <h1>{t('quienes_titulo')}</h1>
          <p>{t('quienes_descripcion')}</p>
          <h2>{t('quienes_mision_titulo')}</h2>
          <p>{t('quienes_mision')}</p>
          <h2>{t('quienes_vision_titulo')}</h2>
          <p>{t('quienes_vision')}</p>
          <h2>{t('quienes_valores_titulo')}</h2>
          <ul>
            <li>{t('quienes_valor_1')}</li>
            <li>{t('quienes_valor_2')}</li>
            <li>{t('quienes_valor_3')}</li>
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
} 