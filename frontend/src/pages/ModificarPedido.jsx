import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/carrito.css';
import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';
import { useCart } from '../context/useCart.js';

const ModificarPedido = () => {
  const navigate = useNavigate();
  const { cartItems, removeItemFromCart } = useCart();
  const [recomendaciones, setRecomendaciones] = useState('');

  useEffect(() => {
    // Recuperar recomendaciones guardadas si existen
    const recomendacionesGuardadas = localStorage.getItem('recomendacionesPedido');
    if (recomendacionesGuardadas) {
      setRecomendaciones(recomendacionesGuardadas);
    }
  }, []);

  const eliminarItem = (index) => {
    removeItemFromCart(index);
  };

  const agregarProducto = () => {
    navigate('/');
  };

  const confirmarCambios = () => {
    // Guardar recomendaciones en localStorage solo para este pedido
    localStorage.setItem('recomendacionesPedido', recomendaciones);
    navigate('/carrito');
  };

  return (
    <>
      <Header />
      <main className="carrito_bg">
        <h1 className="carrito_titulo">Modificar pedido</h1>
        <div className="carrito_contenido">
          <div className="carrito_pedidos">
            {cartItems.map((item, index) => (
              <div key={index} className="carrito_pedido">
                <div className="carrito_pedido_info">
                  <div className="carrito_pedido_titulo">{item.nombre}</div>
                  <div className="carrito_pedido_precio">
                    {item.precio.toLocaleString('es-CO')} COP
                  </div>
                </div>
                <button
                  className="carrito_btn eliminar"
                  onClick={() => eliminarItem(index)}
                >
                  🗑️ Eliminar
                </button>
              </div>
            ))}

            <div className="carrito_pedido" style={{ padding: '20px' }}>
              <div className="carrito_pedido_info" style={{ width: '100%' }}>
                <div className="carrito_pedido_titulo" style={{ marginBottom: '10px' }}>
                  Información adicional o recomendaciones para este pedido
                </div>
                <textarea
                  placeholder="Escribe aquí tus recomendaciones o información adicional para este pedido específico"
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                  value={recomendaciones}
                  onChange={(e) => setRecomendaciones(e.target.value)}
                />
              </div>
            </div>

            <button
              className="carrito_btn modificar"
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '15px',
                fontSize: '1.2rem'
              }}
              onClick={agregarProducto}
            >
              + Agregar producto
            </button>
            <div className='modificar__botones--pagarregresar'>
              <button
                className="carrito_btn__pagar"
                onClick={confirmarCambios}
              >
                Confirmar cambios
              </button>
              <button
                className="carrito_btn__regresar"
                onClick={() => navigate('/carrito')}
              >
                Regresar
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ModificarPedido; 