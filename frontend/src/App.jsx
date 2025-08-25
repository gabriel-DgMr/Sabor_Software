import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet, HelmetProvider } from 'react-helmet-async';

import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
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
import LoadingScreen from './components/LoadingScreen.jsx';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
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
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
