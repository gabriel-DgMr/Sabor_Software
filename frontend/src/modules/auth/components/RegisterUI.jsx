import React from 'react';
import PropTypes from 'prop-types';
import RegisterForm from './RegisterForm';
import '../styles/auth.css';

/**
 * RegisterUI - Contenedor de la vista de registro.
 */
const RegisterUI = ({
  formData,
  errors,
  globalError,
  successMessage,
  loading,
  handleRegister,
  handleInputChange,
  t,
}) => {
  return (
    <div className="register-ui">
      <RegisterForm
        formData={formData}
        errors={errors}
        globalError={globalError}
        handleRegister={handleRegister}
        handleInputChange={handleInputChange}
        loading={loading}
        successMessage={successMessage}
        t={t}
      />
    </div>
  );
};

RegisterUI.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  globalError: PropTypes.string,
  successMessage: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  handleRegister: PropTypes.func.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default RegisterUI;
