import React from 'react';
import { useTranslation } from 'react-i18next';

import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';

export default function SobreNosotros() {
  const { t } = useTranslation();
  return (
    <>
      <Header />
      <main className="sobre-nosotros__main">
        <div className="sobre-nosotros__container">
          <h1 className="sobre-nosotros__titulo">{t('sobre_titulo')}</h1>
          <div className='sobre-nosotros__historia'>
          <h2 className="sobre-nosotros__subtitulo">{t('sobre_historia_titulo')}</h2>
          <p className="sobre-nosotros__texto">{t('sobre_historia')}</p>
          </div>
          <div className='sobre-nostros__contacto'>
          <h2 className="sobre-nosotros__subtitulo">{t('sobre_contacto_titulo')}</h2>
          <p className="sobre-nosotros__texto">{t('sobre_contacto')}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 