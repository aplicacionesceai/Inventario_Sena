import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBolt, FaChartLine, FaBuilding, FaUser, FaSync } from 'react-icons/fa';
import useHomeStats from '../hooks/UseHomeStats';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const {
    consumoTotal,
    registrosHoy,
    centrosActivos,
    usuariosActivos,
    loading,
    error,
    lastUpdated,
    refresh
  } = useHomeStats();

  const formatTime = (dateString) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleString('es-CO');
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Cargando estadísticas...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <p>Error al cargar datos: {error}</p>
      <button onClick={refresh} className="btn-retry">
        <FaSync /> Reintentar
      </button>
    </div>
  );

  const stats = [
    { 
      title: "Consumo Total", 
      value: `${consumoTotal.toLocaleString('es-CO')} kWh`, 
      icon: <FaBolt />, 
      className: "stat-card blue" 
    },
    { 
      title: "Registros Hoy", 
      value: registrosHoy.toLocaleString('es-CO'), 
      icon: <FaChartLine />, 
      className: "stat-card green" 
    },
    { 
      title: "Centros Activos", 
      value: centrosActivos.toLocaleString('es-CO'), 
      icon: <FaBuilding />, 
      className: "stat-card purple" 
    },
    { 
      title: "Usuarios Activos", 
      value: usuariosActivos.toLocaleString('es-CO'), 
      icon: <FaUser />, 
      className: "stat-card yellow" 
    }
  ];

  return (
    <div className="home-container">
      <div className="header-section">
        <h1 className="home-title">Panel de Control Energético</h1>
        <div className="last-updated">
          <small>Actualizado: {formatTime(lastUpdated)}</small>
          <button onClick={refresh} className="btn-refresh">
            <FaSync /> Actualizar
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={stat.className}>
            <div>
              <p className="stat-title">{stat.title}</p>
              <p className="stat-value">{stat.value}</p>
            </div>
            <span className="stat-icon">{stat.icon}</span>
          </div>
        ))}
      </div>

      <div className="quick-actions">
        <h2>Acciones Rápidas</h2>
        <div className="button-group">
          <button onClick={() => navigate('/registros/nuevo')} className="btn blue">
            <FaBolt /> Nuevo Registro
          </button>
          <button onClick={() => navigate('/registros')} className="btn green">
            <FaChartLine /> Ver Todos
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;