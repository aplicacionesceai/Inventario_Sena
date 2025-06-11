// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AuthVerify from './components/auth/AuthVerify';
import ProtectedLayout from './components/auth/ProtectedLayout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import LoadingSpinner from './components/common/LoadingSpinner'; // Componente opcional

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />; // O <div>Cargando...</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? 
              <LoginPage /> : 
              <Navigate to="/" replace />
          } 
        />

        {/* Rutas protegidas */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<HomePage />} />
          {/* Agrega aquí todas tus rutas protegidas */}
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          {/* <Route path="/registros" element={<RegistrosPage />} /> */}
        </Route>

        {/* Redirección para rutas no encontradas */}
        <Route 
          path="*" 
          element={
            <Navigate to={isAuthenticated ? "/" : "/login"} replace />
          } 
        />
      </Routes>

      {/* Componente que verifica autenticación en cada cambio de ruta */}
      <AuthVerify />
    </BrowserRouter>
  );
}

export default App;