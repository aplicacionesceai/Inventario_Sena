import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useRegistros from '../hooks/useRegistros';
import './RegistrosPage.css';

const RegistrosPage = () => {
  const [registros, setRegistros] = useState([]);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [filtros, setFiltros] = useState({
    fecha: '',
    ambiente: '',
    categoria: '',
    subcategoria: ''
  });
  const navigate = useNavigate();
  const { getRegistros, loading, error, loaded } = useRegistros();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getRegistros();
        if (data) setRegistros(data);
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };

    if (!loaded && !loading) {
      loadData();
    }
  }, [getRegistros, loaded, loading]);

  const formatFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="loading">Cargando registros...</div>;
  if (error) return (
    <div className="error-message">
      <h3>Error al cargar registros</h3>
      <p>{error}</p>
      <button onClick={() => window.location.reload()}>Reintentar</button>
    </div>
  );
  const registrosFiltrados = registros.filter(registro => {
    return (
      (!filtros.fecha || registro.fecha_registro.startsWith(filtros.fecha)) &&
      (!filtros.ambiente || registro.ambiente_nombre?.toLowerCase().includes(filtros.ambiente.toLowerCase())) &&
      (!filtros.categoria || registro.categoria_base?.toLowerCase().includes(filtros.categoria.toLowerCase())) &&
      (!filtros.subcategoria || (
        registro.subcategoria_1?.toLowerCase().includes(filtros.subcategoria.toLowerCase()) ||
        registro.subcategoria_2?.toLowerCase().includes(filtros.subcategoria.toLowerCase()) ||
        registro.subcategoria_3?.toLowerCase().includes(filtros.subcategoria.toLowerCase())
      ))
    );
  });
  

  return (
    <div className="registros-container">
      <div className="header-section">
        <h1>Registros de Consumo Energético</h1>
        <button 
          className="btn-nuevo"
          onClick={() => navigate('/registros/nuevo')}
        >
          + Nuevo Registro
        </button>
      </div>

      <div className="filtros-bar">
        <input
          type="date"
          value={filtros.fecha}
          onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
          placeholder="Filtrar por fecha"
        />
        <input
          type="text"
          value={filtros.ambiente}
          onChange={(e) => setFiltros({ ...filtros, ambiente: e.target.value })}
          placeholder="Ambiente"
        />
        <input
          type="text"
          value={filtros.categoria}
          onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
          placeholder="Categoría"
        />
        <input
          type="text"
          value={filtros.subcategoria}
          onChange={(e) => setFiltros({ ...filtros, subcategoria: e.target.value })}
          placeholder="Subcategoría"
        />
      </div>


      <div className="registros-table-container">
        <table className="registros-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Ambiente</th>
              <th>Categoría</th>
              <th>Subcategoría</th>
              <th>Consumo (kWh/mes)</th>
              <th>Imagen</th>

            </tr>
          </thead>
          <tbody>
          {registrosFiltrados.map((registro) => (
              <tr key={registro.id}>
                <td>{formatFecha(registro.fecha_registro)}</td>
                <td>
                  {registro.ambiente_nombre || 'Sin ambiente'}
                  <div className="sede-info">
                    {registro.sede_nombre && `${registro.sede_nombre} • ${registro.centro_nombre}`}
                  </div>
                </td>
                <td>{registro.categoria_base}</td>
                <td>
                  {registro.subcategoria_1}
                  {registro.subcategoria_2 && ` • ${registro.subcategoria_2}`}
                  {registro.subcategoria_3 && ` • ${registro.subcategoria_3}`}
                </td>
                <td className="consumo-cell">
                  <span className="consumo-value">
                    {registro.consumo_kwh_mes?.toFixed(2) || '0.00'}
                  </span>
                </td>
                <td>
                  {[registro.imagen_1, registro.imagen_2].map((img, idx) =>
                    img ? (
                      <img
                        key={idx}
                        src={img.startsWith('http') ? img : `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}${img}`}
                        alt={`Imagen ${idx + 1}`}
                        style={{ width: '100px', margin: '0 5px', borderRadius: '8px', cursor: 'pointer' }}
                        onClick={() => setImagenSeleccionada(img)}
                      />
                    ) : null
                  )}
                </td>


              </tr>
              
            ))}
            {imagenSeleccionada && (
              <div className="modal-overlay" onClick={() => setImagenSeleccionada(null)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <img 
                    src={imagenSeleccionada.startsWith('http') ? imagenSeleccionada : `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}${imagenSeleccionada}`} 
                    alt="Vista ampliada" 
                    style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '8px' }}
                  />
                  <button className="cerrar-btn" onClick={() => setImagenSeleccionada(null)}>Cerrar</button>
                </div>
              </div>
            )}

          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistrosPage;