import '../styles/shared.css';
import { useTranslation } from 'react-i18next';

const LoadingScreen = () => {
  const { t } = useTranslation();

  return (
    <div className="cargador-pantalla">
      <div className="cargador-pantalla__contenedor">
        <div className="logo-sabor logo-sabor--loading">
          <span className="logo-sabor__texto">SABOR</span>
        </div>
        <div className="lineas-velocidad-loader">
          <div className="linea-velocidad"></div>
          <div className="linea-velocidad"></div>
          <div className="linea-velocidad"></div>
          <div className="linea-velocidad"></div>
        </div>
        <div
          className="cargador-pantalla__titulo"
          style={{ marginTop: '2rem', fontSize: '1.4rem' }}
        >
          {t('loading-title', 'Preparando tu experiencia...')}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
