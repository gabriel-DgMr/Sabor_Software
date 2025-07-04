import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import "../styles/carrito.css";

import DialogoModal from '../components/DialogoExito.jsx';
import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { useCart } from '../context/useCart.js';
const API_URL = 'http://localhost:3000/api';

export default function Carrito() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { cartItems, clearCart, closedOrders, closeCurrentOrder, createNewOrder } = useCart();
  const [recomendaciones, setRecomendaciones] = useState('');
  const [modal, setModal] = useState({ open: false, message: '', icon: '✅', onConfirm: null });

  useEffect(() => {
    document.title = 'Sabor: Carrito';
    setLoading(false);
    // Recuperar recomendaciones guardadas
    const recomendacionesGuardadas = localStorage.getItem('recomendacionesPedido');
    if (recomendacionesGuardadas) {
      setRecomendaciones(recomendacionesGuardadas);
    }

    // Cargar pedidos cerrados desde el backend
    const fetchClosedOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {

          const response = await fetch(`${API_URL}/pedidos/cerrados`, { 
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            // Eliminar la asignación a 'data' si no se usa después de eliminar el console.log.
          } else {
            console.error('Error al cargar pedidos cerrados:', response.status);
          }
        }
      } catch (error) {
        console.error('Error al cargar pedidos cerrados:', error);
      }
    };
    fetchClosedOrders();

  }, []); // Dependencias: [useCart, API_URL, navigate, setRecomendaciones, setLoading, setError]

  const procesarPago = () => {
    if (cartItems.length === 0) {
      setModal({
        open: true,
        message: 'El carrito está vacío.',
        icon: '⚠️',
        onConfirm: () => setModal({ ...modal, open: false })
      });
      return;
    }
    navigate('/checkout');
  };

  const handleEliminarCarrito = () => {
    setModal({
      open: true,
      message: '¿Estás seguro de que deseas eliminar todo el carrito?',
      icon: '🗑️',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        clearCart();
        localStorage.removeItem('recomendacionesPedido');
        setModal({ ...modal, open: false });
      },
      onCancel: () => setModal({ ...modal, open: false })
    });
  };

  const handleModificarPedido = () => {
    navigate('/carrito/modificar/actual');
  };

  const handleCerrarPedido = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar este pedido y crear uno nuevo?')) {
      closeCurrentOrder();
      createNewOrder();
      localStorage.removeItem('recomendacionesPedido');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="carrito_bg">
          <LoadingScreen />
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="carrito_bg">
          <div className="carrito_error">
            <p>{error}</p>
            <button className="carrito_btn reintentar" onClick={() => {
              setError(null);
              setLoading(true);
            }}>
              Reintentar
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="carrito_bg">
        <h1 className="carrito_titulo">Carrito</h1>
        <div className="carrito_contenido">
          <div className="carrito_pedidos">
            <div className="carrito_alerta">
              <span className="carrito_alerta_icono">❗</span>
              Si desea reportar un problema con su (s) pedidos haga{" "}
              <span className="carrito_alerta_link">clic aquí</span>
            </div>
            
            {cartItems.length === 0 ? (
              <div className="carrito_vacio">
                No hay productos en el carrito.
              </div>
            ) : (
              <div key="pedido-pendiente" className="carrito_pedido">
                <div className="carrito_pedido_info">
                  <div className="carrito_pedido_titulo">
                    <span aria-label="carrito" role="img">
                      🛒
                    </span>
                    Tu Pedido Actual
                  </div>
                  <ul className="carrito_pedido_lista">
                    {cartItems.map((item, i) => (
                      <li key={i} className="carrito_item">
                        <span>{item.nombre} - {item.precio.toLocaleString('es-CO')} COP</span>
                      </li>
                    ))}
                  </ul>
                  <div className="carrito_pedido_total">
                    Total: {cartItems.reduce((sum, item) => sum + item.precio, 0).toLocaleString('es-CO')} COP
                  </div>
                  {recomendaciones && (
                    <div className="carrito_pedido_recomendaciones">
                      <h4>Recomendaciones:</h4>
                      <p>{recomendaciones}</p>
                    </div>
                  )}
                </div>
                <div className="carrito_pedido_acciones">
                  <button 
                    className="carrito_btn eliminar"
                    onClick={handleEliminarCarrito}
                  >
                    🗑️ Eliminar
                  </button>
                  <button 
                    className="carrito_btn modificar"
                    onClick={handleModificarPedido}
                  >
                    ✍️ Modificar
                  </button>
                  <button 
                    className="carrito_btn cerrar"
                    onClick={handleCerrarPedido}
                  >
                    🔒 Cerrar Pedido
                  </button>
                  <button 
                    className="carrito_btn pagar"
                    onClick={procesarPago}
                  >
                    💳 Pagar
                  </button>
                </div>
              </div>
            )}

            {closedOrders.length > 0 && (
              <div className="carrito_pedidos_cerrados">
                <h2>Pedidos Cerrados</h2>
                {closedOrders.map((order) => (
                  <div key={order.id} className="carrito_pedido cerrado">
                    <div className="carrito_pedido_info">
                      <div className="carrito_pedido_titulo">
                        <span aria-label="pedido-cerrado" role="img">
                          📦
                        </span>
                        Pedido #{order.id} - {new Date(order.fecha).toLocaleString()}
                      </div>
                      <ul className="carrito_pedido_lista">
                        {order.items.map((item, i) => (
                          <li key={i} className="carrito_item">
                            <span>{item.nombre} - {item.precio.toLocaleString('es-CO')} COP</span>
                          </li>
                        ))}
                      </ul>
                      <div className="carrito_pedido_total">
                        Total: {order.items.reduce((sum, item) => sum + item.precio, 0).toLocaleString('es-CO')} COP
                      </div>
                      {order.recomendaciones && (
                        <div className="carrito_pedido_recomendaciones">
                          <h4>Recomendaciones:</h4>
                          <p>{order.recomendaciones}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="carrito_detalles">
            <h2>Detalles de compra</h2>
            <p>
              Aquí se mostrarán los detalles del pedido que usted seleccione (o del carrito actual).
            </p>
            
            {cartItems.length > 0 && (
              <div>
                <h3>Resumen del Carrito</h3>
                <ul>
                  {cartItems.map((item, i) => (
                    <li key={i}>{item.nombre}: {item.precio.toLocaleString('es-CO')} COP</li>
                  ))}
                </ul>
                <p><strong>Total: {cartItems.reduce((sum, item) => sum + item.precio, 0).toLocaleString('es-CO')} COP</strong></p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <DialogoModal {...modal} />
    </>
  );
}