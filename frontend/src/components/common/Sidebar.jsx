import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Botón X visible solo en móviles */}
      <button className="close-btn" onClick={onClose}>✖</button>

      <nav>
        <Link to="/home">🏠 Inicio</Link>
        <Link to="/registros">📋 Registros</Link>
        <Link to="/registros/nuevo">➕ Nuevo</Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
