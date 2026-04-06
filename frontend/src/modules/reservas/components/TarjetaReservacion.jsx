import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  GoCalendar,
  GoClock,
  GoPeople,
  GoDeviceMobile,
  GoCheck,
  GoX,
  GoPencil,
  GoTrash,
} from 'react-icons/go';

/**
 * TarjetaReservacion - Tarjeta individual para mostrar detalles de una reserva con diseño Premium.
 * BEM: .tarjeta-reserva
 */
const TarjetaReservacion = ({
  reserva,
  onActualizarEstado,
  onEditar,
  onEliminar,
  loadingStates = {},
  formatearFecha,
}) => {
  const { t } = useTranslation();
  const {
    id_reservacion,
    nombre,
    estado,
    fecha_reservacion,
    hora_reservacion,
    numero_personas,
    telefono,
  } = reserva;

  const claseEstadoBadge = estado ? `tarjeta-reserva__badge--${estado.toLowerCase()}` : '';

  return (
    <article className="tarjeta-reserva">
      <div className="tarjeta-reserva__cabecera">
        <div className="tarjeta-reserva__cliente">
          <span className="tarjeta-reserva__nombre">{nombre}</span>
          <span className="tarjeta-reserva__id">Ref: #{id_reservacion}</span>
        </div>
        <span className={`tarjeta-reserva__badge ${claseEstadoBadge}`}>
          {estado === 'PENDIENTE' && '⏳ '}
          {estado === 'COMPLETADO' && '✅ '}
          {estado === 'CANCELADO' && '❌ '}
          {t(`reservas.estados.${estado?.toLowerCase()}`, estado)}
        </span>
      </div>

      <div className="tarjeta-reserva__detalles">
        <div className="detalle-pildora">
          <GoCalendar />
          <span>{formatearFecha ? formatearFecha(fecha_reservacion) : fecha_reservacion}</span>
        </div>
        <div className="detalle-pildora">
          <GoClock />
          <span>{hora_reservacion}</span>
        </div>
        <div className="detalle-pildora">
          <GoPeople />
          <span>
            {numero_personas} {t('reservas.tarjeta.personas_abreviado')}
          </span>
        </div>
        <div className="detalle-pildora">
          <GoDeviceMobile />
          <span>{telefono}</span>
        </div>
      </div>

      <div className="tarjeta-reserva__acciones">
        {estado === 'PENDIENTE' && (
          <button
            className="tarjeta-reserva__boton tarjeta-reserva__boton--exito"
            onClick={() => onActualizarEstado(id_reservacion, 'COMPLETADO')}
            disabled={loadingStates.confirm?.[id_reservacion]}
            title={t('reservas.tarjeta.confirmar')}
          >
            {loadingStates.confirm?.[id_reservacion] ? '...' : <GoCheck />}
          </button>
        )}
        {estado !== 'CANCELADO' && (
          <button
            className="tarjeta-reserva__boton tarjeta-reserva__boton--peligro"
            onClick={() => onActualizarEstado(id_reservacion, 'CANCELADO')}
            disabled={loadingStates.cancel?.[id_reservacion]}
            title={t('reservas.tarjeta.cancelar')}
          >
            {loadingStates.cancel?.[id_reservacion] ? '...' : <GoX />}
          </button>
        )}
        <button
          className="tarjeta-reserva__boton tarjeta-reserva__boton--primario"
          onClick={() => onEditar(reserva)}
          title={t('reservas.tarjeta.editar')}
        >
          <GoPencil />
        </button>
        <button
          className="tarjeta-reserva__boton tarjeta-reserva__boton--peligro"
          onClick={() => onEliminar(id_reservacion)}
          disabled={loadingStates.delete?.[id_reservacion]}
          title={t('reservas.tarjeta.eliminar')}
        >
          {loadingStates.delete?.[id_reservacion] ? '...' : <GoTrash />}
        </button>
      </div>
    </article>
  );
};

TarjetaReservacion.propTypes = {
  reserva: PropTypes.object.isRequired,
  onActualizarEstado: PropTypes.func.isRequired,
  onEditar: PropTypes.func.isRequired,
  onEliminar: PropTypes.func.isRequired,
  loadingStates: PropTypes.object,
  formatearFecha: PropTypes.func,
};

export default TarjetaReservacion;
