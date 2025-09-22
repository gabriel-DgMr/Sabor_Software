import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { CategoriaProvider } from './context/CategoriaContext.jsx';
import { ProductoProvider } from './context/ProductoContext.jsx';

import ActualizarDatos from './pages/ActualizarDatos.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import ResetPasswordContainer from './pages/auth/ResetPasswordContainer.jsx';
import Carrito from './pages/carrito.jsx';
import CheckoutPayU from './pages/CheckoutPayU.jsx';
// import Checkout from './pages/Checkout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DashboardVentas from './pages/DashboardVentas.jsx';
import DashboardClientes from './pages/DashboardClientes.jsx';
import DashboardEmpleados from './pages/DashboardEmpleados.jsx';
import HomeAdministrador from './pages/HomeAdministrador.jsx';
import EscanearQR from './pages/EscanearQR.jsx';
import HistorialPedidos from './pages/HistorialPedidos.jsx';
import HistorialReservas from './pages/HistorialReservas.jsx';
import MisCalificaciones from './pages/MisCalificaciones.jsx';
import HistorialDomicilios from './pages/HistorialDomicilios.jsx';
import Home from './pages/Home.jsx';
import ModificarPedido from './pages/ModificarPedido.jsx';
import PaginaNoEncontrada from './pages/PaginaNoEncontrada.jsx';
import PedidosAdministrar from './pages/PedidosAdministrador.jsx';
import ProductosAdministrar from './pages/ProductosAdministrador.jsx';
import QuienesSomos from './pages/QuienesSomos.jsx';
import ReservasAdministrar from './pages/ReservacionesAdministrador.jsx';
import UsuariosAdministrador from './pages/UsuariosAdministrador.jsx';
import Reservas from './pages/Reservas.jsx';
import SobreNosotros from './pages/SobreNosotros.jsx';
import HomeEmpleados from './pages/HomeEmpleados.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import ProductosEmpleados from './pages/ProductosEmpleados.jsx';
import DomiciliosEmpleados from './pages/DomiciliosEmpleados.jsx';
import PedidosEmpleados from './pages/PedidosEmpleados.jsx';
import ReservacionesEmpleados from './pages/ReservacionesEmpleados.jsx';

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

                {/* Ruta de redirección automática basada en roles */}
                <Route element={<RoleBasedRedirect />} path="/redirect" />
                <Route element={<Reservas />} path="/reservas" />
                <Route element={<Carrito />} path="/carrito" />
                <Route element={<CheckoutPayU />} path="/checkout" />
                {/* <Route element={<Checkout />} path="/checkout" /> */}
                <Route element={<ModificarPedido />} path="/carrito/modificar/:id" />
                <Route element={<QuienesSomos />} path="/quienes-somos" />
                <Route element={<SobreNosotros />} path="/sobre-nosotros" />
                <Route element={<EscanearQR />} path="/escanear-qr" />
                <Route element={<LoadingScreen />} path="/loading-screen" />

                {/* ------------------- Rutas protegidas ------------------- */}

                {/* Administrador */}
                <Route
                  element={
                    <ProtectedRoute>
                      <RoleProtectedRoute allowedRoles={['Administrador']}>
                        <HomeAdministrador />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  }
                  path="/HomeAdministrador"
                />
                <Route
                  element={
                    <ProtectedRoute>
                      <RoleProtectedRoute allowedRoles={['Administrador']}>
                        <Dashboard />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  }
                  path="/administrador/panel"
                />
                <Route
                  element={
                    <ProtectedRoute>
                      <RoleProtectedRoute allowedRoles={['Administrador']}>
                        <DashboardVentas />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  }
                  path="/administrar/panel/ventas"
                />
                <Route
                  element={
                    <ProtectedRoute>
                      <RoleProtectedRoute allowedRoles={['Administrador']}>
                        <DashboardClientes />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  }
                  path="/administrar/panel/clientes"
                />
                <Route
                  element={
                    <ProtectedRoute>
                      <RoleProtectedRoute allowedRoles={['Administrador']}>
                        <DashboardEmpleados />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  }
                  path="/administrar/panel/trabajadores"
                />
                <Route
                  element={
                    <ProtectedRoute>
                      <RoleProtectedRoute allowedRoles={['Administrador']}>
                        <UsuariosAdministrador />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  }
                  path="/administrador/usuarios"
                />
                <Route
                  element={
                    <ProtectedRoute>
                      <RoleProtectedRoute allowedRoles={['Administrador']}>
                        <ProductosAdministrar />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  }
                  path="/administrador/productos"
                />
                <Route
                  element={
                    <ProtectedRoute>
                      <RoleProtectedRoute allowedRoles={['Administrador']}>
                        <PedidosAdministrar />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  }
                  path="/administrador/pedidos"
                />
                <Route
                  element={
                    <ProtectedRoute>
                      <RoleProtectedRoute allowedRoles={['Administrador']}>
                        <ReservasAdministrar />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  }
                  path="/administrador/reservaciones"
                />
                <Route
                  element={
                    <ProtectedRoute>
                      <RoleProtectedRoute allowedRoles={['Administrador']}>
                        <DomiciliosEmpleados />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  }
                  path="/administrador/domicilios"
                />

                {/* Empleados */}
                <Route
                  element={
                    <ProtectedRoute>
                      <RoleProtectedRoute allowedRoles={['Empleado']}>
                        <HomeEmpleados />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  }
                  path="/HomeEmpleados"
                />
                <Route
                  element={
                    <ProtectedRoute>
                      <RoleProtectedRoute allowedRoles={['Empleado']}>
                        <ProductosEmpleados />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  }
                  path="/empleado/productos"
                />
                <Route
                  element={
                    <ProtectedRoute>
                      <RoleProtectedRoute allowedRoles={['Empleado']}>
                        <DomiciliosEmpleados />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  }
                  path="/empleado/domicilios"
                />
                <Route
                  element={
                    <ProtectedRoute>
                      <RoleProtectedRoute allowedRoles={['Empleado']}>
                        <PedidosEmpleados />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  }
                  path="/empleado/pedidos"
                />
                <Route
                  element={
                    <ProtectedRoute>
                      <RoleProtectedRoute allowedRoles={['Empleado']}>
                        <ReservacionesEmpleados />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  }
                  path="/empleado/reservaciones"
                />

                {/* Usuario autenticado */}
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
                <Route
                  element={
                    <ProtectedRoute>
                      <MisCalificaciones />
                    </ProtectedRoute>
                  }
                  path="/mis-calificaciones"
                />
                <Route
                  element={
                    <ProtectedRoute>
                      <HistorialDomicilios />
                    </ProtectedRoute>
                  }
                  path="/historial-domicilios"
                />

                {/* Ruta 404 */}
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
