import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/carrito.css";
import DialogoModal from '../components/DialogoExito.jsx';
import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';
import { useCart } from '../context/useCart.js';
const API_URL = 'http://localhost:3000/api';

// Datos de ejemplo de tarjetas guardadas
const tarjetasGuardadas = [
  {
    id: 1,
    tipo: "Visa",
    numero: "4112 2031 1142 1234",
    nombre: "Juan Pérez",
    fecha: "12/25",
    direccion: "Av. Principal 123, Medellín",
  },
  {
    id: 2,
    tipo: "Mastercard",
    numero: "5234 3012 6789 0123",
    nombre: "María García",
    fecha: "08/24",
    direccion: "Av. Los Pinos 456, Bogotá",
  },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const [formData, setFormData] = useState({
    nombre: "",
    numero: "",
    fecha: "",
    cvv: "",
    direccion: "",
  });
  const [modal, setModal] = useState({ open: false, message: '', icon: '✅', onConfirm: null });
  const [intentos, setIntentos] = useState(0);
  
  useEffect(() => {
    document.title = 'Sabor: Checkout';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setModal({
        open: true,
        message: 'El carrito está vacío.',
        icon: '⚠️',
        onConfirm: () => setModal({ ...modal, open: false })
      });
      return;
    }
    
    // Simular pago (éxito 60%, fallo 40%)
    const pagoExitoso = Math.random() < 0.6;
    if (pagoExitoso) {
      // Crear pedido en backend
      try {
        const token = localStorage.getItem('token');
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
          throw new Error('Error al guardar el pedido en la base de datos');
        }
        clearCart();
        localStorage.removeItem('recomendacionesPedido');
        setModal({
          open: true,
          message: '¡Pago procesado con éxito! Tu pedido ha sido enviado a la cocina.',
          icon: '✅',
          onConfirm: () => {
            setModal({ ...modal, open: false });
            navigate('/');
          }
        });
      } catch (_) {
        setModal({
          open: true,
          message: 'Error al guardar el pedido en la base de datos.',
          icon: '❌',
          onConfirm: () => setModal({ ...modal, open: false })
        });
      }
    } else {
      // Pago fallido
      if (intentos < 2) {
        setModal({
          open: true,
          message: 'El pago ha fallado. ¿Deseas reintentar?',
          icon: '❌',
          confirmText: 'Reintentar',
          cancelText: 'Cancelar',
          onConfirm: () => {
            setModal({ ...modal, open: false });
            setIntentos(intentos + 1);
          },
          onCancel: () => {
            setModal({ ...modal, open: false });
            preguntarGuardarPedido();
          }
        });
      } else {
        preguntarGuardarPedido();
      }
    }
  };

  const preguntarGuardarPedido = () => {
    setModal({
      open: true,
      message: '¿Deseas guardar tu pedido como pendiente?',
      icon: '❓',
      confirmText: 'Guardar',
      cancelText: 'Cancelar pedido',
      onConfirm: () => {
        guardarPedidoPendiente();
      },
      onCancel: () => {
        setModal({ ...modal, open: false });
        clearCart();
        localStorage.removeItem('recomendacionesPedido');
        setTimeout(() => {
          setModal({
            open: true,
            message: 'Pedido cancelado por el usuario.',
            icon: '🗑️',
            onConfirm: () => {
              setModal({ ...modal, open: false });
              navigate('/');
            }
          });
        }, 300);
      }
    });
  };

  const guardarPedidoPendiente = async () => {
    try {
      const token = localStorage.getItem('token');
      const itemsParaBackend = cartItems.map(item => ({
        id_producto: Number(item.id),
        cantidad: Number(item.quantity) || 1,
        precio_unitario: Number(item.precio)
      }));
      const totalCarrito = cartItems.reduce((sum, item) => sum + item.precio * (item.quantity || 1), 0);
      const recomendacionesPedido = localStorage.getItem('recomendacionesPedido') || '';
      const nuevoPedido = {
        items: itemsParaBackend,
        total: totalCarrito,
        recomendaciones: recomendacionesPedido,
        status: 'pendiente'
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
        throw new Error('Error al guardar el pedido como pendiente');
      }
      clearCart();
      localStorage.removeItem('recomendacionesPedido');
      setModal({
        open: true,
        message: 'Pedido guardado como pendiente. Puedes retomarlo más tarde.',
        icon: '⏳',
        onConfirm: () => {
          setModal({ ...modal, open: false });
          navigate('/');
        }
      });
    } catch (_) {
      setModal({
        open: true,
        message: 'Error al guardar el pedido como pendiente.',
        icon: '❌',
        onConfirm: () => setModal({ ...modal, open: false })
      });
    }
  };

  const formatNumeroTarjeta = (numero) => {
    // Eliminar todos los espacios y caracteres no numéricos
    const soloNumeros = numero.replace(/\D/g, '');
    // Agregar un espacio cada 4 dígitos
    const numeroFormateado = soloNumeros.replace(/(\d{4})(?=\d)/g, '$1 ');
    // Limitar a 19 caracteres (16 números + 3 espacios)
    return numeroFormateado.slice(0, 19);
  };

  const formatFecha = (fecha) => {
    // Eliminar caracteres no numéricos
    const soloNumeros = fecha.replace(/\D/g, '');
    
    // Si tenemos 2 o más dígitos, agregar el "/"
    if (soloNumeros.length >= 2) {
      return soloNumeros.slice(0, 2) + '/' + soloNumeros.slice(2, 4);
    }
    
    return soloNumeros;
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    
    if (id === 'numero') {
      // Formatear el número de tarjeta mientras se escribe
      const numeroFormateado = formatNumeroTarjeta(value);
      setFormData(prev => ({
        ...prev,
        [id]: numeroFormateado
      }));
    } else if (id === 'fecha') {
      // Formatear la fecha mientras se escribe
      const fechaFormateada = formatFecha(value);
      setFormData(prev => ({
        ...prev,
        [id]: fechaFormateada
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [id]: value
      }));
    }
  };

  const usarTarjetaGuardada = (tarjeta) => {
    setFormData({
      nombre: tarjeta.nombre,
      numero: tarjeta.numero,
      fecha: tarjeta.fecha,
      cvv: "",  // Por seguridad, nunca guardamos ni autocompletamos el CVV
      direccion: tarjeta.direccion,
    });
  };

  return (
    <>
      <Header />
      <main className="carrito_bg">
        <div>
          <button 
            className="carrito_btn_regresar"
            onClick={() => navigate('/carrito')}
          >
            Regresar
          </button>
        </div>
        <h1 className="carrito_titulo">Pago</h1>
        <div className="checkout_contenedor">
          <div className="checkout_formulario">
            <h2>Información de Pago</h2>
            <form onSubmit={handleSubmit}>
              <div className="checkout_grupo">
                <label htmlFor="nombre">Nombre en la tarjeta</label>
                <input 
                  required 
                  id="nombre" 
                  type="text" 
                  value={formData.nombre}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="checkout_grupo">
                <label htmlFor="numero">Número de tarjeta</label>
                <input 
                  required 
                  id="numero" 
                  maxLength="19" 
                  placeholder="1234 5678 9012 3456"
                  type="text"
                  value={formData.numero}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="checkout_fila">
                <div className="checkout_grupo">
                  <label htmlFor="fecha">Fecha de expiración</label>
                  <input 
                    required 
                    id="fecha" 
                    maxLength="5" 
                    placeholder="MM/YY"
                    type="text"
                    value={formData.fecha}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="checkout_grupo">
                  <label htmlFor="cvv">CVV</label>
                  <input 
                    required 
                    id="cvv" 
                    pattern="[0-9]{3,4}" 
                    placeholder="123" 
                    type="text"
                    value={formData.cvv}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="checkout_grupo">
                <label htmlFor="direccion">Dirección de facturación</label>
                <input 
                  required 
                  id="direccion" 
                  type="text"
                  value={formData.direccion}
                  onChange={handleInputChange}
                />
              </div>
              
              <button className="checkout_btn_pagar" type="submit">
                Confirmar Pago
              </button>
            </form>
          </div>
          
          <div className="checkout_lateral">
            <div className="checkout_resumen">
              <h2>Resumen del Pedido</h2>
              <div className="checkout_detalles">
                <div className="checkout_item">
                  <span>Subtotal</span>
                  <span>$120.000</span>
                </div>
                <div className="checkout_item">
                  <span>Impuestos</span>
                  <span>$10.800</span>
                </div>
                <div className="checkout_total">
                  <span>Total</span>
                  <span>$130.800</span>
                </div>
              </div>
            </div>

            <div className="checkout_metodos_guardados">
              <h2>Métodos de Pago Guardados</h2>
              {tarjetasGuardadas.map((tarjeta) => (
                <div key={tarjeta.id} className="checkout_tarjeta_guardada">
                  <div className="checkout_tarjeta_info">
                    <span className="checkout_tarjeta_tipo">{tarjeta.tipo}</span>
                    <span className="checkout_tarjeta_numero">
                      **** **** **** {tarjeta.numero.slice(-4)}
                    </span>
                  </div>
                  <button 
                    className="checkout_btn_usar"
                    onClick={() => usarTarjetaGuardada(tarjeta)}
                  >
                    Usar
                  </button>
                </div>
              ))}
            </div>

            <div className="checkout_otros_metodos">
              <h2>Otros Métodos de Pago</h2>
              <div className="checkout_metodos_lista">
                <button className="checkout_metodo_opcion visa">
                  <img alt="Visa" src="/images/visa.png" />
                  <span>Visa</span>
                </button>
                <button className="checkout_metodo_opcion mastercard">
                  <img alt="Mastercard" src="/images/mastercard.png" />
                  <span>Mastercard</span>
                </button>
                <button className="checkout_metodo_opcion paypal">
                  <img alt="PayPal" src="/images/paypal.png" />
                  <span>PayPal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <DialogoModal {...modal} />
    </>
  );
} 