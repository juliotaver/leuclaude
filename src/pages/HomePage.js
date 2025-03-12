// frontend/src/pages/HomePage.js - Agregar botón de escaneo
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="home-page">
      <h1 style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--primary-color)' }}>
        Leu Beauty - Programa de Fidelidad
      </h1>
      
      {/* Botón grande de escaneo en la parte superior */}
      <div className="card" style={{ 
        maxWidth: '600px', 
        margin: '2rem auto', 
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Escanear un pase</h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Escanea el código QR de un pase para registrar una visita
        </p>
        <Link to="/scanner" className="btn" style={{
          backgroundColor: 'white',
          color: 'var(--primary-color)',
          padding: '0.75rem 2rem',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          display: 'inline-block'
        }}>
          Escanear ahora
        </Link>
      </div>
      
      <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <h2 className="card-title">Sistema de Pases de Fidelidad</h2>
        <p>
          Bienvenida al sistema de pases de fidelidad para tus clientas. 
          Puedes crear nuevos pases, gestionar las visitas y premiar la lealtad de tus clientas.
        </p>
        
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link to="/new-client" className="btn btn-primary">
            Crear Nuevo Pase
          </Link>
          <Link to="/clients" className="btn btn-primary" style={{ backgroundColor: '#666' }}>
            Administrar Clientes
          </Link>
        </div>
      </div>
      
      <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <h2 className="card-title">Programa de Recompensas</h2>
        <ul style={{ listStylePosition: 'inside', padding: '0.5rem' }}>
          <li>Visita 5: Postre gratis</li>
          <li>Visita 10: Bebida gratis</li>
          <li>Visita 15: Gel liso en manos gratis</li>
          <li>Visita 20: Gel liso en pies gratis</li>
          <li>Visita 25: 10% de descuento en uñas</li>
        </ul>
        <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>
          Al completar 25 visitas, el ciclo se reinicia para nuevas recompensas.
        </p>
      </div>
    </div>
  );
};

export default HomePage;