import RegistroItem from './RegistroItem';

const RegistroList = ({ registros }) => {
  return (
    <div className="registro-list">
      {registros.length > 0 ? (
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th>Ambiente</th>
              <th>Categoría</th>
              <th>Consumo (kWh/mes)</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {registros.map(registro => (
              <RegistroItem key={registro.id} registro={registro} />
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay registros disponibles</p>
      )}
    </div>
  );
};

export default RegistroList;