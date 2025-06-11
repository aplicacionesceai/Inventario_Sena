import { useState, useCallback } from 'react';
import api from '../services/api';

const useRegistros = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const getRegistros = useCallback(async () => {
    if (loaded) return null;
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/registros/');
      setLoaded(true);
      return response.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loaded]);

  const createRegistro = async (registroData) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Crear ambiente primero
      const ambienteRes = await api.post('/ambientes/', {
        sede: registroData.ambiente.sede,
        bloque: registroData.ambiente.bloque,
        piso: registroData.ambiente.piso,
        tipo_ambiente: registroData.ambiente.tipo_ambiente,
        nombre: registroData.ambiente.nombre
      });
      
      // 2. Crear registro con el ID del ambiente
      const registroPayload = {
        ...registroData,
        ambiente: ambienteRes.data.id
      };
      
      const registroRes = await api.post('/registros/', registroPayload);
      return registroRes.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoaded(false);
    setError(null);
  };

  return {
    loading,
    error,
    getRegistros,
    loaded,
    reset,
    createRegistro
  };
};




export default useRegistros;