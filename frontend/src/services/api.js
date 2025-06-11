import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true, // para enviar cookies y permitir CORS con credenciales si usas sesiones
});

// Interceptor para añadir token automáticamente si existe
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

// Función para login (puedes importar y usar directamente en contexto)
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login/', credentials);
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('userData', JSON.stringify(response.data.user));
    api.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  delete api.defaults.headers.common['Authorization'];
};

export default api;
