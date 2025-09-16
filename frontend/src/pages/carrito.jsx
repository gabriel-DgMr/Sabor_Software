import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import '../index.css';
import '../styles/carrito.css';
import { GoX, GoCheck, GoAlert, GoTrash, GoCreditCard } from 'react-icons/go';
import { BsCash, BsHouse } from 'react-icons/bs';
import { IoCart } from 'react-icons/io5';

import DialogoModal from '../components/DialogoExito.jsx';
import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { useCart } from '../context/useCart.js';

const API_URL = 'http://localhost:3000/api';

// Componente de alerta visualmente consistente para el carrito
const CarritoAlert = ({ message }) => {
  if (!message) return null;
  return (
    <div className="alerta-con-tarjeta">
      <GoAlert className="GoAlert" />
      <span>{message}</span>
    </div>
  );
};

export default function Carrito() {
  const location = useLocation();
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
    removeItemFromCart,
  } = useCart();
  const [recomendaciones, setRecomendaciones] = useState('');
  const [modal, setModal] = useState({
    open: false,
    message: '',
    icon: <GoCheck className="GoCheck" />,
    onConfirm: null,
  });
  const { t } = useTranslation();

  useEffect(() => {
    document.title = 'Sabor: Carrito';
    setLoading(false);
    // Recuperar recomendaciones guardadas
    const recomendacionesGuardadas = localStorage.getItem('recomendacionesPedido');
    if (recomendacionesGuardadas) {
      setRecomendaciones(recomendacionesGuardadas);
    }

    // Lógica para mostrar estado de pago después de volver de MercadoPago
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    if (status) {
      let message = '';
      let icon = null;
      switch (status) {
        case 'success':
          message = '¡Pago realizado con éxito! Tu pedido ha sido recibido.';
          icon = <GoCheck className="GoCheck" style={{ fontSize: '2.5rem' }} />;
          break;
        case 'failure':
          message = 'El pago fue rechazado o cancelado. Intenta nuevamente.';
          icon = <GoX className="GoX" style={{ fontSize: '2.5rem' }} />;
          break;
        case 'pending':
          message = 'El pago está pendiente de confirmación. Te avisaremos cuando se procese.';
          icon = <GoAlert className="GoAlert" style={{ fontSize: '2.5rem' }} />;
          break;
        default:
          message = 'No se pudo determinar el estado del pago.';
          icon = <GoAlert className="GoAlert" style={{ fontSize: '2.5rem' }} />;
      }
      setModal({
        open: true,
        message,
        icon,
        onConfirm: () => {
          setModal(m => ({ ...m, open: false }));
          window.history.replaceState({}, document.title, location.pathname); // Limpia la URL
        },
      });
    }
  }, [location]);

  const procesarPago = async () => {
    if (cartItems.length === 0) {
      setModal({
        open: true,
        message: 'El carrito está vacío.',
        icon: <GoAlert className="GoAlert" />,
        onConfirm: () => setModal({ ...modal, open: false }),
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Llama al backend para crear la preferencia de Mercado Pago
      const response = await fetch('http://localhost:3000/api/mercadopago/preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al procesar pago');

      // Redirige al cliente a Mercado Pago
      window.location.href = data.init_point;
    } catch (error) {
      setModal({
        open: true,
        message: 'Error al procesar el pago con Mercado Pago',
        icon: <GoX className="GoX" />,
        onConfirm: () => setModal({ ...modal, open: false }),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarCarrito = () => {
    setModal({
      open: true,
      message: '¿Estás seguro de que deseas eliminar todo el carrito?',
      icon: <GoTrash className="GoTrash" />,
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
            message: `Error al eliminar carrito`,
            icon: <GoX className="GoX" />,
            onConfirm: () => setModal({ ...modal, open: false }),
          });
        }
      },
      onCancel: () => setModal({ ...modal, open: false }),
    });
  };

  // función principal para pago en efectivo
  const handlePagoEfectivo = async () => {
    setModal({
      open: true,
      message: '¿Deseas tu pedido para Mesa o Domicilio?',
      icon: <BsCash className="BsCash" style={{ color: '#ff9800', fontSize: '2.5rem' }} />,
      confirmText: 'Mesa',
      cancelText: 'Domicilio',

      // Caso Mesa
      onConfirm: async () => {
        try {
          await confirmarPedido({
            metodo_pago: 'efectivo',
            tipo_servicio: 'mesa',
          });

          localStorage.removeItem('recomendacionesPedido');
          setModal({
            open: true,
            message: '¡Pedido confirmado para Mesa y pago en efectivo!',
            icon: <GoCheck className="GoCheck" style={{ color: '#00a600', fontSize: '2.5rem' }} />,
            onConfirm: () => setModal(m => ({ ...m, open: false })),
          });
        } catch (error) {
          setModal({
            open: true,
            message: `Error al confirmar el pedido en Mesa`,
            icon: <GoX className="GoX" style={{ color: '#e53935', fontSize: '2.5rem' }} />,
            onConfirm: () => setModal(m => ({ ...m, open: false })),
          });
        }
      },

      // Caso Domicilio
      onCancel: () => {
        setModal({
          open: true,
          message: (
            <div>
              <h3 style={{ marginBottom: '10px' }}>Datos para el domicilio</h3>
              <input
                type="text"
                placeholder="Dirección"
                id="direccion"
                className="input-modal"
                style={{ width: '100%', marginBottom: '8px', padding: '6px' }}
              />
              <input
                type="text"
                placeholder="Apartamento / Piso / Habitación"
                id="apartamento"
                className="input-modal"
                style={{ width: '100%', marginBottom: '8px', padding: '6px' }}
              />
            </div>
          ),
          icon: <BsHouse className="BsHouse" style={{ color: '#ff5722', fontSize: '2.5rem' }} />,
          confirmText: 'Confirmar domicilio',
          cancelText: 'Cancelar',
          onConfirm: async () => {
            try {
              const direccionInput = document.getElementById('direccion');
              const apartamentoInput = document.getElementById('apartamento');
              const direccion = direccionInput ? direccionInput.value.trim() : '';
              const apartamento = apartamentoInput ? apartamentoInput.value.trim() : '';

              if (!direccion) {
                alert('⚠️ Por favor ingresa la dirección');
                return;
              }

              await confirmarPedido({
                metodo_pago: 'efectivo',
                tipo_servicio: 'domicilio',
                direccion_entrega: direccion,
                detalle_direccion: apartamento,
              });

              localStorage.removeItem('recomendacionesPedido');

              setModal({
                open: true,
                message: '¡Pedido confirmado para Domicilio y pago en efectivo!',
                icon: (
                  <GoCheck className="GoCheck" style={{ color: '#00a600', fontSize: '2.5rem' }} />
                ),
                onConfirm: () => setModal(m => ({ ...m, open: false })),
              });
            } catch (error) {
              setModal({
                open: true,
                message: `Error al confirmar el pedido en Domicilio`,
                icon: <GoX className="GoX" style={{ color: '#e53935', fontSize: '2.5rem' }} />,
                onConfirm: () => setModal(m => ({ ...m, open: false })),
              });
            }
          },
          onCancel: () => setModal(m => ({ ...m, open: false })),
        });
      },
    });
  };

  const handleUpdateQuantity = async (id_producto, nuevaCantidad) => {
    try {
      await updateItemQuantity(id_producto, nuevaCantidad);
    } catch (error) {
      setModal({
        open: true,
        message: `Error al actualizar cantidad`,
        icon: <GoX className="GoX" />,
        onConfirm: () => setModal({ ...modal, open: false }),
      });
    }
  };

  const handleRemoveItem = async id_producto => {
    try {
      await removeItemFromCart(id_producto);
    } catch (error) {
      setModal({
        open: true,
        message: `Error al eliminar producto: ${error.message}`,
        icon: <GoX className="GoX" />,
        onConfirm: () => setModal({ ...modal, open: false }),
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
            <button
              className="carrito_btn reintentar"
              onClick={() => {
                setError(null);
                setLoading(true);
              }}
            >
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
              <CarritoAlert
                message={
                  <>
                    {t('carrito_alerta')}{' '}
                    <span className="carrito_alerta_link">{t('carrito_clic_aqui')}</span>
                  </>
                }
              />
            </div>

            {cartItems.length === 0 ? (
              <div className="carrito_vacio">{t('carrito_vacio')}</div>
            ) : (
              <div key="pedido-pendiente" className="carrito_pedido">
                <div className="carrito_pedido_info">
                  <div className="carrito_pedido_titulo">
                    <span aria-label="carrito" role="img">
                      <IoCart />
                    </span>
                    {t('carrito_pedido_actual')}
                  </div>
                  <ul className="carrito_pedido_lista">
                    {cartItems.map((item, i) => (
                      <li key={i} className="carrito_item">
                        <div className="carrito_item_info">
                          {item.imagen_producto && (
                            <img
                              className="carrito_item_imagen"
                              src={`http://localhost:3000/uploads/productos/${item.imagen_producto}`}
                              alt={item.nombre_producto}
                              style={{
                                width: '48px',
                                height: '48px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                marginRight: '12px',
                              }}
                            />
                          )}
                          <span className="carrito_item_nombre">
                            {item.nombre_producto} x {item.cantidad || 1} -{' '}
                            {(item.precio_unitario * (item.cantidad || 1)).toLocaleString('es-CO')}{' '}
                            COP
                          </span>
                          <div className="carrito_item_controles">
                            <button
                              className="carrito_btn_cantidad"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.id_producto,
                                  Math.max(1, (item.cantidad || 1) - 1)
                                )
                              }
                            >
                              -
                            </button>
                            <span className="carrito_cantidad">{item.cantidad || 1}</span>
                            <button
                              className="carrito_btn_cantidad"
                              onClick={() =>
                                handleUpdateQuantity(item.id_producto, (item.cantidad || 1) + 1)
                              }
                            >
                              +
                            </button>
                            <button
                              className="carrito_btn_eliminar"
                              onClick={() => handleRemoveItem(item.id_producto)}
                            >
                              <GoTrash />
                            </button>
                          </div>
                        </div>
                        {item.peticion && (
                          <span className="carrito_item_peticion">
                            {' '}
                            <br />
                            <em>Petición: {item.peticion}</em>
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="carrito_pedido_total">
                    {t('carrito_total')}:{' '}
                    {cartItems
                      .reduce((sum, item) => sum + item.precio_unitario * (item.cantidad || 1), 0)
                      .toLocaleString('es-CO')}{' '}
                    COP
                  </div>
                  {recomendaciones && (
                    <div className="carrito_pedido_recomendaciones">
                      <h4>{t('carrito_recomendaciones')}</h4>
                      <p>{recomendaciones}</p>
                    </div>
                  )}
                </div>
                <div className="carrito_pedido_acciones">
                  <button className="carrito_btn eliminar" onClick={handleEliminarCarrito}>
                    <span className="text">{t('carrito_eliminar')}</span>
                    <span className="GoTrash">
                      <GoTrash />
                    </span>
                  </button>
                  <button className="carrito_btn cerrar" onClick={handlePagoEfectivo}>
                    <span className="text">Efectivo</span>
                    <span className="BsCash">
                      <BsCash />
                    </span>
                  </button>
                  <button className="carrito_btn pagar" onClick={procesarPago}>
                    <span className="text">{t('Tarjeta')}</span>
                    <span className="GoCreditCard">
                      <GoCreditCard />
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="carrito_detalles">
            <h2>{t('carrito_detalles_compra')}</h2>
            <p>{t('carrito_detalles_compra_desc')}</p>

            {cartItems.length > 0 && (
              <div>
                <h3>{t('carrito_resumen')}</h3>
                <ul>
                  {cartItems.map((item, i) => (
                    <li key={i}>
                      {item.nombre_producto} x {item.cantidad || 1}:{' '}
                      {(item.precio_unitario * (item.cantidad || 1)).toLocaleString('es-CO')} COP
                      {item.peticion && (
                        <span className="carrito_item_peticion">
                          {' '}
                          <br />
                          <em>Petición: {item.peticion}</em>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                <p>
                  <strong>
                    {t('carrito_total')}:{' '}
                    {cartItems
                      .reduce((sum, item) => sum + item.precio_unitario * (item.cantidad || 1), 0)
                      .toLocaleString('es-CO')}{' '}
                    COP
                  </strong>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <DialogoModal {...modal} onClose={() => setModal(m => ({ ...m, open: false }))} />
    </>
  );
}
