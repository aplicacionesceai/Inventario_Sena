import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/common/Layout';
import Home from './pages/Home';
import RegistrosPage from './pages/RegistrosPage';
import NuevoRegistro from './pages/NuevoRegistro';
import EditarRegistro from './pages/EditarRegistro';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/common/PrivateRoute';
import AuthVerify from './components/common/AuthVerify';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Ruta pública sin layout */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas protegidas */}
        <Route element={<PrivateRoute />}>
          {/* Layout solo dentro de rutas protegidas */}
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/registros" element={<RegistrosPage />} />
            <Route path="/registros/nuevo" element={<NuevoRegistro />} />
            <Route path="/registros/:id/editar" element={<EditarRegistro />} />
          </Route>
        </Route>

        {/* Redirección desde la raíz */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Página no encontrada */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>

      <AuthVerify />
    </AuthProvider>
  );
}

export default App;
