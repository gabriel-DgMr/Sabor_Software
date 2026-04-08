import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoCalendarOutline,
  IoChevronDownOutline,
} from 'react-icons/io5';
import '../styles/calendario.css';

/**
 * Calendario - Componente de selección de fecha premium.
 * BEM: .calendario, .calendario__cabecera, .calendario__rejilla, .calendario__dia
 */
const Calendario = ({ selectedDate, onDateSelect, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarioRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = event => {
      if (calendarioRef.current && !calendarioRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const daysOfWeek = [
    t('calendario.dom'),
    t('calendario.lun'),
    t('calendario.mar'),
    t('calendario.mie'),
    t('calendario.jue'),
    t('calendario.vie'),
    t('calendario.sab'),
  ];

  const months = [
    t('calendario.enero'),
    t('calendario.febrero'),
    t('calendario.marzo'),
    t('calendario.abril'),
    t('calendario.mayo'),
    t('calendario.junio'),
    t('calendario.julio'),
    t('calendario.agosto'),
    t('calendario.septiembre'),
    t('calendario.octubre'),
    t('calendario.noviembre'),
    t('calendario.diciembre'),
  ];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isToday = day => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = day => {
    if (!selectedDate) return false;
    const date = new Date(selectedDate);
    const selected = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

    return (
      day === selected.getDate() &&
      currentMonth.getMonth() === selected.getMonth() &&
      currentMonth.getFullYear() === selected.getFullYear()
    );
  };

  const isPast = day => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return checkDate < today;
  };

  const renderDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="calendario__dia calendario__dia--vacio"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const paste = isPast(day);
      const today = isToday(day);
      const selected = isSelected(day);

      cells.push(
        <button
          key={day}
          type="button"
          disabled={paste}
          className={`calendario__dia ${today ? 'calendario__dia--hoy' : ''} ${
            selected ? 'calendario__dia--seleccionado' : ''
          } ${paste ? 'calendario__dia--deshabilitado' : ''}`}
          onClick={() => {
            const newDate = new Date(year, month, day);
            const offset = newDate.getTimezoneOffset();
            const adjustedDate = new Date(newDate.getTime() - offset * 60 * 1000);
            onDateSelect(adjustedDate.toISOString().split('T')[0]);
            setIsOpen(false);
          }}
        >
          {day}
        </button>
      );
    }

    return cells;
  };

  return (
    <div className="calendario-wrapper" ref={calendarioRef}>
      <button
        type="button"
        className={`calendario-activador ${isOpen ? 'calendario-activador--abierto' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="calendario-activador__info">
          <IoCalendarOutline className="calendario-activador__icono" />
          <span className="calendario-activador__texto">
            {selectedDate || t('calendario.seleccionar_fecha')}
          </span>
        </div>
        <IoChevronDownOutline className="calendario-activador__cheuron" />
      </button>

      {isOpen && (
        <div className="calendario">
          <div className="calendario__cabecera">
            <h3 className="calendario__mes-actual">
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <div className="calendario__controles">
              <button
                type="button"
                className="calendario__boton-nav"
                onClick={handlePrevMonth}
                disabled={
                  currentMonth.getMonth() === new Date().getMonth() &&
                  currentMonth.getFullYear() === new Date().getFullYear()
                }
              >
                <IoChevronBackOutline />
              </button>
              <button type="button" className="calendario__boton-nav" onClick={handleNextMonth}>
                <IoChevronForwardOutline />
              </button>
            </div>
          </div>

          <div className="calendario__rejilla">
            {daysOfWeek.map((day, idx) => (
              <div key={idx} className="calendario__dia-semana">
                {day}
              </div>
            ))}
            {renderDays()}
          </div>

          <div className="calendario__footer">
            <button
              type="button"
              className="calendario__hoy-btn"
              onClick={() => {
                const today = new Date();
                setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                onDateSelect(today.toISOString().split('T')[0]);
                setIsOpen(false);
              }}
            >
              {t('calendario.ir_a_hoy')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

Calendario.propTypes = {
  selectedDate: PropTypes.string,
  onDateSelect: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default Calendario;
