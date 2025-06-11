// src/pages/EditarRegistro.jsx
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api'; // Ajusta según tu estructura real
import RegistroForm from '../components/Registros/RegistroForm.jsx';

const EditarRegistro = () => {
  const { id } = useParams();
  const [registro, setRegistro] = useState(null);

  useEffect(() => {
    const fetchRegistro = async () => {
      const response = await api.get(`/registros/${id}/`);
      setRegistro(response.data);
    };
    fetchRegistro();
  }, [id]);

  if (!registro) return <div>Cargando...</div>;

  return (
    <div>
      <h1>Editar Registro</h1>
      <RegistroForm 
        registroExistente={registro} 
        onSuccess={() => window.location.href = '/registros'}
      />
    </div>
  );
};

export default EditarRegistro;