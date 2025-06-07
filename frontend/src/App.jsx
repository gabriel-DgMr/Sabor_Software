import React from 'react';
import { Route, Routes } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext.jsx';
import { CategoriaProvider } from './context/CategoriaContext.jsx';
import { ProductoProvider } from './context/ProductoContext.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import ResetPasswordContainer from './pages/auth/ResetPasswordContainer.jsx';
import Carrito from './pages/carrito.jsx';
import Checkout from './pages/Checkout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DashboardVentas from './pages/DashboardVentas.jsx';
import EmpleadosHome from './pages/EmpleadosHome.jsx';
import Home from './pages/Home.jsx';
import ModificarPedido from './pages/ModificarPedido.jsx';
import PedidosAdministrar from './pages/PedidosAdministrar.jsx';
import ProductosAdministrar from './pages/ProductosAdministrar.jsx';
import ReservasAdministrar from './pages/ReservacionesAdministrar.jsx';
import Reservas from './pages/Reservas.jsx';

function App() {
  return (
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
              <Route element={<ModificarPedido />} path="/carrito/modificar/:id"/>
              

              {/* Rutas protegidas */}
              <Route
                element={
                  <ProtectedRoute>
                    <EmpleadosHome />
                  </ProtectedRoute>
                }
                path="/homeempleados"
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
            </Routes>
          </CartProvider>
        </CategoriaProvider>
      </ProductoProvider>
    </AuthProvider>
  );
}

export default App;
