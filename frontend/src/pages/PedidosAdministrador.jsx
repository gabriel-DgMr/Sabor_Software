import React, { useState } from 'react';

import MenuLateral from '../components/MenuLateralAdministrador';
import '../styles/empleados.css';

const ESTADOS = ['pendiente', 'en-preparacion', 'listo', 'entregado'];

const estadoTexto = estado => {
  switch (estado) {
    case 'pendiente':
      return 'Pendiente';
    case 'en-preparacion':
      return 'En preparación';
    case 'listo':
      return 'Listo';
    case 'entregado':
      return 'Entregado';
    default:
      return 'Desconocido';
  }
};

const Pedidos = () => {
  const [filtroActivo, setFiltroActivo] = useState('todos');
  const [pedidos, setPedidos] = useState([
    {
      id: 'PED001',
      cliente: 'Miguel Morales',
      productos: 'Ceviche Mixto, Arroz con Mariscos',
      hora: '12:35 PM',
      mesa: 16,
      estado: 'pendiente',
    },
    {
      id: 'PED002',
      cliente: 'Andrea Martinez',
      productos: 'Pulpo a la Parrilla, Jugo de Maracuya',
      hora: '12:50 PM',
      mesa: 21,
      estado: 'en-preparacion',
    },
    {
      id: 'PED003',
      cliente: 'Katiuska Villalobos',
      productos: 'Arroz con Mariscos, Filete miñon con salsa de brandy',
      hora: '1:00 PM',
      mesa: 8,
      estado: 'listo',
    },
  ]);

  const cambiarEstado = index => {
    setPedidos(prevPedidos =>
      prevPedidos.map((pedido, i) => {
        if (i === index) {
          const estadoActual = pedido.estado;
          const siguienteIndex = (ESTADOS.indexOf(estadoActual) + 1) % ESTADOS.length;
          return { ...pedido, estado: ESTADOS[siguienteIndex] };
        }
        return pedido;
      })
    );
  };

  const pedidosFiltrados =
    filtroActivo === 'todos' ? pedidos : pedidos.filter(pedido => pedido.estado === filtroActivo);

  return (
    <div className="layout">
      <MenuLateral />
      <main className="pedidos">
        <header className="pedidos__encabezado">
          <h1 className="titulos__empleados">PEDIDOS</h1>
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
        </header>

        <section className="pedidos__lista">
          {pedidosFiltrados.length === 0 ? (
            <p className="pedidos__mensaje">No hay pedidos para mostrar.</p>
          ) : (
            pedidosFiltrados.map((pedido, index) => (
              <article key={index} className="pedido">
                <div className="pedido__contenido">
                  <h2 className="pedido__titulo">
                    {pedido.id} - {pedido.cliente}
                  </h2>
                  <p className="pedido__productos">{pedido.productos}</p>
                  <p className="pedido__hora">Hora: {pedido.hora}</p>
                  <button className="pedido__boton" onClick={() => cambiarEstado(index)}>
                    Cambiar estado
                  </button>
                </div>
                <div className="pedido__info">
                  <span className={`pedido__estado pedido__estado--${pedido.estado}`}>
                    {estadoTexto(pedido.estado)}
                  </span>
                  <p className="pedido__mesa">MESA: {pedido.mesa}</p>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default Pedidos;
