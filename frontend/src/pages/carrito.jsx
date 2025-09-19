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

    // Verificar si el usuario acaba de regresar de PayU
    const payuProcessing = localStorage.getItem('payuProcessing');
    const payuTimestamp = localStorage.getItem('payuTimestamp');

    if (payuProcessing === 'true') {
      console.log('🔍 Usuario regresó de PayU, verificando parámetros...');

      // Limpiar el flag de procesamiento
      localStorage.removeItem('payuProcessing');
      localStorage.removeItem('payuTimestamp');

      // Verificar si hay parámetros en la URL
      const hasParams =
        location.search.includes('transactionState') ||
        location.search.includes('referenceCode') ||
        location.search.includes('polTransactionState');

      console.log('🔍 ¿Hay parámetros en la URL?', hasParams);
      console.log('🔍 ¿Hay productos en el carrito?', cartItems.length > 0);

      // Si no hay parámetros en la URL pero el usuario venía de PayU y hay productos,
      // asumir que fue exitoso y procesar (modo sandbox de PayU puede no enviar parámetros)
      if (cartItems.length > 0) {
        console.log('🔄 Procesando pedido automáticamente (usuario regresó de PayU)...');

        // Mostrar mensaje de procesamiento inmediatamente
        setModal({
          open: true,
          message: (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  display: 'inline-block',
                  width: '20px',
                  height: '20px',
                  border: '2px solid #f3f3f3',
                  borderTop: '2px solid #4caf50',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '10px',
                }}
              ></div>
              Procesando tu pedido... Por favor espera.
            </div>
          ),
          icon: <GoAlert className="GoAlert" style={{ fontSize: '2.5rem' }} />,
          onConfirm: null, // Sin botón, se cierra automáticamente
        });

        // Procesar como exitoso con referencia temporal
        setTimeout(() => {
          procesarPedidoExitoso(`PAYU_RETURN_${Date.now()}`, '4');
        }, 1500);

        return; // Salir temprano para evitar el procesamiento normal
      } else {
        console.log('⚠️ No hay productos en el carrito, no se puede procesar el pedido');
      }
    }

    // Lógica para mostrar estado de pago después de volver de PayU
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    const transactionState = params.get('transactionState');
    const polTransactionState = params.get('polTransactionState');
    const lapTransactionState = params.get('lapTransactionState');
    const responseCode = params.get('responseCode');
    const polResponseCode = params.get('polResponseCode');
    const referenceCode = params.get('referenceCode');
    const reference_pol = params.get('reference_pol');
    const merchantId = params.get('merchantId');
    const TX_VALUE = params.get('TX_VALUE');
    const signature = params.get('signature');

    // Obtener el estado real de la transacción (PayU puede enviar diferentes parámetros)
    const finalTransactionState = transactionState || polTransactionState || lapTransactionState;

    // Debug: mostrar todos los parámetros recibidos
    console.log('🔍 URL completa:', location.search);
    console.log('🔍 Todos los parámetros de PayU recibidos:', {
      status,
      transactionState,
      polTransactionState,
      lapTransactionState,
      responseCode,
      polResponseCode,
      referenceCode,
      reference_pol,
      merchantId,
      TX_VALUE,
      signature,
      finalTransactionState,
    });
    console.log('🔍 payuProcessing desde localStorage:', localStorage.getItem('payuProcessing'));

    if (status || finalTransactionState || referenceCode) {
      let message = '';
      let icon = null;
      let shouldCreateOrder = false;

      console.log('Parámetros de PayU procesando:', {
        status,
        transactionState,
        polTransactionState,
        finalTransactionState,
        referenceCode,
        reference_pol,
        responseCode,
        polResponseCode,
      });

      // Manejar respuesta de PayU - ser más agresivo en detectar éxito
      if (finalTransactionState) {
        switch (finalTransactionState) {
          case '4': // Transacción aprobada
            message = '¡Pago realizado con éxito! Tu pedido ha sido recibido.';
            icon = <GoCheck className="GoCheck" style={{ fontSize: '2.5rem' }} />;
            shouldCreateOrder = true;
            break;
          case '6': // Transacción rechazada
          case '104': // Error
            message = 'El pago fue rechazado o cancelado. Intenta nuevamente.';
            icon = <GoX className="GoX" style={{ fontSize: '2.5rem' }} />;
            break;
          case '7': // Pago pendiente
          case '15': // Pago pendiente
            message = 'El pago está pendiente de confirmación. Te avisaremos cuando se procese.';
            icon = <GoAlert className="GoAlert" style={{ fontSize: '2.5rem' }} />;
            shouldCreateOrder = true; // Crear pedido pendiente
            break;
          default:
            // Si hay una referencia pero estado desconocido, asumir éxito
            if (referenceCode || reference_pol) {
              message = '¡Pago procesado! Tu pedido ha sido recibido.';
              icon = <GoCheck className="GoCheck" style={{ fontSize: '2.5rem' }} />;
              shouldCreateOrder = true;
            } else {
              message = 'No se pudo determinar el estado del pago.';
              icon = <GoAlert className="GoAlert" style={{ fontSize: '2.5rem' }} />;
            }
        }
      } else if (referenceCode || reference_pol) {
        // Si no hay estado pero hay referencia, asumir que la transacción fue procesada
        message = '¡Pago procesado! Tu pedido ha sido recibido.';
        icon = <GoCheck className="GoCheck" style={{ fontSize: '2.5rem' }} />;
        shouldCreateOrder = true;
        console.log('Asumiendo transacción exitosa por presencia de referencia');
      } else {
        // Manejar respuesta genérica (mantener compatibilidad)
        switch (status) {
          case 'success':
          case 'response':
            message = '¡Pago procesado! Revisa el estado en tu correo.';
            icon = <GoCheck className="GoCheck" style={{ fontSize: '2.5rem' }} />;
            shouldCreateOrder = true;
            break;
          case 'failure':
            message = 'El pago fue rechazado o cancelado. Intenta nuevamente.';
            icon = <GoX className="GoX" style={{ fontSize: '2.5rem' }} />;
            break;
          case 'pending':
            message = 'El pago está pendiente de confirmación. Te avisaremos cuando se procese.';
            icon = <GoAlert className="GoAlert" style={{ fontSize: '2.5rem' }} />;
            shouldCreateOrder = true;
            break;
          default:
            message = 'No se pudo determinar el estado del pago.';
            icon = <GoAlert className="GoAlert" style={{ fontSize: '2.5rem' }} />;
        }
      }

      // Si el pago fue exitoso o está pendiente, crear el pedido AUTOMÁTICAMENTE
      if (shouldCreateOrder && cartItems.length > 0) {
        console.log('🚀 Procesando pedido automáticamente con parámetros de PayU');

        // Mostrar mensaje de procesamiento inmediatamente
        setModal({
          open: true,
          message: (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  display: 'inline-block',
                  width: '20px',
                  height: '20px',
                  border: '2px solid #f3f3f3',
                  borderTop: '2px solid #4caf50',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '10px',
                }}
              ></div>
              Procesando tu pedido exitoso... Por favor espera.
            </div>
          ),
          icon: <GoAlert className="GoAlert" style={{ fontSize: '2.5rem' }} />,
          onConfirm: null, // Sin botón, se cierra automáticamente
        });

        // Procesar el pedido automáticamente
        setTimeout(() => {
          procesarPedidoExitoso(referenceCode || reference_pol, finalTransactionState);
        }, 1000);

        return; // Salir para no mostrar el modal normal
      }

      // Solo mostrar modal si NO se va a procesar automáticamente
      if (!shouldCreateOrder) {
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
    }
  }, [location, cartItems]); // Agregar cartItems como dependencia

  // Verificador adicional para asegurar procesamiento
  useEffect(() => {
    const checkForPendingProcessing = () => {
      const payuProcessing = localStorage.getItem('payuProcessing');
      const payuTimestamp = localStorage.getItem('payuTimestamp');

      // Si han pasado más de 30 segundos desde que se marcó el procesamiento
      if (payuProcessing === 'true' && payuTimestamp) {
        const elapsed = Date.now() - parseInt(payuTimestamp);
        if (elapsed > 30000 && cartItems.length > 0) {
          // 30 segundos
          console.log(
            '⚠️ Procesamiento pendiente detectado después de 30s, ejecutando automáticamente'
          );
          localStorage.removeItem('payuProcessing');
          localStorage.removeItem('payuTimestamp');

          // Procesar automáticamente
          procesarPedidoExitoso(`PAYU_DELAYED_${Date.now()}`, '4');
        }
      }
    };

    // Verificar cada 10 segundos
    const interval = setInterval(checkForPendingProcessing, 10000);

    // Limpiar el intervalo al desmontar
    return () => clearInterval(interval);
  }, [cartItems]);

  // Función para procesar pedido exitoso después del pago con PayU
  const procesarPedidoExitoso = async (transactionReference, transactionState) => {
    try {
      console.log('🔄 ===== INICIANDO PROCESAMIENTO DE PEDIDO EXITOSO =====');
      console.log('📋 Datos de entrada:', {
        transactionReference,
        transactionState,
        cartItemsLength: cartItems.length,
        cartItems: cartItems,
      });

      if (!transactionReference) {
        console.warn('⚠️ No hay referencia de transacción, usando timestamp');
        transactionReference = `PAYU_${Date.now()}`;
      }

      // Determinar el estado del pedido basado en el estado de la transacción
      // Para PayU, siempre usar estado PENDIENTE para que el empleado lo maneje manualmente
      let estadoPedido = 2; // PENDIENTE - para que el empleado confirme manualmente
      if (transactionState === '4') {
        estadoPedido = 2; // PENDIENTE (aunque esté pagado, debe ser confirmado por empleado)
      } else if (transactionState === '7' || transactionState === '15') {
        estadoPedido = 2; // PENDIENTE
      }

      console.log('📝 Creando pedido con datos:', {
        metodo_pago: 'payu',
        tipo_servicio: 'mesa',
        referencia_pago: transactionReference,
        estado_pago: estadoPedido,
        recomendaciones: recomendaciones,
      });

      // Crear el pedido con PayU
      console.log('🚀 Llamando a confirmarPedido...');
      const result = await confirmarPedido({
        metodo_pago: 'payu',
        tipo_servicio: 'mesa', // Por defecto mesa, puedes ajustar según necesites
        referencia_pago: transactionReference,
        estado_pago: estadoPedido,
        recomendaciones: recomendaciones,
      });

      console.log('✅ Pedido confirmado exitosamente:', result);

      // Limpiar carrito y recomendaciones después del pedido exitoso
      console.log('🧹 Limpiando carrito...');
      await clearCart();
      localStorage.removeItem('recomendacionesPedido');
      setRecomendaciones('');

      console.log('✅ Pedido procesado exitosamente - Carrito limpiado');

      // Mostrar mensaje de éxito brevemente y luego recargar
      setModal({
        open: true,
        message: '✅ ¡Pedido procesado exitosamente! Recargando...',
        icon: <GoCheck className="GoCheck" style={{ fontSize: '2.5rem', color: '#4caf50' }} />,
        onConfirm: null, // Sin botón, se cierra automáticamente
      });

      // Recargar la página automáticamente después de mostrar el éxito
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('❌ ===== ERROR AL PROCESAR PEDIDO EXITOSO =====');
      console.error('❌ Error completo:', error);
      console.error('❌ Mensaje de error:', error.message);
      console.error('❌ Stack trace:', error.stack);

      // Intentar limpiar el carrito de todos modos
      try {
        await clearCart();
        localStorage.removeItem('recomendacionesPedido');
        console.log('🧹 Carrito limpiado después del error');
      } catch (clearError) {
        console.error('❌ Error al limpiar carrito:', clearError);
      }

      // Mostrar mensaje de éxito incluso si hay error (el pago fue exitoso)
      setModal({
        open: true,
        message: '✅ ¡Pago exitoso! Tu pedido está siendo procesado. Recargando...',
        icon: <GoCheck className="GoCheck" style={{ fontSize: '2.5rem', color: '#4caf50' }} />,
        onConfirm: null, // Sin botón, se cierra automáticamente
      });

      // Recargar automáticamente incluso si hubo error
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

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

      // Llama al backend para generar el formulario de PayU
      const response = await fetch('http://localhost:3000/api/payu/formulario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al procesar pago');

      // Crear formulario dinámico para PayU
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.actionUrl;
      form.style.display = 'none';

      // Agregar campos del formulario
      Object.entries(data.formData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      // Marcar que estamos procesando un pago
      localStorage.setItem('payuProcessing', 'true');
      localStorage.setItem('payuTimestamp', Date.now().toString());

      // Agregar formulario al DOM y enviarlo
      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error('Error al procesar pago con PayU:', error);
      setModal({
        open: true,
        message: 'Error al procesar el pago con PayU. Intenta nuevamente.',
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
                              src={`http://localhost:3000${item.imagen_producto}`}
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
                    <span className="text">PayU</span>
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

      {/* Estilos para animación de carga */}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
