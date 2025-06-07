import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/carrito.css";
import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';

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
  const [formData, setFormData] = useState({
    nombre: "",
    numero: "",
    fecha: "",
    cvv: "",
    direccion: "",
  });
  
  useEffect(() => {
    document.title = 'Sabor: Checkout';
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica de procesamiento del pago
    alert('¡Pago procesado con éxito!');
    navigate('/');
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
                  type="text" 
                  id="nombre" 
                  required 
                  value={formData.nombre}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="checkout_grupo">
                <label htmlFor="numero">Número de tarjeta</label>
                <input 
                  type="text" 
                  id="numero" 
                  required 
                  maxLength="19"
                  placeholder="1234 5678 9012 3456"
                  value={formData.numero}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="checkout_fila">
                <div className="checkout_grupo">
                  <label htmlFor="fecha">Fecha de expiración</label>
                  <input 
                    type="text" 
                    id="fecha" 
                    required 
                    maxLength="5"
                    placeholder="MM/YY"
                    value={formData.fecha}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="checkout_grupo">
                  <label htmlFor="cvv">CVV</label>
                  <input 
                    type="text" 
                    id="cvv" 
                    required 
                    pattern="[0-9]{3,4}" 
                    placeholder="123"
                    value={formData.cvv}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="checkout_grupo">
                <label htmlFor="direccion">Dirección de facturación</label>
                <input 
                  type="text" 
                  id="direccion" 
                  required
                  value={formData.direccion}
                  onChange={handleInputChange}
                />
              </div>
              
              <button type="submit" className="checkout_btn_pagar">
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
                <div className="checkout_tarjeta_guardada" key={tarjeta.id}>
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
                  <img src="/images/visa.png" alt="Visa" />
                  <span>Visa</span>
                </button>
                <button className="checkout_metodo_opcion mastercard">
                  <img src="/images/mastercard.png" alt="Mastercard" />
                  <span>Mastercard</span>
                </button>
                <button className="checkout_metodo_opcion paypal">
                  <img src="/images/paypal.png" alt="PayPal" />
                  <span>PayPal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 