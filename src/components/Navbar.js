// frontend/src/components/Navbar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`navbar ${isMenuOpen ? 'menu-open' : ''}`}>
      <div className="navbar-container container">
        <Link to="/" className="navbar-logo">
          Leu Beauty
        </Link>
        
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {isMenuOpen ? '✕' : '☰'}
        </button>
        
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">
            Inicio
          </Link>
          <Link to="/new-client" className="navbar-link">
            Nuevo Cliente
          </Link>
          <Link to="/scanner" className="navbar-link">
            Escanear Pase
          </Link>
          <Link to="/clients" className="navbar-link">
            Clientes
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;