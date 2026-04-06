import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaChevronDown } from 'react-icons/fa';
import '../styles/select-sabor.css';

/**
 * Componente SelectSabor - Un dropdown personalizado moderno con soporte para iconos.
 */
const SelectSabor = ({ value, onChange, options, icon, placeholder, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = optionValue => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div
      className={`seleccionar-sabor ${isOpen ? 'seleccionar-sabor--abierto' : ''} ${className}`}
      ref={dropdownRef}
    >
      <div className="seleccionar-sabor__disparador" onClick={handleToggle}>
        <div className="seleccionar-sabor__info-seleccionada">
          {icon && <div className="seleccionar-sabor__icono-principal">{icon}</div>}
          <span className="seleccionar-sabor__texto-seleccionado">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <FaChevronDown
          className={`seleccionar-sabor__flecha ${isOpen ? 'seleccionar-sabor__flecha--girada' : ''}`}
        />
      </div>

      {isOpen && (
        <div className="seleccionar-sabor__opciones">
          {options.map(opt => (
            <div
              key={opt.value}
              className={`seleccionar-sabor__opcion ${value === opt.value ? 'seleccionar-sabor__opcion--seleccionada' : ''}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.icon && <div className="seleccionar-sabor__opcion-icono">{opt.icon}</div>}
              <span className="seleccionar-sabor__opcion-texto">{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

SelectSabor.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
    })
  ).isRequired,
  icon: PropTypes.node,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

export default SelectSabor;
