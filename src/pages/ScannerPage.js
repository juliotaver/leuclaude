import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/library';

const ScannerPage = () => {
  const [scanning, setScanning] = useState(true);
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
    // Limpiar cualquier instancia anterior
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }

    // Crear nueva instancia
    codeReaderRef.current = new BrowserMultiFormatReader();
    console.log("Inicializando lector de códigos QR");
    
    // Obtener las cámaras disponibles
    codeReaderRef.current.listVideoInputDevices()
      .then(videoInputDevices => {
        console.log("Cámaras disponibles:", videoInputDevices);
        
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
        console.log("Cámara seleccionada:", backCamera || videoInputDevices[0]);
      })
      .catch(err => {
        console.error('Error al listar cámaras:', err);
        setError('Error al acceder a las cámaras. Verifica los permisos del navegador.');
      });
    
    // Limpiar al desmontar
    return () => {
      if (codeReaderRef.current) {
        console.log("Limpiando lector de códigos QR");
        codeReaderRef.current.reset();
      }
    };
  }, []);

  // Iniciar el escaneo cuando se selecciona una cámara
  useEffect(() => {
    if (!cameraId || !codeReaderRef.current || !scanning) {
      console.log("No se puede iniciar el escaneo:", { cameraId, codeReader: !!codeReaderRef.current, scanning });
      return;
    }
    
    const startScanning = async () => {
      try {
        console.log("Iniciando escaneo con cámara:", cameraId);
        
        await codeReaderRef.current.decodeFromVideoDevice(
          cameraId,
          videoRef.current,
          (result, error) => {
            if (result && scanning) {
              console.log("Código QR detectado:", result.getText());
              handleScan(result.getText());
            }
            if (error && error.name !== 'NotFoundException') {
              console.error('Error durante el escaneo:', error);
            }
          }
        );
        
        console.log("Escaneo iniciado con éxito");
      } catch (err) {
        console.error('Error al iniciar el escaneo:', err);
        setError('Error al iniciar la cámara. Revisa los permisos de tu navegador.');
      }
    };
    
    startScanning();
    
    return () => {
      if (codeReaderRef.current) {
        console.log("Deteniendo escaneo");
        codeReaderRef.current.reset();
      }
    };
  }, [cameraId, scanning]);

  const handleScan = async (text) => {
    if (!text || !scanning || loading) return;
    
    console.log("Procesando código escaneado:", text);
    setScanning(false);
    
    // Extraer el ID del pase de la URL escaneada
    try {
      const url = new URL(text);
      const pathParts = url.pathname.split('/');
      const passIdIndex = pathParts.findIndex(part => part === 'passes') + 1;
      
      if (passIdIndex > 0 && passIdIndex < pathParts.length) {
        const passId = pathParts[passIdIndex];
        console.log("ID del pase extraído:", passId);
        await processPass(passId);
      } else {
        // Intenta encontrar cualquier número en la URL como último recurso
        const matches = text.match(/\d+/g);
        if (matches && matches.length > 0) {
          console.log("ID encontrado en el texto:", matches[0]);
          await processPass(matches[0]);
        } else {
          setError('QR inválido. No se pudo identificar el ID del pase.');
        }
      }
    } catch (e) {
      console.log("Error al procesar URL, intentando con texto completo:", e);
      // Si no es una URL, puede ser solo el ID del pase
      const matches = text.match(/\d+/g);
      if (matches && matches.length > 0) {
        console.log("ID encontrado en el texto:", matches[0]);
        await processPass(matches[0]);
      } else {
        setError('El código QR no contiene una URL o ID válido.');
      }
    }
  };

  const processPass = async (passId) => {
    try {
      setLoading(true);
      console.log("Procesando pase con ID:", passId);
      
      // 1. Obtener datos del pase
      const API_URL = process.env.REACT_APP_API_URL || '/api';
      const passResponse = await axios.get(`${API_URL}/passes/${passId}`);
      setPassData(passResponse.data);
      
      // 2. Buscar cliente asociado
      try {
        const clientsResponse = await axios.get(`${API_URL}/clients`);
        const client = clientsResponse.data.find(c => c.passId === passId);
        if (client) {
          setClientData(client);
        }
      } catch (err) {
        console.error('Error al obtener datos del cliente:', err);
      }
      
      // 3. Incrementar visitas
      const updatedPassResponse = await axios.put(`${API_URL}/passes/${passId}`);
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

  // Botón para solicitar permisos manualmente
  const requestCameraAccess = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Reiniciar el proceso después de obtener permisos
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
      
      // Reiniciar el componente
      codeReaderRef.current = new BrowserMultiFormatReader();
      codeReaderRef.current.listVideoInputDevices()
        .then(devices => {
          if (devices.length > 0) {
            setAvailableCameras(devices);
            setCameraId(devices[0].deviceId);
            setError('');
          }
        });
    } catch (err) {
      console.error('Error al solicitar acceso a la cámara:', err);
      setError('No se pudo acceder a la cámara. Por favor, verifica los permisos del navegador.');
    }
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
          <button 
            onClick={requestCameraAccess}
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
          >
            Permitir acceso a la cámara
          </button>
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
          
          {/* Botón de solicitud de permisos explícito */}
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button onClick={requestCameraAccess} className="btn btn-primary">
              Activar cámara
            </button>
          </div>
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