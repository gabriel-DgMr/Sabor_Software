import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import MenuLateral from '../../dashboard/components/MenuLateralAdministrador';
import { FiRefreshCcw } from 'react-icons/fi';
import { mapearEstado } from '../services/pedidos-service';
import PedidoLista from './PedidoLista';
import '../styles/pedidos.css';

const ESTADOS = ['pendiente', 'en-preparacion', 'completado'];

/**
 * PedidosAdministradorUI - Tablero principal de pedidos para administración.
 */
const PedidosAdministradorUI = ({
  filtroActivo,
  setFiltroActivo,
  pedidosFiltrados,
  cargando,
  authLoading,
  isAuthenticated,
  cambiarEstado,
  refrescarPedidos,
}) => {
  const { t } = useTranslation();

  if (authLoading || cargando) {
    return (
      <div className="tablero">
        <MenuLateral />
        <main className="tablero__principal">
          <div className="cargando">
            <div className="spinner"></div>
            <p>{t('admin.pedidos.sincronizando')}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="tablero">
        <MenuLateral />
        <main className="tablero__principal">
          <div className="notificacion notificacion--error">
            {t('admin.pedidos.acceso_restringido')}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="tablero">
      <MenuLateral />
      <main className="tablero__principal">
        <header className="encabezado-tablero">
          <div className="encabezado-tablero__titulos">
            <h1 className="encabezado-tablero__titulo">{t('admin.pedidos.titulo')}</h1>
          </div>

          <div className="pedidos-controles">
            <div className="usuarios-filtros">
              {['todos', ...ESTADOS].map(estado => (
                <button
                  key={estado}
                  className={`usuarios-filtros__boton ${filtroActivo === estado ? 'usuarios-filtros__boton--activo' : ''}`}
                  onClick={() => setFiltroActivo(estado)}
                >
                  {estado === 'todos' ? t('admin.pedidos.todos') : mapearEstado(estado)}
                </button>
              ))}
            </div>
            <button className="boton boton--secundario" onClick={refrescarPedidos}>
              <FiRefreshCcw /> {t('admin.pedidos.actualizar')}
            </button>
          </div>
        </header>

        <section className="tablero-pedidos">
          <PedidoLista
            cargando={false}
            pedidos={pedidosFiltrados}
            onCambiarEstado={cambiarEstado}
          />
        </section>
      </main>
    </div>
  );
};

PedidosAdministradorUI.propTypes = {
  filtroActivo: PropTypes.string.isRequired,
  setFiltroActivo: PropTypes.func.isRequired,
  pedidosFiltrados: PropTypes.array.isRequired,
  cargando: PropTypes.bool.isRequired,
  authLoading: PropTypes.bool.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  cambiarEstado: PropTypes.func.isRequired,
  refrescarPedidos: PropTypes.func.isRequired,
};

export default PedidosAdministradorUI;
