import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useMesa } from '../hooks/useMesa';

const QRPedido = ({ children }) => {
  const mesa = useMesa();
  const { t } = useTranslation();

  return (
    <div className="qr-pedido">
      {mesa ? (
        <div className="qr-pedido__info">
          <span className="qr-pedido__mesa">{t('qr.mensajeMesa', { mesa })}</span>
        </div>
      ) : (
        <div className="qr-pedido__advertencia">{t('qr.mensajeSinMesa')}</div>
      )}
      {children}
    </div>
  );
};

QRPedido.propTypes = {
  children: PropTypes.node,
};

export default QRPedido;
