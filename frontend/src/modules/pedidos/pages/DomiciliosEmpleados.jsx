import React from 'react';
import MenuLateral from '../../dashboard/components/MenuLateralAdministrador';
import { useDomicilios } from '../hooks/useDomicilios';
import DomicilioLista from '../components/DomicilioLista';
import '../styles/pedidos.css';

/**
 * DomiciliosEmpleados - Vista de gestión de domicilios para empleados/admins.
 * Refactorizada para usar hooks modulares y componentes atomizados.
 */
const DomiciliosEmpleados = () => {
  const { pedidos, cargando, actualizando, error, cambiarEstado, marcarRecibido } = useDomicilios();

  return (
    <div className="tablero">
      <MenuLateral />

      <main className="tablero__principal">
        <header className="encabezado-tablero">
          <h1 className="encabezado-tablero__titulo">Gestión de Domicilios</h1>
          <p className="encabezado-tablero__subtitulo">
            Administra los pedidos para entrega a domicilio.
          </p>
        </header>

        {error && <div className="notificacion notificacion--error">{error}</div>}

        <section className="tablero-pedidos">
          {cargando ? (
            <div className="cargando">
              <div className="spinner"></div>
              <p>Sincronizando entregas...</p>
            </div>
          ) : (
            <DomicilioLista
              actualizando={actualizando}
              pedidos={pedidos}
              onCambiarEstado={cambiarEstado}
              onMarcarRecibido={marcarRecibido}
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default DomiciliosEmpleados;
