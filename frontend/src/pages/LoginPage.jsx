import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setErrorMsg('');

    try {
      const success = await login({ username, password });
      if (success) {
        console.log('✅ Login exitoso, redirigiendo...');
        navigate('/');
      } else {
        setErrorMsg('Usuario o contraseña incorrectos');
      }
    } catch (error) {
      console.error('❌ Error de autenticación:', error);
      setErrorMsg('Error en el servidor o conexión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="login-title">Iniciar Sesión</h2>

        {errorMsg && <p className="error">{errorMsg}</p>}

        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={cargando}>
          {cargando ? 'Cargando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default Login;
