import React, { useState, useEffect, useRef, useCallback } from "react";

import Footer from "../components/Footer";
import Header from "../components/Header";
import QRPedido from "../components/QRPedido";

const EscanearQR = () => {
  const [error, setError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      setError("Error al acceder a la cámara. Verifica los permisos.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const handleReset = useCallback(() => {
    setError(null);
    setIsCameraActive(false); // Changed from setIsScanning(false)
    stopCamera();
    setTimeout(() => {
      startCamera();
    }, 100);
  }, [stopCamera, startCamera]);

  useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

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
          <canvas
            ref={canvasRef}
            className="escanear-qr__canvas"
            style={{ display: 'none' }}
          />
          
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
              <button onClick={handleReset}>
                Reintentar
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default EscanearQR; 