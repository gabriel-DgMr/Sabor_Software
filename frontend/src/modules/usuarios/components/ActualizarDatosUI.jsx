import React from 'react';
import PropTypes from 'prop-types';
import Header from '../../../shared/components/Header.jsx';
import Footer from '../../../shared/components/Footer.jsx';
import ActualizarPerfilForm from './ActualizarPerfilForm';
import { useTranslation } from 'react-i18next';
import '../styles/usuarios.css';

/**
 * ActualizarDatosUI - Vista de perfil de usuario.
 * Integra el formulario atomizado dentro del layout global.
 */
const ActualizarDatosUI = props => {
  const { t } = useTranslation();

  return (
    <div className="pagina-perfil">
      <Header />
      <main className="tablero">
        <div className="tablero__principal">
          <ActualizarPerfilForm {...props} t={t} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

ActualizarDatosUI.propTypes = {
  nombre: PropTypes.string.isRequired,
  setNombre: PropTypes.func.isRequired,
  correo: PropTypes.string.isRequired,
  setCorreo: PropTypes.func.isRequired,
  telefono: PropTypes.string.isRequired,
  setTelefono: PropTypes.func.isRequired,
  imagenPreview: PropTypes.string,
  mensaje: PropTypes.string,
  errors: PropTypes.object.isRequired,
  globalError: PropTypes.string,
  cargando: PropTypes.bool.isRequired,
  fileInputRef: PropTypes.object.isRequired,
  handleImageChange: PropTypes.func.isRequired,
  removeImage: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};

export default ActualizarDatosUI;
