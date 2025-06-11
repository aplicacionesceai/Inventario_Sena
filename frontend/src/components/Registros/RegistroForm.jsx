import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const RegistroForm = ({ registroExistente, onSuccess }) => {
  const navigate = useNavigate();
  const [ambientes, setAmbientes] = useState([]);

  const initialFormData = {
    ambiente: registroExistente?.ambiente?.id || '',
    categoria_base: registroExistente?.categoria_base || '',
    subcategoria_1: registroExistente?.subcategoria_1 || 'General',
    subcategoria_2: registroExistente?.subcategoria_2 || '',
    subcategoria_3: registroExistente?.subcategoria_3 || '',
    refrigerante: registroExistente?.refrigerante || '',
    tipo_aire: registroExistente?.tipo_aire || '',
    frecuencia_uso: registroExistente?.frecuencia_uso || '',
    horas_dia: registroExistente?.horas_dia || 0,
    dias_mes: registroExistente?.dias_mes || 0,
    potencia_w: registroExistente?.potencia_w || 0,
    voltaje_v: registroExistente?.voltaje_v || '',
    corriente_a: registroExistente?.corriente_a || 0,
    observaciones: registroExistente?.observaciones || ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (registroExistente?.ambiente?.sede) {
          const ambientesRes = await api.get(`/ambientes/?sede=${registroExistente.ambiente.sede}`);
          setAmbientes(ambientesRes.data);
        }
      } catch (error) {
        console.error('Error cargando ambientes:', error);
      }
    };

    fetchData();
  }, [registroExistente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.ambiente) newErrors.ambiente = 'Seleccione un ambiente';
    if (!formData.categoria_base) newErrors.categoria_base = 'Seleccione una categoría';
    if (!formData.frecuencia_uso) newErrors.frecuencia_uso = 'Seleccione frecuencia de uso';
    if (formData.horas_dia <= 0) newErrors.horas_dia = 'Horas debe ser mayor a 0';
    if (formData.dias_mes <= 0) newErrors.dias_mes = 'Días debe ser mayor a 0';
    if (!formData.potencia_w && (!formData.voltaje_v || !formData.corriente_a)) {
      newErrors.potencia_w = 'Ingrese potencia o voltaje y corriente';
    }
    if (formData.categoria_base.toLowerCase() === 'aire acondicionado') {
      if (!formData.refrigerante) newErrors.refrigerante = 'Seleccione refrigerante';
      if (!formData.tipo_aire) newErrors.tipo_aire = 'Seleccione tipo de aire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.potencia_w && formData.voltaje_v && formData.corriente_a) {
      const volt = parseFloat(formData.voltaje_v) || 0;
      const amp = parseFloat(formData.corriente_a) || 0;
      formData.potencia_w = (volt * amp).toFixed(2);
    }

    if (formData.categoria_base.toLowerCase() !== 'aire acondicionado') {
      formData.refrigerante = '';
      formData.tipo_aire = '';
    }

    if (!validateForm()) return;

    try {
      if (registroExistente) {
        await api.put(`/registros/${registroExistente.id}/`, formData);
      } else {
        await api.post('/registros/', formData);
      }

      onSuccess ? onSuccess() : navigate('/registros');
    } catch (error) {
      console.error('Error guardando registro:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    }
  };

  const categoriasOptions = [
    'Aire Acondicionado',
    'Iluminación',
    'Equipos de Cómputo',
    'Electrodomésticos',
    'Maquinaria'
  ];

  const refrigeranteOptions = [
    { value: 'R22', label: 'R-22' },
    { value: 'R410A', label: 'R-410A' },
    { value: 'R32', label: 'R-32' },
    { value: 'R134A', label: 'R-134A' },
    { value: 'NO IDENTIFICADO', label: 'No Identificado' }
  ];

  const tipoAireOptions = [
    { value: 'SPLIT', label: 'Split' },
    { value: 'VENTANA', label: 'Ventana' },
    { value: 'PORTATIL', label: 'Portátil' },
    { value: 'CENTRAL', label: 'Central' }
  ];

  const frecuenciaOptions = ['Diario', 'Semanal', 'Quincenal', 'Mensual'];
  const voltajeOptions = ['110', '220', '440'];

  return (
    <form onSubmit={handleSubmit} className="registro-form">
      <h2>{registroExistente ? 'Editar' : 'Nuevo'} Registro Energético</h2>

      <div className="form-group">
        <label>Ambiente:</label>
        <select name="ambiente" value={formData.ambiente} onChange={handleChange} required>
          <option value="">Seleccione un ambiente</option>
          {ambientes.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre} - {a.bloque} {a.piso}
            </option>
          ))}
        </select>
        {errors.ambiente && <span className="error-text">{errors.ambiente}</span>}
      </div>

      <div className="form-group">
        <label>Categoría:</label>
        <select name="categoria_base" value={formData.categoria_base} onChange={handleChange}>
          <option value="">Seleccione una categoría</option>
          {categoriasOptions.map((cat, idx) => (
            <option key={idx} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Subcategoría 1:</label>
        <input type="text" name="subcategoria_1" value={formData.subcategoria_1} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Subcategoría 2:</label>
        <input type="text" name="subcategoria_2" value={formData.subcategoria_2} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Subcategoría 3:</label>
        <input type="text" name="subcategoria_3" value={formData.subcategoria_3} onChange={handleChange} />
      </div>

      {formData.categoria_base.toLowerCase() === 'aire acondicionado' && (
        <>
          <div className="form-group">
            <label>Tipo de Aire:</label>
            <select name="tipo_aire" value={formData.tipo_aire} onChange={handleChange}>
              <option value="">Seleccione tipo</option>
              {tipoAireOptions.map((opt, idx) => (
                <option key={idx} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Refrigerante:</label>
            <select name="refrigerante" value={formData.refrigerante} onChange={handleChange}>
              <option value="">Seleccione un refrigerante</option>
              {refrigeranteOptions.map((opt, idx) => (
                <option key={idx} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="form-group">
        <label>Frecuencia de Uso:</label>
        <select name="frecuencia_uso" value={formData.frecuencia_uso} onChange={handleChange}>
          <option value="">Seleccione frecuencia</option>
          {frecuenciaOptions.map((freq, idx) => (
            <option key={idx} value={freq}>{freq}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Horas por Día:</label>
        <input type="number" name="horas_dia" value={formData.horas_dia} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Días por Mes:</label>
        <input type="number" name="dias_mes" value={formData.dias_mes} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Potencia (W):</label>
        <input type="number" name="potencia_w" value={formData.potencia_w} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Voltaje (V):</label>
        <select name="voltaje_v" value={formData.voltaje_v} onChange={handleChange}>
          <option value="">Seleccione voltaje</option>
          {voltajeOptions.map((v, idx) => (
            <option key={idx} value={v}>{v}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Corriente (A):</label>
        <input type="number" name="corriente_a" value={formData.corriente_a} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Observaciones:</label>
        <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows="3" />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {registroExistente ? 'Actualizar' : 'Guardar'} Registro
        </button>
        <button type="button" className="btn-secondary" onClick={() => navigate('/registros')}>
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default RegistroForm;