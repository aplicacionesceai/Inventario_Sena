import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    loading: true,
    error: null
  });

  // Mueve logout a useCallback para memoización
  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setAuthState({
      user: null,
      loading: false,
      error: null
    });
  }, []);

  const login = async (credentials) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const response = await api.post('/auth/login/', credentials);
      
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      
      setAuthState({
        user: response.data.user,
        loading: false,
        error: null
      });
      
      return true;
    } catch (error) {
      setAuthState({
        user: null,
        loading: false,
        error: error.response?.data?.error || "Error al iniciar sesión"
      });
      return false;
    }
  };

  // verifyAuth ahora usa useCallback y recibe logout como dependencia
  const verifyAuth = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const response = await api.get('/auth/verify/');
      setAuthState({
        user: response.data.user,
        loading: false,
        error: null
      });
    } catch (error) {
      logout(); // Ahora está correctamente referenciado
    }
  }, [logout]);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]); // Solo depende de verifyAuth

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      isAuthenticated: !!authState.user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};