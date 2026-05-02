import React, { createContext, useContext, useState, useCallback } from 'react';
import ModalAlerta from '../../shared/components/ModalAlerta';

const AlertContext = createContext(null);

export const AlertProvider = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState({
    abierto: false,
    titulo: '',
    mensaje: '',
    variante: 'info',
  });

  const showAlert = useCallback(({ titulo = 'Alerta', mensaje, variante = 'info' }) => {
    setAlertConfig({
      abierto: true,
      titulo,
      mensaje,
      variante,
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertConfig(prev => ({ ...prev, abierto: false }));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <ModalAlerta
        abierto={alertConfig.abierto}
        titulo={alertConfig.titulo}
        mensaje={alertConfig.mensaje}
        variante={alertConfig.variante}
        alCerrar={closeAlert}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert debe ser usado dentro de un AlertProvider');
  }
  return context;
};
