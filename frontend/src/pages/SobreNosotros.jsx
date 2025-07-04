import React from 'react';
import { useTranslation } from 'react-i18next';

import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';

export default function SobreNosotros() {
  const { t } = useTranslation();
  return (
    <>
      <Header />
      <main className="sobre-nosotros__main" style={{padding: '2rem 0', minHeight: '60vh'}}>
        <div className="container" style={{maxWidth: 800, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 32}}>
          <h1>{t('sobre_titulo')}</h1>
          <h2>{t('sobre_historia_titulo')}</h2>
          <p>{t('sobre_historia')}</p>
          <h2>{t('sobre_equipo_titulo')}</h2>
          <p>{t('sobre_equipo')}</p>
          <h2>{t('sobre_contacto_titulo')}</h2>
          <p>{t('sobre_contacto')}</p>
        </div>
      </main>
      <Footer />
    </>
  );
} 