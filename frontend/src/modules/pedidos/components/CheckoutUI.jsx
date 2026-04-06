import React from 'react';
import PropTypes from 'prop-types';
import DialogoModal from '../../../shared/components/DialogoExito.jsx';
import Footer from '../../../shared/components/Footer.jsx';
import Header from '../../../shared/components/Header.jsx';

const CheckoutUI = ({ modal, setModal }) => {
  return (
    <div className="pagina-carrito">
      <Header />
      <main className="seccion-checkout">{/* El modal se encarga de mostrar el mensaje */}</main>
      <Footer />
      <DialogoModal {...modal} onClose={() => setModal(m => ({ ...m, open: false }))} />
    </div>
  );
};

CheckoutUI.propTypes = {
  modal: PropTypes.object.isRequired,
  setModal: PropTypes.func.isRequired,
};

export default CheckoutUI;
