import React from 'react';
import '../styles/LoadingScreen.css';
import { useTranslation } from 'react-i18next';

const LoadingScreen = () => {
  const { t } = useTranslation();

  return (
    <div className="pantallaDeCarga">
      <div className="cargaSpinner">
        <div className="spinner" />
      </div>
      <p className="textoDeCarga">{t('cargando')}</p>
    </div>
  );
};

export default LoadingScreen; 