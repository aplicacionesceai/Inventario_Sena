// components/common/Header.jsx
import React from 'react';


const Header = ({ onToggleSidebar }) => {
  return (
    <header className="header">
      <button className="menu-btn" onClick={onToggleSidebar}>☰</button>
      <h1>Inventario Energético</h1>
    </header>
  );
};

export default Header;
