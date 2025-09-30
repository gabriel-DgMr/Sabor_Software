import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MenuLateral from '../components/MenuLateralAdministrador';

import {
  obtenerPedidos,
  actualizarEstadoPedido,
  mapearEstado,
  obtenerSiguienteEstado,
  mapearEstadoAId,
  marcarPedidoRecibido, // 🔹 Nuevo método en tu service
} from '../services/pedidosService';

import '../styles/empleados.css';

const DomiciliosEmpleados = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState({}); // Para manejar botones individuales

  useEffect(() => {
    const cargarPedidos = async () => {
      if (!isAuthenticated || authLoading) {
        setCargando(false);
        return;
      }

      try {
        const datosPedidos = await obtenerPedidos();
        setPedidos(datosPedidos.filter((p) => p.tipo_servicio === 'domicilio'));
      } catch (err) {
        console.error('Error al cargar pedidos:', err);
      } finally {
        setCargando(false);
      }
    };

    cargarPedidos();
  }, [isAuthenticated, authLoading]);

  const cambiarEstado = async (pedidoId, estadoActual) => {
    try {
      const siguienteEstado = obtenerSiguienteEstado(estadoActual);
      if (!siguienteEstado) return;

      const nuevoEstadoId = mapearEstadoAId(siguienteEstado);
      await actualizarEstadoPedido(pedidoId, nuevoEstadoId);

      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedidoId
            ? { ...p, estado: siguienteEstado, id_estado: nuevoEstadoId }
            : p
        )
      );
    } catch (err) {
      console.error('Error al cambiar estado:', err);
    }
  };

  const marcarRecibido = async (pedidoId) => {
    try {
      setActualizando((prev) => ({ ...prev, [pedidoId]: true }));
      await marcarPedidoRecibido(pedidoId);

      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedidoId ? { ...p, recibido_cliente: true } : p
        )
      );
    } catch (err) {
      console.error('Error al marcar pedido como recibido:', err);
      alert('No se pudo marcar como recibido. Intenta de nuevo.');
    } finally {
      setActualizando((prev) => ({ ...prev, [pedidoId]: false }));
    }
  };

  return (
    <div className="layout">
      <MenuLateral />
      <main className="pedidos">
        <h1 className="titulos__empleados">Pedidos a Domicilio</h1>

        <section className="pedidos__lista">
          {cargando ? (
            <p>Cargando pedidos...</p>
          ) : pedidos.length === 0 ? (
            <p>No hay pedidos a domicilio para mostrar.</p>
          ) : (
            pedidos.map((pedido) => (
              <article key={pedido.id} className="pedido">
                <div className="pedido__contenido">
                  <h2 className="pedido__titulo">
                    PED{pedido.id} - {pedido.cliente}
                  </h2>
                  <p className="pedido__productos">{pedido.productos}</p>
                  <p className="pedido__direccion">
                    Dirección: {pedido.direccion_entrega}{' '}
                    {pedido.detalle_direccion && ` - ${pedido.detalle_direccion}`}
                  </p>
                  {pedido.notas && <p className="pedido__notas">Notas: {pedido.notas}</p>}
                  <p className="pedido__total">Total: ${pedido.total?.toLocaleString()}</p>
                </div>

                <div className="pedido__info">
                  <span className={`pedido__estado pedido__estado--${pedido.estado}`}>
                    {mapearEstado(pedido.estado)}
                  </span>

                  {/* Botón cambiar estado */}
                  <button
                    className="pedido__boton"
                    onClick={() => cambiarEstado(pedido.id, pedido.estado)}
                    disabled={pedido.estado === 'completado' || pedido.estado === 'recibido'}
                  >
                    {pedido.estado === 'recibido' ? 'Recibido' : 'Cambiar Estado'}
                  </button>

                  {/* Botón recibido */}
                  {!pedido.recibido_cliente && (
                    <button
                      className="pedido__boton pedido__boton--recibido"
                      onClick={() => marcarRecibido(pedido.id)}
                      disabled={actualizando[pedido.id]}
                    >
                      {actualizando[pedido.id] ? 'Marcando...' : 'Marcar como recibido'}
                    </button>
                  )}

                  {pedido.recibido_cliente && (
                    <span className="pedido__recibido">Pedido recibido ✅</span>
                  )}
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default DomiciliosEmpleados;
