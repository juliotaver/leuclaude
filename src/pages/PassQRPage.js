import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';

const PassQRPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // const [passData, setPassData] = useState(null); // Eliminado: No se usa
  const [passUrl, setPassUrl] = useState('');
  const [client, setClient] = useState(null);

  // Define la URL base de la API.  Usa una variable de entorno para producción,
  // y un valor por defecto para desarrollo.
  const API_URL = process.env.REACT_APP_API_URL || '/api'; //  '/api' es correcto para desarrollo local

  const fetchPassData = useCallback(async () => {
    try {
      setLoading(true);
      const passResponse = await axios.get(`${API_URL}/passes/${id}`); // Usa API_URL aquí también
      // setPassData(passResponse.data); // Eliminado: No se usa

      // Construir la URL de descarga del pase.
      setPassUrl(`${API_URL}/passes/${id}/download`); // Usa API_URL

      // Buscar información del cliente (si existe un endpoint /api/clients).
      try {
        const clientsResponse = await axios.get(`${API_URL}/clients`); // Usa API_URL
        const relatedClient = clientsResponse.data.find(client => client.passId === id); // Supone que tienes un campo passId
        if (relatedClient) {
          setClient(relatedClient);
        }
      } catch (clientErr) {
        console.error('Error al obtener datos del cliente:', clientErr);
        // Considera mostrar un error al usuario, no solo en la consola.
        // setError('No se pudo cargar la información del cliente.'); // Podrías descomentar esto
      }

      setLoading(false);
    } catch (err) {
      setError('No se pudo cargar la información del pase.'); // Mensaje de error para el usuario
      setLoading(false);
      console.error('Error al obtener pase:', err);
      // Considera mostrar un error más detallado al usuario si es apropiado.
      // if (err.response) { setError(`Error del servidor: ${err.response.status}`); }
    }
  }, [id, API_URL]); // API_URL es una dependencia

  useEffect(() => {
    // Si tenemos los datos en el estado de navegación (provenientes de otro componente),
    // úsalos.  Esto evita una petición a la API innecesaria.
    if (location.state?.passUrl && location.state?.client) {
       // setPassData(location.state.pass); Ya no se necesita
      setPassUrl(location.state.passUrl);
      setClient(location.state.client);
      setLoading(false);
    } else {
      // Si no tenemos los datos en el estado de navegación, cárgalos desde la API.
      fetchPassData();
    }
  }, [location.state, fetchPassData]); // fetchPassData ya está correctamente en las dependencias

  const handleCreateNew = () => {
    navigate('/new-client');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Cargando información del pase...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={handleCreateNew} className="btn btn-primary">
          Crear nuevo pase
        </button>
      </div>
    );
  }

  return (
    <div className="qr-container">
      <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
        <h1 className="card-title" style={{ textAlign: 'center' }}>Pase de Fidelidad</h1>

        {/* Información del cliente (si la tienes) */}
        {client && (
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <p><strong>Cliente:</strong> {client.name}</p>
            {client.phone && <p><strong>Teléfono:</strong> {client.phone}</p>}
            {client.email && <p><strong>Email:</strong> {client.email}</p>}
          </div>
        )}

        {/* Código QR */}
        <div className="qr-code" style={{ textAlign: 'center', margin: '1.5rem 0' }}>
          <QRCodeSVG
            value={passUrl}
            size={250}
            includeMargin={true}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>

        {/* Instrucciones */}
        <div className="qr-instructions">
          <h3 style={{ marginBottom: '0.75rem' }}>Instrucciones</h3>
          <p>Para añadir este pase al Apple Wallet, escanea el código QR con tu iPhone o haz clic en "Descargar Pase".</p>

          {/* Botón de descarga */}
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <a
              href={passUrl}
              className="btn btn-primary"
              style={{ textDecoration: 'none' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Descargar Pase
            </a>
          </div>

          {/* Botón para crear un nuevo pase */}
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
            <button onClick={handleCreateNew} className="btn btn-primary" style={{ backgroundColor: '#666' }}>
              Crear Nuevo Pase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassQRPage;