import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import "../index.css";
import "../styles/carrito.css";

import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { useCart } from '../context/CartContext.jsx';
const API_URL = 'http://localhost:3000/api';

export default function Carrito() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { cartItems, clearCart, closedOrders, closeCurrentOrder, createNewOrder } = useCart();
  const [recomendaciones, setRecomendaciones] = useState('');
  const { t } = useTranslation();

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
          // ** ASUMIR QUE ESTE ENDPOINT EXISTE EN EL BACKEND **
          // ** Y QUE RETORNA LOS PEDIDOS NO PENDIENTES DEL USUARIO **
          const response = await fetch(`${API_URL}/pedidos/cerrados`, { 
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            // Asumiendo que `closedOrders` del contexto tiene una función para actualizarse
            // Esto puede variar dependiendo de cómo esté implementado tu contexto
            // Si closedOrders es un estado local aquí, necesitarías setClosedOrders(data);
            // Si viene del contexto, necesitarías una función provista por el contexto.
            // ** ESTA PARTE DEBE SER ADAPTADA A LA IMPLEMENTACIÓN REAL DEL CONTEXTO **
            console.log('Pedidos cerrados cargados:', data); // Para depuración
            // Ejemplo asumiendo que hay una función setClosedOrders en el contexto:
            // setClosedOrders(data); // Esto requiere que setClosedOrders sea expuesto por useCart
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

  const procesarPago = async () => {
    if (cartItems.length === 0) {
      alert(t('carrito_vacio'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        alert(t('carrito_debes_iniciar_sesion'));
        navigate('/login');
        return;
      }

      // Mapear items del carrito a un formato adecuado para el backend
      const itemsParaBackend = cartItems.map(item => ({
        id_producto: item.id,
        cantidad: item.quantity || 1,
        precio_unitario: item.precio
      }));
      const totalCarrito = cartItems.reduce((sum, item) => sum + item.precio * (item.quantity || 1), 0);
      const recomendacionesPedido = localStorage.getItem('recomendacionesPedido') || '';

      const nuevoPedido = {
        items: itemsParaBackend,
        total: totalCarrito,
        recomendaciones: recomendacionesPedido
      };

      const response = await fetch(`${API_URL}/pedidos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(nuevoPedido),
      });
      
      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.mensaje || `Error HTTP: ${response.status}`);
      }
      
      clearCart();
      localStorage.removeItem('recomendacionesPedido');
      alert(t('carrito_pedido_exito'));
      navigate('/confirmacion-pedido');

    } catch (error) {
      console.error('Error al procesar el pago:', error);
      setError(t('carrito_error_pago', { error: error.message }));
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarCarrito = () => {
    if (window.confirm(t('carrito_confirmar_eliminar'))) {
      clearCart();
      localStorage.removeItem('recomendacionesPedido');
    }
  };

  const handleModificarPedido = () => {
    navigate('/carrito/modificar/actual');
  };

  const handleCerrarPedido = () => {
    if (window.confirm(t('carrito_confirmar_cerrar'))) {
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
            <button onClick={() => {
              setError(null);
              setLoading(true);
            }} className="carrito_btn reintentar">
              {t('carrito_reintentar')}
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
        <h1 className="carrito_titulo">{t('carrito_titulo')}</h1>
        <div className="carrito_contenido">
          <div className="carrito_pedidos">
            <div className="carrito_alerta">
              <span className="carrito_alerta_icono">❗</span>
              {t('carrito_alerta')}
              {' '}
              <span className="carrito_alerta_link">{t('carrito_clic_aqui')}</span>
            </div>
            
            {cartItems.length === 0 ? (
              <div className="carrito_vacio">{t('carrito_vacio')}</div>
            ) : (
              <div className="carrito_pedido" key="pedido-pendiente">
                <div className="carrito_pedido_info">
                  <div className="carrito_pedido_titulo">
                    <span aria-label="carrito" role="img">
                      🛒
                    </span>
                    {t('carrito_pedido_actual')}
                  </div>
                  <ul className="carrito_pedido_lista">
                    {cartItems.map((item, i) => (
                      <li key={i} className="carrito_item">
                        <span>{item.nombre} - {item.precio.toLocaleString('es-CO')} COP</span>
                      </li>
                    ))}
                  </ul>
                  <div className="carrito_pedido_total">
                    {t('carrito_total')}: {cartItems.reduce((sum, item) => sum + item.precio, 0).toLocaleString('es-CO')} COP
                  </div>
                  {recomendaciones && (
                    <div className="carrito_pedido_recomendaciones">
                      <h4>{t('carrito_recomendaciones')}</h4>
                      <p>{recomendaciones}</p>
                    </div>
                  )}
                </div>
                <div className="carrito_pedido_acciones">
                  <button 
                    className="carrito_btn eliminar"
                    onClick={handleEliminarCarrito}
                  >
                    🗑️ {t('carrito_eliminar')}
                  </button>
                  <button 
                    className="carrito_btn modificar"
                    onClick={handleModificarPedido}
                  >
                    ✍️ {t('carrito_modificar')}
                  </button>
                  <button 
                    className="carrito_btn cerrar"
                    onClick={handleCerrarPedido}
                  >
                    🔒 {t('carrito_cerrar_pedido')}
                  </button>
                  <button 
                    className="carrito_btn pagar"
                    onClick={procesarPago}
                  >
                    💳 {t('carrito_pagar')}
                  </button>
                </div>
              </div>
            )}

            {closedOrders.length > 0 && (
              <div className="carrito_pedidos_cerrados">
                <h2>{t('carrito_pedidos_cerrados')}</h2>
                {closedOrders.map((order) => (
                  <div className="carrito_pedido cerrado" key={order.id}>
                    <div className="carrito_pedido_info">
                      <div className="carrito_pedido_titulo">
                        <span aria-label="pedido-cerrado" role="img">
                          📦
                        </span>
                        {t('carrito_pedido_numero', { id: order.id, fecha: new Date(order.fecha).toLocaleString() })}
                      </div>
                      <ul className="carrito_pedido_lista">
                        {order.items.map((item, i) => (
                          <li key={i} className="carrito_item">
                            <span>{item.nombre} - {item.precio.toLocaleString('es-CO')} COP</span>
                          </li>
                        ))}
                      </ul>
                      <div className="carrito_pedido_total">
                        {t('carrito_total')}: {order.items.reduce((sum, item) => sum + item.precio, 0).toLocaleString('es-CO')} COP
                      </div>
                      {order.recomendaciones && (
                        <div className="carrito_pedido_recomendaciones">
                          <h4>{t('carrito_recomendaciones')}</h4>
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
            <h2>{t('carrito_detalles_compra')}</h2>
            <p>
              {t('carrito_detalles_compra_desc')}
            </p>
            
            {cartItems.length > 0 && (
              <div>
                <h3>{t('carrito_resumen')}</h3>
                <ul>
                  {cartItems.map((item, i) => (
                    <li key={i}>{item.nombre}: {item.precio.toLocaleString('es-CO')} COP</li>
                  ))}
                </ul>
                <p><strong>{t('carrito_total')}: {cartItems.reduce((sum, item) => sum + item.precio, 0).toLocaleString('es-CO')} COP</strong></p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}