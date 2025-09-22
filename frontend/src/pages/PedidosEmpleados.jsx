import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MenuLateral from '../components/MenuLateralEmpleado';

import {
  obtenerPedidos,
  actualizarEstadoPedido,
  mapearEstado,
  obtenerSiguienteEstado,
  mapearEstadoAId,
} from '../services/pedidosService';

import '../styles/empleados.css';

const ESTADOS = ['pendiente', 'en-preparacion', 'completado'];

const PedidosEmpleados = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroActivo, setFiltroActivo] = useState('mesa'); // 🔹 default mesa

  useEffect(() => {
    const cargarPedidos = async () => {
      if (!isAuthenticated || authLoading) {
        setCargando(false);
        return;
      }

      try {
        const datosPedidos = await obtenerPedidos();
        setPedidos(datosPedidos);
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

      setPedidos(prev =>
        prev.map(p =>
          p.id === pedidoId ? { ...p, cambiandoEstado: true } : p
        )
      );

      await actualizarEstadoPedido(pedidoId, nuevoEstadoId);

      setPedidos(prev =>
        prev.map(p =>
          p.id === pedidoId
            ? { ...p, estado: siguienteEstado, id_estado: nuevoEstadoId, cambiandoEstado: false }
            : p
        )
      );
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setPedidos(prev =>
        prev.map(p =>
          p.id === pedidoId ? { ...p, cambiandoEstado: false } : p
        )
      );
    }
  };

  const pedidosFiltrados =
    filtroActivo === 'todos'
      ? pedidos
      : pedidos.filter(p => p.tipo_servicio === filtroActivo);

  return (
    <div className="layout">
      <MenuLateral />
      <main className="pedidos">
        <h1 className="titulos__empleados">Pedidos</h1>

        {/* 🔹 Filtros */}
        <div className="filtros">
          <button
            className={filtroActivo === 'todos' ? 'activo' : ''}
            onClick={() => setFiltroActivo('todos')}
          >
            Todos
          </button>
          <button
            className={filtroActivo === 'mesa' ? 'activo' : ''}
            onClick={() => setFiltroActivo('mesa')}
          >
            Mesa
          </button>
          <button
            className={filtroActivo === 'domicilio' ? 'activo' : ''}
            onClick={() => setFiltroActivo('domicilio')}
          >
            Domicilio
          </button>
        </div>

        <section className="pedidos__lista">
          {cargando ? (
            <p>Cargando pedidos...</p>
          ) : pedidosFiltrados.length === 0 ? (
            <p>No hay pedidos para mostrar.</p>
          ) : (
            pedidosFiltrados.map(pedido => (
              <article key={pedido.id} className="pedido">
                <div className="pedido__contenido">
                  <h2 className="pedido__titulo">
                    PED{pedido.id} - {pedido.cliente}
                  </h2>
                  <p className="pedido__productos">{pedido.productos}</p>

                  {pedido.tipo_servicio === 'mesa' && (
                    <p className="pedido__mesa">Mesa: {pedido.mesa}</p>
                  )}

                  {pedido.notas && (
                    <p className="pedido__notas">Notas: {pedido.notas}</p>
                  )}

                  {pedido.metodo_pago === 'payu' && pedido.referencia_pago && (
                    <p className="pedido__payu">💳 Pago PayU: {pedido.referencia_pago}</p>
                  )}

                  {pedido.tipo_servicio === 'domicilio' && (
                    <p className="pedido__direccion">
                      📍 Domicilio: {pedido.direccion_entrega}
                      {pedido.detalle_direccion && ` - ${pedido.detalle_direccion}`}
                    </p>
                  )}

                  <p className="pedido__total">
                    Total: ${pedido.total?.toLocaleString()}
                  </p>
                </div>

                <div className="pedido__info">
                  <span className={`pedido__estado pedido__estado--${pedido.estado}`}>
                    {mapearEstado(pedido.estado)}
                  </span>
                  <button
                    className={`pedido__boton ${pedido.cambiandoEstado ? 'pedido__boton--cargando' : ''}`}
                    onClick={() => cambiarEstado(pedido.id, pedido.estado)}
                    disabled={pedido.estado === 'completado' || pedido.cambiandoEstado}
                  >
                    {pedido.cambiandoEstado
                      ? '🔄 Actualizando...'
                      : pedido.estado === 'completado'
                      ? '✅ Completado'
                      : `➡️ Cambiar a ${mapearEstado(obtenerSiguienteEstado(pedido.estado))}`}
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default PedidosEmpleados;
