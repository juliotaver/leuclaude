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
  const [passData, setPassData] = useState(null);
  const [passUrl, setPassUrl] = useState('');
  const [client, setClient] = useState(null);

  // Usar useCallback para fetchPassData
  const fetchPassData = useCallback(async () => {
    try {
      setLoading(true);
      const passResponse = await axios.get(`/api/passes/${id}`);
      setPassData(passResponse.data);

      // Construir la URL del pase
      const host = window.location.origin;
      setPassUrl(`${host}/api/passes/${id}/download`);

      // Buscar información del cliente si existe
      try {
        const clientsResponse = await axios.get('/api/clients');
        const relatedClient = clientsResponse.data.find(client => client.passId === id);
        if (relatedClient) {
          setClient(relatedClient);
        }
      } catch (clientErr) {
        console.error('Error al obtener datos del cliente:', clientErr);
      }

      setLoading(false);
    } catch (err) {
      setError('No se pudo cargar la información del pase');
      setLoading(false);
      console.error('Error al obtener pase:', err);
    }
  }, [id]);

  useEffect(() => {
    // Si tenemos los datos en el estado de navegación, usarlos
    if (location.state?.pass && location.state?.passUrl) {
      setPassData(location.state.pass);
      setPassUrl(location.state.passUrl);
      setClient(location.state.client);
      setLoading(false);
    } else {
      // Si no, cargar desde la API
      fetchPassData();
    }
  }, [id, location.state, fetchPassData]);

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

  // Renderizar la información del pase
  return (
    <div className="qr-container">
      <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
        <h1 className="card-title" style={{ textAlign: 'center' }}>Pase de Fidelidad</h1>

        {passData && (
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <p><strong>Visitas:</strong> {passData.visits}</p>
            {passData.nextReward && (
              <p><strong>Próxima recompensa:</strong> {passData.nextReward.reward} ({passData.nextReward.visits} visitas)</p>
            )}
          </div>
        )}

        {client && (
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <p><strong>Cliente:</strong> {client.name}</p>
            {client.phone && <p><strong>Teléfono:</strong> {client.phone}</p>}
            {client.email && <p><strong>Email:</strong> {client.email}</p>}
          </div>
        )}

        <div className="qr-code" style={{ textAlign: 'center', margin: '1.5rem 0' }}>
          <QRCodeSVG
            value={passUrl}
            size={250}
            includeMargin={true}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>

        <div className="qr-instructions">
          <h3 style={{ marginBottom: '0.75rem' }}>Instrucciones</h3>
          <p>Para añadir este pase al Apple Wallet, escanea el código QR con tu iPhone.</p>

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