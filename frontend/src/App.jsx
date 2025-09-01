import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './context/CartContext.jsx';
import { CategoriaProvider } from './context/CategoriaContext.jsx';
import { ProductoProvider } from './context/ProductoContext.jsx';
import ActualizarDatos from './pages/ActualizarDatos.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import ResetPasswordContainer from './pages/auth/ResetPasswordContainer.jsx';
import Carrito from './pages/carrito.jsx';
import Checkout from './pages/Checkout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DashboardVentas from './pages/DashboardVentas.jsx';
import HomeAdministrador from './pages/HomeAdministrador.jsx';
import EscanearQR from './pages/EscanearQR.jsx';
import HistorialPedidos from './pages/HistorialPedidos.jsx';
import HistorialReservas from './pages/HistorialReservas.jsx';
import Home from './pages/Home.jsx';
import ModificarPedido from './pages/ModificarPedido.jsx';
import PaginaNoEncontrada from './pages/PaginaNoEncontrada.jsx';
import PedidosAdministrar from './pages/pedidosadministrar.jsx';
import ProductosAdministrar from './pages/ProductosAdministrar.jsx';
import QuienesSomos from './pages/QuienesSomos.jsx';
import ReservasAdministrar from './pages/ReservacionesAdministrar.jsx';
import Reservas from './pages/Reservas.jsx';
import SobreNosotros from './pages/SobreNosotros.jsx';
import HomeEmpleados from './pages/HomeEmpleados.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';

// Componente de diagnóstico temporal
const DiagnosticComponent = () => {
  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f0f0f0',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
      }}
    >
      <h1>🚀 Sabor - Diagnóstico</h1>
      <p>Si puedes ver este mensaje, React está funcionando correctamente.</p>
      <p>Fecha: {new Date().toLocaleString()}</p>
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => (window.location.href = '/')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Ir a la página principal
        </button>
      </div>
    </div>
  );
};

// Componente de prueba simple
const TestComponent = () => {
  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#e8f5e8',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
      }}
    >
      <h1>✅ React funcionando correctamente</h1>
      <p>Este es un componente de prueba simple sin contextos.</p>
      <p>Si puedes ver esto, el problema está en algún contexto específico.</p>
    </div>
  );
};

function App() {
  return (
    <HelmetProvider>
      <Routes>
        {/* Ruta de prueba simple */}
        <Route element={<TestComponent />} path="/test" />

        {/* Ruta de diagnóstico temporal */}
        <Route element={<DiagnosticComponent />} path="/diagnostico" />

        {/* Rutas con contextos */}
        <Route
          element={
            <ProductoProvider>
              <CategoriaProvider>
                <CartProvider>
                  <Routes>
                    {/* Rutas públicas */}
                    <Route element={<Home />} path="/" />
                    <Route element={<Login />} path="/login" />
                    <Route element={<Register />} path="/register" />
                    <Route element={<ResetPasswordContainer />} path="/reset-password/:token" />
                    <Route element={<Reservas />} path="/reservas" />
                    <Route element={<Carrito />} path="/carrito" />
                    <Route element={<Checkout />} path="/checkout" />
                    <Route element={<ModificarPedido />} path="/carrito/modificar/:id" />
                    <Route element={<QuienesSomos />} path="/quienes-somos" />
                    <Route element={<SobreNosotros />} path="/sobre-nosotros" />
                    <Route element={<EscanearQR />} path="/escanear-qr" />
                    <Route element={<LoadingScreen />} path="/loading-screen" />
                    {/* Rutas protegidas */}
                    <Route
                      element={
                        <ProtectedRoute>
                          <HomeAdministrador />
                        </ProtectedRoute>
                      }
                      path="/HomeAdministrador"
                    />
                    <Route
                      element={
                        <ProtectedRoute>
                          <HomeEmpleados />
                        </ProtectedRoute>
                      }
                      path="/HomeEmpleados"
                    />
                    <Route
                      element={
                        <ProtectedRoute>
                          <ProductosAdministrar />
                        </ProtectedRoute>
                      }
                      path="/administrar/productos"
                    />
                    <Route
                      element={
                        <ProtectedRoute>
                          <PedidosAdministrar />
                        </ProtectedRoute>
                      }
                      path="/administrar/pedidos"
                    />
                    <Route
                      element={
                        <ProtectedRoute>
                          <ReservasAdministrar />
                        </ProtectedRoute>
                      }
                      path="/administrar/reservaciones"
                    />
                    <Route
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                      path="/administrar/panel"
                    />
                    <Route
                      element={
                        <ProtectedRoute>
                          <DashboardVentas />
                        </ProtectedRoute>
                      }
                      path="/administrar/panel/ventas"
                    />
                    <Route
                      element={
                        <ProtectedRoute>
                          <ActualizarDatos />
                        </ProtectedRoute>
                      }
                      path="/actualizar-datos"
                    />
                    <Route
                      element={
                        <ProtectedRoute>
                          <HistorialPedidos />
                        </ProtectedRoute>
                      }
                      path="/historial-pedidos"
                    />
                    <Route
                      element={
                        <ProtectedRoute>
                          <HistorialReservas />
                        </ProtectedRoute>
                      }
                      path="/historial-reservas"
                    />
                    <Route element={<PaginaNoEncontrada />} path="*" />
                  </Routes>
                </CartProvider>
              </CategoriaProvider>
            </ProductoProvider>
          }
          path="/*"
        />
      </Routes>
    </HelmetProvider>
  );
}

export default App;
