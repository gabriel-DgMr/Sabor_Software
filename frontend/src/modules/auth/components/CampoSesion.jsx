import React from 'react';
import PropTypes from 'prop-types';

/**
 * CampoSesion - Campo de entrada estilizado para autenticación.
 * BEM: .campo-autenticacion
 */
const CampoSesion = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled,
  autoComplete,
  name,
}) => {
  return (
    <div className="autenticacion__campo">
      {label && (
        <label className="autenticacion__label" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        id={id}
        name={name || id}
        type={type}
        placeholder={placeholder}
        className={`autenticacion__input ${error ? 'autenticacion__input--error' : ''}`}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete={autoComplete}
      />
      {error && <span className="autenticacion__error">{error}</span>}
    </div>
  );
};

CampoSesion.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  autoComplete: PropTypes.string,
};

export default CampoSesion;
