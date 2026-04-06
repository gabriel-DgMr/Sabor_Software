import { useState, useEffect, useRef, useCallback } from 'react';

export const useEscanearQR = () => {
  const [error, setError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      setError('Error al acceder a la cámara. Verifica los permisos.');
    }
  }, []);

  const handleReset = useCallback(() => {
    setError(null);
    setIsCameraActive(false);
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

  return {
    error,
    isCameraActive,
    videoRef,
    canvasRef,
    setIsCameraActive,
    handleReset,
  };
};
