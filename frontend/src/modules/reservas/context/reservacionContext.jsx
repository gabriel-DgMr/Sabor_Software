import PropTypes from 'prop-types';
import { createContext, useContext } from 'react';
import { useReservaciones as useReservacionesHook } from '../hooks/useReservaciones.js';

const ReservacionContext = createContext();

export const ReservacionProvider = ({ children }) => {
  const reservacionesData = useReservacionesHook();

  return (
    <ReservacionContext.Provider value={reservacionesData}>{children}</ReservacionContext.Provider>
  );
};

ReservacionProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useReservaciones = () => {
  const context = useContext(ReservacionContext);
  if (!context) {
    throw new Error('useReservaciones debe ser usado dentro de un ReservacionProvider');
  }
  return context;
};
