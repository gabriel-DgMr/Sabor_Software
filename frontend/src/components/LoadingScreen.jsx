import React from 'react';
import '../styles/LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="pantallaDeCarga">
      <div className="cargaSpinner">
        <div className="spinner" />
      </div>
      <p className="textoDeCarga">Cargando</p>
    </div>
  );
};

export default LoadingScreen; 