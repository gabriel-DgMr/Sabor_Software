import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
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
  const { 
    cartItems, 
    clearCart, 
    loading: cartLoading, 
    error: cartError,
    confirmarPedido,
    updateItemQuantity,
    removeItemFromCart
  } = useCart();
  const [recomendaciones, setRecomendaciones] = useState('');
  const [modal, setModal] = useState({ open: false, message: '', icon: '✅', onConfirm: null });
  const { t } = useTranslation();

  useEffect(() => {
    document.title = 'Sabor: Carrito';
    setLoading(false);
    // Recuperar recomendaciones guardadas
    const recomendacionesGuardadas = localStorage.getItem('recomendacionesPedido');
    if (recomendacionesGuardadas) {
      setRecomendaciones(recomendacionesGuardadas);
    }
  }, []);

  const procesarPago = async () => {
    if (cartItems.length === 0) {
      setModal({
        open: true,
        message: 'El carrito está vacío.',
        icon: '⚠️',
        onConfirm: () => setModal({ ...modal, open: false })
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setModal({
          open: true,
          message: t('carrito_debes_iniciar_sesion'),
          icon: '⚠️',
          onConfirm: () => {
            setModal({ ...modal, open: false });
            navigate('/login');
          }
        });
        return;
      }

      // Mapear items del carrito a un formato adecuado para el backend
      const itemsParaBackend = cartItems.map(item => ({
        id_producto: item.id_producto,
        cantidad: item.cantidad || 1,
        precio_unitario: item.precio_unitario
      }));
      const totalCarrito = cartItems.reduce((sum, item) => sum + item.precio_unitario * (item.cantidad || 1), 0);
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
      
      await clearCart();
      localStorage.removeItem('recomendacionesPedido');
      setModal({
        open: true,
        message: t('carrito_pedido_exito'),
        icon: '✅',
        onConfirm: () => {
          setModal({ ...modal, open: false });
          navigate('/');
        }
      });

    } catch (error) {
      console.error('Error al procesar el pago:', error);
      setModal({
        open: true,
        message: t('carrito_error_pago', { error: error.message }),
        icon: '❌',
        onConfirm: () => setModal({ ...modal, open: false })
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarCarrito = () => {
    setModal({
      open: true,
      message: '¿Estás seguro de que deseas eliminar todo el carrito?',
      icon: '🗑️',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await clearCart();
          localStorage.removeItem('recomendacionesPedido');
          setModal({ ...modal, open: false });
        } catch (error) {
          setModal({
            open: true,
            message: `Error al eliminar carrito: ${error.message}`,
            icon: '❌',
            onConfirm: () => setModal({ ...modal, open: false })
          });
        }
      },
      onCancel: () => setModal({ ...modal, open: false })
    });
  };

  const handleCerrarPedido = async () => {
    if (window.confirm(t('carrito_confirmar_cerrar'))) {
      try {
        // Usar un empleado por defecto (ID 1) y método de pago efectivo
        await confirmarPedido(1, 'efectivo');
        localStorage.removeItem('recomendacionesPedido');
        setModal({
          open: true,
          message: 'Pedido cerrado exitosamente',
          icon: '✅',
          onConfirm: () => setModal({ ...modal, open: false })
        });
      } catch (error) {
        setModal({
          open: true,
          message: `Error al cerrar pedido: ${error.message}`,
          icon: '❌',
          onConfirm: () => setModal({ ...modal, open: false })
        });
      }
    }
  };

  const handleUpdateQuantity = async (id_producto, nuevaCantidad) => {
    try {
      await updateItemQuantity(id_producto, nuevaCantidad);
    } catch (error) {
      setModal({
        open: true,
        message: `Error al actualizar cantidad: ${error.message}`,
        icon: '❌',
        onConfirm: () => setModal({ ...modal, open: false })
      });
    }
  };

  const handleRemoveItem = async (id_producto) => {
    try {
      await removeItemFromCart(id_producto);
    } catch (error) {
      setModal({
        open: true,
        message: `Error al eliminar producto: ${error.message}`,
        icon: '❌',
        onConfirm: () => setModal({ ...modal, open: false })
      });
    }
  };

  if (loading || cartLoading) {
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

  if (error || cartError) {
    return (
      <>
        <Header />
        <main className="carrito_bg">
          <div className="carrito_error">
            <p>{error || cartError}</p>
            <button className="carrito_btn reintentar" onClick={() => {
              setError(null);
              setLoading(true);
            }}>
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
              <div key="pedido-pendiente" className="carrito_pedido">
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
                        <div className="carrito_item_info">
                          <span className="carrito_item_nombre">
                            {item.nombre_producto} x {item.cantidad || 1} - {(item.precio_unitario * (item.cantidad || 1)).toLocaleString('es-CO')} COP
                          </span>
                          <div className="carrito_item_controles">
                            <button 
                              className="carrito_btn_cantidad"
                              onClick={() => handleUpdateQuantity(item.id_producto, Math.max(1, (item.cantidad || 1) - 1))}
                            >
                              -
                            </button>
                            <span className="carrito_cantidad">{item.cantidad || 1}</span>
                            <button 
                              className="carrito_btn_cantidad"
                              onClick={() => handleUpdateQuantity(item.id_producto, (item.cantidad || 1) + 1)}
                            >
                              +
                            </button>
                            <button 
                              className="carrito_btn_eliminar"
                              onClick={() => handleRemoveItem(item.id_producto)}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        {item.peticion && (
                          <span className="carrito_item_peticion"> <br/><em>Petición: {item.peticion}</em></span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="carrito_pedido_total">
                    {t('carrito_total')}: {cartItems.reduce((sum, item) => sum + item.precio_unitario * (item.cantidad || 1), 0).toLocaleString('es-CO')} COP
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
                    <li key={i}>
                      {item.nombre_producto} x {item.cantidad || 1}: {(item.precio_unitario * (item.cantidad || 1)).toLocaleString('es-CO')} COP
                      {item.peticion && (
                        <span className="carrito_item_peticion"> <br/><em>Petición: {item.peticion}</em></span>
                      )}
                    </li>
                  ))}
                </ul>
                <p><strong>{t('carrito_total')}: {cartItems.reduce((sum, item) => sum + item.precio_unitario * (item.cantidad || 1), 0).toLocaleString('es-CO')} COP</strong></p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <DialogoModal 
        {...modal}
        onClose={() => setModal(m => ({ ...m, open: false }))}
      />
    </>
  );
}