import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Ajusta la ruta según tu estructura

const AuthVerify = () => {
  const { logout } = useAuth(); // Ahora se usa la variable
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token && location.pathname !== '/login') {
      logout();
      navigate('/login');
    }
  }, [location, navigate, logout]);

  return null;
};

export default AuthVerify;