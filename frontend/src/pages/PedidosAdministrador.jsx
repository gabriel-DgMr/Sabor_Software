import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MenuLateral from '../components/MenuLateralAdministrador';
import { FiRefreshCcw, FiLoader, FiArrowRight } from 'react-icons/fi';
import { GoCheck } from 'react-icons/go';
import { TbPackage } from 'react-icons/tb';

import {
  obtenerPedidos,
  actualizarEstadoPedido,
  mapearEstado,
  obtenerSiguienteEstado,
  mapearEstadoAId,
} from '../services/pedidosService';

import '../styles/empleados.css';

const ESTADOS = ['pendiente', 'en-preparacion', 'completado'];

const estadoTexto = estado => mapearEstado(estado);

const PedidosAdministrador = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [filtroActivo, setFiltroActivo] = useState('todos');
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  //  Cargar pedidos al montar el componente
  useEffect(() => {
    const cargarPedidos = async () => {
      if (!isAuthenticated || authLoading) {
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError(null);
        const datosPedidos = await obtenerPedidos();
        setPedidos(datosPedidos);
      } catch (err) {
        console.error('Error al cargar pedidos:', err);
        setError('Error al cargar los pedidos. Por favor, intenta de nuevo.');
      } finally {
        setCargando(false);
      }
    };

    cargarPedidos();
  }, [isAuthenticated, authLoading]);

  // 📌 Cambiar estado de pedido
  const cambiarEstado = async (pedidoId, estadoActual) => {
    try {
      setPedidos(prevPedidos =>
        prevPedidos.map(p => (p.id === pedidoId ? { ...p, cambiandoEstado: true } : p))
      );

      const siguienteEstado = obtenerSiguienteEstado(estadoActual);
      const nuevoEstadoId = mapearEstadoAId(siguienteEstado);

      console.log(
        `Cambiando pedido ${pedidoId} de "${estadoActual}" a "${siguienteEstado}" (ID: ${nuevoEstadoId})`
      );

      await actualizarEstadoPedido(pedidoId, nuevoEstadoId);

      setPedidos(prevPedidos =>
        prevPedidos.map(p =>
          p.id === pedidoId
            ? {
                ...p,
                estado: siguienteEstado,
                id_estado: nuevoEstadoId,
                cambiandoEstado: false,
              }
            : p
        )
      );

      setError(null);
      console.log(`✅ Pedido ${pedidoId} actualizado a "${siguienteEstado}"`);
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setPedidos(prevPedidos =>
        prevPedidos.map(p => (p.id === pedidoId ? { ...p, cambiandoEstado: false } : p))
      );
      setError(`Error al actualizar el pedido ${pedidoId}: ${err.message}`);
    }
  };

  // 📌 Refrescar pedidos manualmente
  const refrescarPedidos = async () => {
    if (!isAuthenticated) return;

    try {
      setError(null);
      const datosPedidos = await obtenerPedidos();
      setPedidos(datosPedidos);
    } catch (err) {
      console.error('Error al refrescar pedidos:', err);
      setError('Error al refrescar los pedidos. Por favor, intenta de nuevo.');
    }
  };

  const pedidosFiltrados =
    filtroActivo === 'todos' ? pedidos : pedidos.filter(p => p.estado === filtroActivo);

  return (
    <div className="layout">
      <MenuLateral />
      <main className="pedidos">
        <header className="pedidos__encabezado">
          <h1 className="titulos__empleados">PEDIDOS</h1>
          <div className="pedidos__controles">
            <div className="pedidos__filtros">
              {['todos', ...ESTADOS].map(estado => (
                <button
                  key={estado}
                  className={`pedidos__filtro ${
                    filtroActivo === estado ? 'pedidos__filtro--activo' : ''
                  }`}
                  onClick={() => setFiltroActivo(estado)}
                >
                  {estado === 'todos' ? 'Todos' : estadoTexto(estado)}
                </button>
              ))}
            </div>
            <button
              className="pedidos__boton-refrescar"
              onClick={refrescarPedidos}
              title="Refrescar pedidos"
            >
              <FiRefreshCcw className="icono" /> Refrescar
            </button>
          </div>
        </header>

        <section className="pedidos__lista">
          {authLoading ? (
            <p className="pedidos__mensaje">Verificando autenticación...</p>
          ) : !isAuthenticated ? (
            <div className="pedidos__mensaje pedidos__mensaje--error">
              <h3>Acceso Restringido</h3>
              <p>Necesitas iniciar sesión como administrador para ver los pedidos.</p>
            </div>
          ) : cargando ? (
            <p className="pedidos__mensaje">Cargando pedidos...</p>
          ) : error ? (
            <p className="pedidos__mensaje pedidos__mensaje--error">{error}</p>
          ) : pedidosFiltrados.length === 0 ? (
            <p className="pedidos__mensaje">No hay pedidos para mostrar.</p>
          ) : (
            pedidosFiltrados.map(pedido => (
              <article key={pedido.id} className="pedido">
                <div className="pedido__contenido">
                  <h2 className="pedido__titulo">
                    PED{pedido.id} - {pedido.cliente}
                  </h2>
                  <p className="pedido__productos">{pedido.productos}</p>
                  <p className="pedido__hora">Hora: {pedido.hora}</p>
                  <p className="pedido__total">Total: ${pedido.total?.toLocaleString()}</p>
                  {pedido.notas && <p className="pedido__notas">Notas: {pedido.notas}</p>}
                  {pedido.metodo_pago === 'payu' && pedido.referencia_pago && (
                    <p className="pedido__payu">💳 Pago PayU: {pedido.referencia_pago}</p>
                  )}
                  {pedido.tipo_servicio === 'domicilio' && (
                    <p className="pedido__direccion">
                      📍 Domicilio: {pedido.direccion_entrega}
                      {pedido.detalle_direccion && ` - ${pedido.detalle_direccion}`}
                    </p>
                  )}
                  <button
                    className={`pedido__boton ${
                      pedido.cambiandoEstado ? 'pedido__boton--cargando' : ''
                    }`}
                    onClick={() => cambiarEstado(pedido.id, pedido.estado)}
                    disabled={
                      pedido.estado === 'completado' ||
                      pedido.estado === 'recibido' ||
                      pedido.cambiandoEstado
                    }
                  >
                    {pedido.cambiandoEstado ? (
                      <>
                        <FiLoader className="icono icono-spin" />
                        Actualizando...
                      </>
                    ) : pedido.estado === 'completado' ? (
                      <>
                        <GoCheck className="icono" />
                        Completado
                      </>
                    ) : pedido.estado === 'recibido' ? (
                      <>
                        <TbPackage className="icono" />
                        Recibido
                      </>
                    ) : (
                      <>
                        <FiArrowRight className="icono" />
                        {`Cambiar a ${mapearEstado(obtenerSiguienteEstado(pedido.estado))}`}
                      </>
                    )}
                  </button>
                </div>
                <div className="pedido__info">
                  <span className={`pedido__estado pedido__estado--${pedido.estado}`}>
                    {estadoTexto(pedido.estado)}
                  </span>
                  <p className="pedido__mesa">
                    {pedido.tipo_servicio === 'mesa' ? `MESA: ${pedido.mesa}` : 'DOMICILIO'}
                  </p>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default PedidosAdministrador;
