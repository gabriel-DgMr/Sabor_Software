import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import ProtectedRoute from './shared/components/ProtectedRoute';
import RoleProtectedRoute from './shared/components/RoleProtectedRoute';
import RoleBasedRedirect from './shared/components/RoleBasedRedirect';
import { AuthProvider } from './app/context/AuthContext.jsx';
import { CartProvider } from './modules/pedidos/context/CartContext.jsx';
import { CategoriaProvider } from './shared/context/CategoriaContext.jsx';
import { ProductoProvider } from './shared/context/ProductoContext.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ActualizarDatos from './modules/usuarios/pages/ActualizarDatos.jsx';
import Login from './modules/auth/pages/Login.jsx';
import Register from './modules/auth/pages/Register.jsx';
import ResetPasswordContainer from './modules/auth/pages/ResetPasswordContainer.jsx';
import Carrito from './modules/pedidos/pages/Carrito.jsx';
import CheckoutPayU from './modules/pedidos/pages/CheckoutPayU.jsx';
// import Checkout from './pages/Checkout.jsx';
import Dashboard from './modules/dashboard/pages/Dashboard.jsx';
import DashboardVentas from './modules/dashboard/pages/DashboardVentas.jsx';
import DashboardClientes from './modules/dashboard/pages/DashboardClientes.jsx';
import DashboardEmpleados from './modules/dashboard/pages/DashboardEmpleados.jsx';
import DashboardInventario from './modules/dashboard/pages/DashboardInventario.jsx';
import HomeAdministrador from './modules/dashboard/pages/HomeAdministrador.jsx';
import EscanearQR from './modules/pedidos/pages/EscanearQR.jsx';
import HistorialPedidos from './modules/pedidos/pages/HistorialPedidos.jsx';
import HistorialReservas from './modules/reservas/pages/HistorialReservas.jsx';
import HistorialDomicilios from './modules/pedidos/pages/HistorialDomicilios.jsx';
import Home from './modules/home/pages/Home.jsx';
import ModificarPedido from './modules/pedidos/pages/ModificarPedido.jsx';
import PaginaNoEncontrada from './shared/components/PaginaNoEncontrada.jsx';
import PedidosAdministrar from './modules/pedidos/pages/PedidosAdministrador.jsx';
import ProductosAdministrar from './modules/productos/pages/ProductosAdministrador.jsx';
import QuienesSomos from './modules/marketing/pages/QuienesSomos.jsx';
import ReservasAdministrar from './modules/reservas/pages/ReservacionesAdministrador.jsx';
import UsuariosAdministrador from './modules/usuarios/pages/UsuariosAdministrador.jsx';
import Reservas from './modules/reservas/pages/Reservas.jsx';
import SobreNosotros from './modules/marketing/pages/SobreNosotros.jsx';
import HomeEmpleados from './modules/dashboard/pages/HomeEmpleados.jsx';
import LoadingScreen from './shared/components/LoadingScreen.jsx';
import ProductosEmpleados from './modules/productos/pages/ProductosEmpleados.jsx';
import DomiciliosEmpleados from './modules/pedidos/pages/DomiciliosEmpleados.jsx';
import PedidosEmpleados from './modules/pedidos/pages/PedidosEmpleados.jsx';
import ReservacionesEmpleados from './modules/reservas/pages/ReservacionesEmpleados.jsx';
import GestionBanners from './modules/dashboard/pages/GestionBanners.jsx';
import Productos from './modules/productos/pages/Productos.jsx';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ProductoProvider>
          <CategoriaProvider>
            <CartProvider>
              <ToastContainer
                position="top-right"
                autoClose={3000}
                limit={4}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
              />
              <Routes>
                {/* Rutas públicas */}
                <Route element={<Home />} path="/" />
                <Route element={<Login />} path="/login" />
                <Route element={<Register />} path="/register" />
                <Route element={<ResetPasswordContainer />} path="/reset-password/:token" />
                <Route element={<Productos />} path="/productos" />
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
                  path="/administrar/panel/usuarios"
                />
                <Route
                  element={
                    <ProtectedRoute>
                      <RoleProtectedRoute allowedRoles={['Administrador']}>
                        <DashboardInventario />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  }
                  path="/administrar/panel/inventario"
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
                <Route
                  element={
                    <ProtectedRoute>
                      <RoleProtectedRoute allowedRoles={['Administrador']}>
                        <GestionBanners />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  }
                  path="/administrador/banners"
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
