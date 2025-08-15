import React from 'react';
import '../styles/LoadingScreen.css';
import { useTranslation } from 'react-i18next';

const LoadingScreen = () => {
  const { t } = useTranslation();

  return (
    <div className="loading-screen-c">
      <div className="loading-container-c">
        <div className="loading-logo-c">SABOR</div>
        <div className="orbit-spinner">
          <div className="orbit-circle"></div>
          <div className="orbit-circle"></div>
          <div className="orbit-circle"></div>
        </div>
        <div className="loading-title-c">Cargando, por favor espere</div>
      </div>
    </div>
  );
};

export default LoadingScreen;
