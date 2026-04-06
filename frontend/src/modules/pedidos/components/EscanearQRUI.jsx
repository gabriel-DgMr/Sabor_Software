import React from 'react';
import PropTypes from 'prop-types';
import Footer from '../../../shared/components/Footer';
import Header from '../../../shared/components/Header';
import QRPedido from '../../../shared/components/QRPedido';

const EscanearQRUI = ({
  error,
  isCameraActive,
  videoRef,
  canvasRef,
  setIsCameraActive,
  handleReset,
}) => {
  return (
    <>
      <Header />
      <main className="escanear-qr__main" role="main">
        <div className="escanear-qr__contenedor-camara">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="escanear-qr__video"
            onLoadedMetadata={() => setIsCameraActive(true)}
          />
          <canvas ref={canvasRef} className="escanear-qr__canvas" style={{ display: 'none' }} />

          <div className="escanear-qr__overlay-info">
            <QRPedido />
          </div>

          {!isCameraActive && !error && (
            <div className="escanear-qr__loading">
              <div className="escanear-qr__loading-spinner" />
              <p>Iniciando cámara...</p>
            </div>
          )}

          {error && (
            <div className="escanear-qr__error">
              <p>{error}</p>
              <button onClick={handleReset}>Reintentar</button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

EscanearQRUI.propTypes = {
  error: PropTypes.string,
  isCameraActive: PropTypes.bool.isRequired,
  videoRef: PropTypes.object.isRequired,
  canvasRef: PropTypes.object.isRequired,
  setIsCameraActive: PropTypes.func.isRequired,
  handleReset: PropTypes.func.isRequired,
};

export default EscanearQRUI;
