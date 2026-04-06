import React from 'react';
import PropTypes from 'prop-types';
import MenuLateral from '../../dashboard/components/MenuLateralEmpleado';
import PedidoLista from './PedidoLista';
import '../styles/pedidos.css';

/**
 * PedidosEmpleadosUI - Vista de gestión de pedidos para empleados.
 * Permite filtrar por tipo de servicio (Mesa/Domicilio) y avanzar estados.
 */
const PedidosEmpleadosUI = ({
  pedidosFiltrados,
  cargando,
  filtroActivo,
  setFiltroActivo,
  cambiarEstado,
}) => {
  const FILTROS = [
    { id: 'todos', label: 'Todos' },
    { id: 'mesa', label: 'Mesa' },
    { id: 'domicilio', label: 'Domicilio' },
  ];

  if (cargando) {
    return (
      <div className="tablero">
        <MenuLateral />
        <main className="tablero__principal">
          <div className="cargando">
            <div className="spinner"></div>
            <p>Cargando pedidos pendientes...</p>
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
            <h1 className="encabezado-tablero__titulo">Tablero de Pedidos</h1>
            <p className="encabezado-tablero__subtitulo">
              Gestiona las comandas y entregas activas.
            </p>
          </div>

          <div className="pedidos-controles">
            <div className="usuarios-filtros">
              {FILTROS.map(filtro => (
                <button
                  key={filtro.id}
                  className={`usuarios-filtros__boton ${filtroActivo === filtro.id ? 'usuarios-filtros__boton--activo' : ''}`}
                  onClick={() => setFiltroActivo(filtro.id)}
                >
                  {filtro.label}
                </button>
              ))}
            </div>
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

PedidosEmpleadosUI.propTypes = {
  pedidosFiltrados: PropTypes.array.isRequired,
  cargando: PropTypes.bool.isRequired,
  filtroActivo: PropTypes.string.isRequired,
  setFiltroActivo: PropTypes.func.isRequired,
  cambiarEstado: PropTypes.func.isRequired,
};

export default PedidosEmpleadosUI;
