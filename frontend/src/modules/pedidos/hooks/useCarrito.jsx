import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from './useCart.js';
import { useAuth } from '../../../app/context/AuthContext.jsx';
import { useMesa } from '../../../shared/hooks/useMesa.js';
import { toast } from 'react-toastify';
import React from 'react';
import { GoCheck, GoAlert, GoX, GoCreditCard, GoTrash } from 'react-icons/go';
import { BsCash, BsHouse } from 'react-icons/bs';
import { FaUtensils } from 'react-icons/fa6';
import '../../../shared/styles/iconos.css';

const API_URL = `${import.meta.env.VITE_API_URL || '/api'}`;

export const useCarrito = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recomendaciones, setRecomendaciones] = useState('');
  const [modal, setModal] = useState({
    open: false,
    message: '',
    icon: <GoCheck className="icono icono--exito icono--grande" />,
    onConfirm: null,
  });

  const {
    cartItems,
    clearCart,
    loading: cartLoading,
    error: cartError,
    confirmarPedido,
    updateItemQuantity,
    updateItemMessage,
    removeItemFromCart,
    mesa: mesaCart,
    setMesa: setMesaCart,
    clearMesa,
  } = useCart();

  const [mesaContext, setMesaContext] = useMesa();
  const [mesaInput, setMesaInput] = useState(mesaContext || '');
  const [mesaModal, setMesaModal] = useState({ open: false, onConfirm: null });
  const [mesaError, setMesaError] = useState('');

  const obtenerMesaActual = useCallback(
    () => mesaCart || mesaContext || localStorage.getItem('mesa') || '',
    [mesaCart, mesaContext]
  );

  useEffect(() => {
    const actual = obtenerMesaActual();
    if (actual) {
      setMesaInput(actual);
    }
  }, [obtenerMesaActual]);

  const cerrarMesaModal = () => {
    setMesaModal({ open: false, onConfirm: null });
    setMesaError('');
  };

  const confirmarMesaModal = () => {
    const mesaValue = (mesaInput || '').trim();
    if (!mesaValue) {
      setMesaError(t('carrito_mesa_error'));
      return;
    }

    localStorage.setItem('mesa', mesaValue);
    setMesaContext(mesaValue);
    setMesaCart(mesaValue);

    const callback = mesaModal.onConfirm;
    cerrarMesaModal();

    setModal({
      open: true,
      message: t('carrito_mesa_confirmada', { mesa: mesaValue }),
      icon: <GoCheck className="icono icono--exito icono--grande" />,
      onConfirm: () => setModal(prev => ({ ...prev, open: false })),
    });

    toast.success(t('carrito_mesa_confirmada', { mesa: mesaValue }));

    if (typeof callback === 'function') {
      callback(mesaValue);
    }
  };

  const solicitarMesa = useCallback(
    (onReady, { forcePrompt = false } = {}) => {
      const mesaActual = obtenerMesaActual();
      if (mesaActual && !forcePrompt) {
        onReady?.(mesaActual);
        return;
      }
      setMesaInput(forcePrompt ? mesaActual || '' : '');
      setMesaError('');
      setMesaModal({ open: true, onConfirm: onReady });
    },
    [obtenerMesaActual]
  );

  const limpiarMesa = useCallback(() => {
    clearMesa?.();
    setMesaContext('');
    setMesaInput('');
    setModal(prev => ({
      ...prev,
      open: true,
      message: t('carrito_mesa_eliminada'),
      icon: <GoCheck className="icono icono--exito icono--grande" />,
      onConfirm: () => setModal(m => ({ ...m, open: false })),
    }));
    toast.success(t('carrito_mesa_eliminada'));
  }, [clearMesa, setMesaContext, t]);

  const procesarPedidoExitoso = useCallback(
    async (
      transactionReference,
      transactionState,
      tipoServicioSeleccionado = 'mesa',
      direccionServicio = '',
      detalleDireccionServicio = ''
    ) => {
      try {
        if (!transactionReference) {
          transactionReference = `PAYU_${Date.now()}`;
        }

        let estadoPedido = 2; // PENDIENTE
        const payloadPedido = {
          metodo_pago: 'payu',
          tipo_servicio: tipoServicioSeleccionado || 'mesa',
          referencia_pago: transactionReference,
          estado_pago: estadoPedido,
          recomendaciones: recomendaciones,
        };

        if (tipoServicioSeleccionado === 'domicilio') {
          payloadPedido.direccion_entrega = direccionServicio || '';
          payloadPedido.detalle_direccion = detalleDireccionServicio || '';
        }

        await confirmarPedido(payloadPedido);
        await clearCart();
        localStorage.removeItem('recomendacionesPedido');
        setRecomendaciones('');

        setModal({
          open: true,
          message: '✅ ¡Pedido procesado exitosamente! Recargando...',
          icon: <GoCheck className="icono icono--exito icono--grande" />,
          onConfirm: null,
        });

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        console.error('Error al procesar pedido exitoso:', error);
        try {
          await clearCart();
          localStorage.removeItem('recomendacionesPedido');
        } catch (clearError) {
          console.error('Error al limpiar carrito:', clearError);
        }

        setModal({
          open: true,
          message: '✅ ¡Pago exitoso! Tu pedido está siendo procesador. Recargando...',
          icon: <GoCheck className="icono icono--exito icono--grande" />,
          onConfirm: null,
        });

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    },
    [cartItems, confirmarPedido, clearCart, recomendaciones]
  );

  useEffect(() => {
    document.title = 'Sabor: Carrito';
    setLoading(false);

    const recomendacionesGuardadas = localStorage.getItem('recomendacionesPedido');
    if (recomendacionesGuardadas) {
      setRecomendaciones(recomendacionesGuardadas);
    }

    const storedMesa = localStorage.getItem('mesa');
    if (storedMesa) {
      setMesaContext(storedMesa);
      setMesaCart(storedMesa);
      setMesaInput(storedMesa);
    }

    const payuProcessing = localStorage.getItem('payuProcessing');
    if (payuProcessing === 'true' && cartItems.length > 0) {
      localStorage.removeItem('payuProcessing');
      localStorage.removeItem('payuTimestamp');

      setModal({
        open: true,
        message: (
          <div style={{ textAlign: 'center' }}>
            <div className="spinner-mini"></div>
            Procesando tu pedido... Por favor espera.
          </div>
        ),
        icon: <GoAlert className="icono icono--grande" />,
        onConfirm: null,
      });

      setTimeout(() => {
        const storedTipo = localStorage.getItem('payuTipoServicio') || 'mesa';
        const storedDireccion = localStorage.getItem('payuDireccionEntrega');
        const storedDetalle = localStorage.getItem('payuDetalleDireccion');
        procesarPedidoExitoso(
          `PAYU_RETURN_${Date.now()}`,
          '4',
          storedTipo,
          storedDireccion,
          storedDetalle
        );
      }, 1500);
      return;
    }

    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    const transactionState =
      params.get('transactionState') ||
      params.get('polTransactionState') ||
      params.get('lapTransactionState');
    const referenceCode = params.get('referenceCode') || params.get('reference_pol');

    if (status || transactionState || referenceCode) {
      let message = '';
      let icon = null;
      let shouldCreateOrder = false;

      if (transactionState === '4' || (!transactionState && referenceCode)) {
        message = '¡Pago realizado con éxito! Tu pedido ha sido recibido.';
        icon = <GoCheck className="icono icono--exito icono--grande" />;
        shouldCreateOrder = true;
      } else if (transactionState === '6' || transactionState === '104') {
        message = 'El pago fue rechazado o cancelado. Intenta nuevamente.';
        icon = <GoX className="icono icono--error icono--grande" />;
      } else if (transactionState === '7' || transactionState === '15') {
        message = 'El pago está pendiente de confirmación. Te avisaremos cuando se procese.';
        icon = <GoAlert className="icono icono--grande" />;
        shouldCreateOrder = true;
      }

      if (shouldCreateOrder && cartItems.length > 0) {
        setModal({
          open: true,
          message: (
            <div style={{ textAlign: 'center' }}>
              <div className="spinner-mini"></div>
              Procesando tu pedido exitoso... Por favor espera.
            </div>
          ),
          icon: <GoAlert className="icono icono--grande" />,
          onConfirm: null,
        });

        setTimeout(() => {
          const storedTipo = localStorage.getItem('payuTipoServicio') || 'mesa';
          const storedDireccion = localStorage.getItem('payuDireccionEntrega');
          const storedDetalle = localStorage.getItem('payuDetalleDireccion');
          procesarPedidoExitoso(
            referenceCode,
            transactionState,
            storedTipo,
            storedDireccion,
            storedDetalle
          );
        }, 1000);
      } else if (!shouldCreateOrder) {
        setModal({
          open: true,
          message,
          icon,
          onConfirm: () => {
            setModal(m => ({ ...m, open: false }));
            window.history.replaceState({}, document.title, location.pathname);
          },
        });
      }
    }
  }, [location, cartItems, procesarPedidoExitoso, setMesaCart, setMesaContext]);

  const iniciarPagoPayU = async ({
    tipoServicioSeleccionado,
    direccionEntrega = '',
    detalleDireccion = '',
  }) => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        items: cartItems.map(item => ({
          id_producto: item.id_producto,
          cantidad: item.cantidad || 1,
          precio_unitario: item.precio_unitario,
          precio: item.precio_unitario,
          nombre_producto: item.nombre_producto,
        })),
        tipo_servicio: tipoServicioSeleccionado,
        currency: 'COP',
        description: 'Pedido Sabor',
        buyerEmail: user?.correo_usuario,
        recomendaciones,
      };

      if (tipoServicioSeleccionado === 'domicilio') {
        payload.direccion_entrega = direccionEntrega;
        payload.detalle_direccion = detalleDireccion || '';
      }

      const response = await fetch(`${API_URL}/pagos/formulario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Error al generar formulario de PayU');
      }

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.actionUrl;
      form.style.display = 'none';

      Object.entries(data.formData).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      localStorage.setItem('payuProcessing', 'true');
      localStorage.setItem('payuTimestamp', Date.now().toString());
      localStorage.setItem('payuTipoServicio', tipoServicioSeleccionado);

      if (tipoServicioSeleccionado === 'domicilio') {
        localStorage.setItem('payuDireccionEntrega', direccionEntrega);
        localStorage.setItem('payuDetalleDireccion', detalleDireccion || '');
      }

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error('Error al iniciar pago PayU:', err);
      setModal({
        open: true,
        message: err.message || 'Error al iniciar el pago con PayU. Intenta nuevamente.',
        icon: <GoX className="GoX" />,
        onConfirm: () => setModal(prev => ({ ...prev, open: false })),
      });
    } finally {
      setLoading(false);
    }
  };

  const procesarPago = () => {
    if (cartItems.length === 0) {
      setModal({
        open: true,
        message: 'El carrito está vacío.',
        icon: <GoAlert className="GoAlert" />,
        onConfirm: () => setModal(prev => ({ ...prev, open: false })),
      });
      return;
    }

    if (!isAuthenticated || !user) {
      setModal({
        open: true,
        message: 'Debes iniciar sesión para procesar el pago.',
        icon: <GoAlert className="GoAlert" />,
        onConfirm: () => setModal(prev => ({ ...prev, open: false })),
      });
      return;
    }

    setModal({
      open: true,
      className: 'dialogo-modal--seleccion',
      message: '¿Cómo deseas recibir tu pedido?',
      icon: <GoCreditCard className="icono-grande" />,
      // Pasamos opciones estructuradas para que CarritoUI las renderice como tarjetas
      opciones: [
        {
          id: 'mesa',
          titulo: 'Mesa',
          descripcion: 'Disfruta tu comida en nuestro local',
          icono: <FaUtensils />,
          onClick: () => {
            setModal(prev => ({ ...prev, open: false }));
            solicitarMesa(() => iniciarPagoPayU({ tipoServicioSeleccionado: 'mesa' }));
          },
        },
        {
          id: 'domicilio',
          titulo: 'Domicilio',
          descripcion: 'Llevamos el sabor hasta tu puerta',
          icono: <BsHouse />,
          onClick: () => {
            setModal({
              open: true,
              message: 'Datos para el domicilio',
              icon: <BsHouse className="icono-grande" style={{ color: 'var(--naranja-sabor)' }} />,
              children: (
                <div className="modal-formulario-domicilio">
                  <div className="modal-campo">
                    <label htmlFor="direccion-payu">Dirección de entrega</label>
                    <input
                      type="text"
                      placeholder="Ej: Calle 123 #45-67"
                      id="direccion-payu"
                      className="input-modal"
                      autoFocus
                    />
                  </div>
                  <div className="modal-campo">
                    <label htmlFor="apartamento-payu">Apartamento / Piso / Local</label>
                    <input
                      type="text"
                      placeholder="Opcional"
                      id="apartamento-payu"
                      className="input-modal"
                    />
                  </div>
                </div>
              ),
              confirmText: 'Confirmar envío',
              cancelText: 'Volver',
              onConfirm: async () => {
                const direccion = document.getElementById('direccion-payu')?.value.trim();
                const detalle = document.getElementById('apartamento-payu')?.value.trim();
                if (!direccion) {
                  toast.error('⚠️ Por favor ingresa la dirección');
                  return;
                }
                setModal(prev => ({ ...prev, open: false }));
                await iniciarPagoPayU({
                  tipoServicioSeleccionado: 'domicilio',
                  direccionEntrega: direccion,
                  detalleDireccion: detalle,
                });
              },
              onCancel: () => procesarPago(), // Regresamos al modal de selección
            });
          },
        },
      ],
    });
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
          setModal(prev => ({ ...prev, open: false }));
        } catch (error) {
          setModal({
            open: true,
            message: `Error al eliminar carrito`,
            icon: <GoX className="GoX" />,
            onConfirm: () => setModal(prev => ({ ...prev, open: false })),
          });
        }
      },
      onCancel: () => setModal(prev => ({ ...prev, open: false })),
    });
  };

  const handlePagoEfectivo = () => {
    setModal({
      open: true,
      className: 'dialogo-modal--seleccion',
      message: '¿Cómo deseas recibir tu pedido?',
      icon: <BsCash className="icono-grande" />,
      opciones: [
        {
          id: 'mesa',
          titulo: 'Mesa',
          descripcion: 'Pago en efectivo al finalizar',
          icono: <FaUtensils />,
          onClick: () => {
            setModal(prev => ({ ...prev, open: false }));
            solicitarMesa(async mesaAsignada => {
              try {
                await confirmarPedido({
                  metodo_pago: 'efectivo',
                  tipo_servicio: 'mesa',
                  id_mesa: mesaAsignada,
                });
                localStorage.removeItem('recomendacionesPedido');
                setModal({
                  open: true,
                  message: '¡Pedido confirmado!',
                  icon: (
                    <GoCheck className="icono-grande" style={{ color: 'var(--exito-sabor)' }} />
                  ),
                  children: <p>Tu pedido para la Mesa {mesaAsignada} ha sido registrado.</p>,
                  confirmText: 'Aceptar',
                  onConfirm: () => setModal(m => ({ ...m, open: false })),
                });
              } catch (error) {
                toast.error('Error al confirmar el pedido');
              }
            });
          },
        },
        {
          id: 'domicilio',
          titulo: 'Domicilio',
          descripcion: 'Paga en efectivo al repartidor',
          icono: <BsHouse />,
          onClick: () => {
            setModal({
              open: true,
              message: 'Datos para el domicilio',
              icon: <BsHouse className="icono-grande" style={{ color: 'var(--naranja-sabor)' }} />,
              children: (
                <div className="modal-formulario-domicilio">
                  <div className="modal-campo">
                    <label htmlFor="direccion">Dirección de entrega</label>
                    <input
                      type="text"
                      placeholder="Ej: Calle 123 #45-67"
                      id="direccion"
                      className="input-modal"
                      autoFocus
                    />
                  </div>
                  <div className="modal-campo">
                    <label htmlFor="apartamento">Apartamento / Piso / Local</label>
                    <input
                      type="text"
                      placeholder="Opcional"
                      id="apartamento"
                      className="input-modal"
                    />
                  </div>
                </div>
              ),
              confirmText: 'Confirmar domicilio',
              cancelText: 'Volver',
              onConfirm: async () => {
                try {
                  const direccion = document.getElementById('direccion')?.value.trim();
                  const apartamento = document.getElementById('apartamento')?.value.trim();
                  if (!direccion) {
                    toast.error('⚠️ Por favor ingresa la dirección');
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
                    message: '¡Pedido recibido!',
                    icon: (
                      <GoCheck className="icono-grande" style={{ color: 'var(--exito-sabor)' }} />
                    ),
                    confirmText: 'Aceptar',
                    onConfirm: () => setModal(m => ({ ...m, open: false })),
                  });
                } catch (error) {
                  toast.error('Error al confirmar el pedido');
                }
              },
              onCancel: () => handlePagoEfectivo(),
            });
          },
        },
      ],
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
        onConfirm: () => setModal(prev => ({ ...prev, open: false })),
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
        onConfirm: () => setModal(prev => ({ ...prev, open: false })),
      });
    }
  };

  const handleUpdateMessage = async (id_producto, nuevoMensaje) => {
    try {
      await updateItemMessage(id_producto, nuevoMensaje);
    } catch (error) {
      setModal({
        open: true,
        message: `Error al actualizar mensaje`,
        icon: <GoX className="GoX" />,
        onConfirm: () => setModal(prev => ({ ...prev, open: false })),
      });
    }
  };

  return {
    loading: loading || cartLoading,
    error: error || cartError,
    setError,
    setLoading,
    cartItems,
    recomendaciones,
    modal,
    setModal,
    mesaInput,
    setMesaInput,
    mesaModal,
    mesaError,
    setMesaError,
    obtenerMesaActual,
    cerrarMesaModal,
    confirmarMesaModal,
    solicitarMesa,
    limpiarMesa,
    procesarPago,
    handleEliminarCarrito,
    handlePagoEfectivo,
    handleUpdateQuantity,
    handleRemoveItem,
    handleUpdateMessage,
    t,
  };
};
