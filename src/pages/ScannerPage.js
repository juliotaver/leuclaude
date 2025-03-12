// frontend/src/pages/ScannerPage.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/library';

const ScannerPage = () => {
  const [scanning, setScanning] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraId, setCameraId] = useState(null);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [passData, setPassData] = useState(null);
  const [clientData, setClientData] = useState(null);
  
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const navigate = useNavigate();

  // Inicializar el lector de códigos QR
  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();
    
    // Definir los formatos que queremos detectar (QR Code)
    const hints = new Map();
    hints.set(2, [BarcodeFormat.QR_CODE]);
    codeReaderRef.current.hints = hints;
    
    // Obtener las cámaras disponibles
    codeReaderRef.current.listVideoInputDevices()
      .then(videoInputDevices => {
        if (videoInputDevices.length === 0) {
          setError('No se encontraron cámaras disponibles');
          return;
        }
        
        setAvailableCameras(videoInputDevices);
        
        // Por defecto, usar la cámara trasera si está disponible
        const backCamera = videoInputDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('trasera') ||
          device.label.toLowerCase().includes('rear')
        );
        
        setCameraId(backCamera ? backCamera.deviceId : videoInputDevices[0].deviceId);
      })
      .catch(err => {
        console.error('Error al listar cámaras:', err);
        setError('Error al acceder a las cámaras');
      });
    
    return () => {
      // Limpiar al desmontar
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
        codeReaderRef.current = null;
      }
    };
  }, []);

  // Iniciar el escaneo cuando se selecciona una cámara
  useEffect(() => {
    if (!cameraId || !codeReaderRef.current || !scanning) return;
    
    const startScanning = async () => {
      try {
        await codeReaderRef.current.decodeFromVideoDevice(
          cameraId,
          videoRef.current,
          (result, error) => {
            if (result && scanning) {
              handleScan(result.getText());
            }
            if (error && error.name !== 'NotFoundException') {
              console.error('Error durante el escaneo:', error);
            }
          }
        );
      } catch (err) {
        console.error('Error al iniciar el escaneo:', err);
        setError('Error al iniciar la cámara. Revisa los permisos.');
      }
    };
    
    startScanning();
    
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, [cameraId, scanning]);

  const handleScan = async (text) => {
    if (!text || !scanning || loading) return;
    
    setScanning(false);
    setScanResult(text);
    
    // Extraer el ID del pase de la URL escaneada
    try {
      const url = new URL(text);
      const pathParts = url.pathname.split('/');
      const passIdIndex = pathParts.findIndex(part => part === 'passes') + 1;
      
      if (passIdIndex > 0 && passIdIndex < pathParts.length) {
        const passId = pathParts[passIdIndex];
        await processPass(passId);
      } else {
        setError('QR inválido. No se pudo identificar el ID del pase.');
      }
    } catch (e) {
      // Si no es una URL, puede ser solo el ID del pase
      if (text.match(/^\d+$/)) {
        await processPass(text);
      } else {
        setError('El código QR no contiene una URL o ID válido.');
      }
    }
  };

  const processPass = async (passId) => {
    try {
      setLoading(true);
      
      // 1. Obtener datos del pase
      const passResponse = await axios.get(`/api/passes/${passId}`);
      setPassData(passResponse.data);
      
      // 2. Buscar cliente asociado
      try {
        const clientsResponse = await axios.get('/api/clients');
        const client = clientsResponse.data.find(c => c.passId === passId);
        if (client) {
          setClientData(client);
        }
      } catch (err) {
        console.error('Error al obtener datos del cliente:', err);
      }
      
      // 3. Incrementar visitas
      const updatedPassResponse = await axios.put(`/api/passes/${passId}`);
      setPassData(updatedPassResponse.data);
      setSuccess(`¡Visita registrada! Total de visitas: ${updatedPassResponse.data.visits}`);
      
    } catch (err) {
      console.error('Error al procesar el pase:', err);
      setError(err.response?.data?.message || 'Error al procesar el pase');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanning(true);
    setScanResult(null);
    setPassData(null);
    setClientData(null);
    setError('');
    setSuccess('');
  };

  const switchCamera = () => {
    if (availableCameras.length <= 1) return;
    
    // Detener el escaneo actual
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    
    // Obtener el índice de la cámara actual
    const currentIndex = availableCameras.findIndex(camera => camera.deviceId === cameraId);
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    
    // Cambiar a la siguiente cámara
    setCameraId(availableCameras[nextIndex].deviceId);
  };

  return (
    <div className="scanner-page">
      <h1 style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--primary-color)' }}>
        Escanear Pase
      </h1>
      
      {error && (
        <div className="card" style={{ 
          backgroundColor: '#ffebee', 
          padding: '1rem', 
          marginBottom: '1rem',
          color: '#c62828'
        }}>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="card" style={{ 
          backgroundColor: '#e8f5e9', 
          padding: '1rem', 
          marginBottom: '1rem',
          color: '#2e7d32'
        }}>
          <p style={{ margin: 0 }}>{success}</p>
        </div>
      )}
      
      {scanning ? (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <video 
              ref={videoRef}
              style={{ 
                width: '100%', 
                maxHeight: '70vh',
                borderRadius: '8px'
              }}
            />
            
            {availableCameras.length > 1 && (
              <button 
                onClick={switchCamera}
                className="btn"
                style={{ 
                  position: 'absolute', 
                  bottom: '10px', 
                  right: '10px',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ⟳
              </button>
            )}
          </div>
          <p style={{ textAlign: 'center', margin: '1rem 0' }}>
            Posiciona el código QR del pase dentro del área de escaneo
          </p>
        </div>
      ) : (
        <div className="card">
          {loading ? (
            <p style={{ textAlign: 'center' }}>Procesando pase...</p>
          ) : (
            <>
              {passData && (
                <div style={{ marginBottom: '1rem' }}>
                  <h2 className="card-title">Pase escaneado</h2>
                  
                  {clientData && (
                    <div style={{ marginBottom: '1rem' }}>
                      <p><strong>Cliente:</strong> {clientData.name}</p>
                      {clientData.phone && <p><strong>Teléfono:</strong> {clientData.phone}</p>}
                      {clientData.email && <p><strong>Email:</strong> {clientData.email}</p>}
                      {clientData.birthdate?.month && clientData.birthdate?.day && (
                        <p><strong>Cumpleaños:</strong> {clientData.birthdate.day}/{clientData.birthdate.month}</p>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <p><strong>Visitas:</strong> {passData.visits}</p>
                    <p>
                      <strong>Próxima recompensa:</strong> {passData.nextReward.reward} (
                      {passData.nextReward.visits} visitas)
                    </p>
                    
                    {passData.nextReward.visits === passData.visits && (
                      <div style={{ 
                        backgroundColor: '#fff8e1', 
                        padding: '0.75rem', 
                        borderRadius: '4px',
                        marginTop: '0.5rem'
                      }}>
                        <p style={{ margin: 0, fontWeight: 'bold', color: '#ff8f00' }}>
                          ¡El cliente ha alcanzado una recompensa!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={resetScanner} className="btn btn-primary">
                  Escanear otro pase
                </button>
                <button 
                  onClick={() => navigate('/clients')} 
                  className="btn btn-primary"
                  style={{ backgroundColor: '#666' }}
                >
                  Ver clientes
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ScannerPage;