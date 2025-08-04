import React from 'react';
import '../styles/LoadingScreen.css';
import { useTranslation } from 'react-i18next';

const LoadingScreen = () => {
  const { t } = useTranslation();

  return (
    <div class="loading-screen-c">
      <div class="loading-container-c">
        <div class="loading-logo-c">SABOR</div>
        <div class="orbit-spinner">
          <div class="orbit-circle"></div>
          <div class="orbit-circle"></div>
          <div class="orbit-circle"></div>
        </div>
        <div class="loading-title-c">Cargando, por favor espere</div>
      </div>
    </div>
  );
};

export default LoadingScreen;
