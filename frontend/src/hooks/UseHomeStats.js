import { useState, useEffect } from 'react';
import api from '../services/api';

const useHomeStats = () => {
  const [stats, setStats] = useState({
    consumoTotal: 0,
    registrosHoy: 0,
    centrosActivos: 0,
    usuariosActivos: 0,
    loading: true,
    error: null,
    lastUpdated: null
  });

  const fetchStats = async () => {
    setStats(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await api.get('/estadisticas/home/');
      
      if (response.data.error) {
        throw new Error(response.data.detail || 'Error en el servidor');
      }
      
      setStats({
        consumoTotal: response.data.consumo_total || 0,
        registrosHoy: response.data.registros_hoy || 0,
        centrosActivos: response.data.centros_activos || 0,
        usuariosActivos: response.data.usuarios_activos || 0,
        lastUpdated: response.data.ultima_actualizacion || null,
        loading: false,
        error: null
      });
      
    } catch (err) {
      setStats(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Error al cargar estadísticas'
      }));
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Actualizar cada 5 minutos (opcional)
    const interval = setInterval(fetchStats, 300000);
    return () => clearInterval(interval);
  }, []);

  return { ...stats, refresh: fetchStats };
};

export default useHomeStats;