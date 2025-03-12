import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ClientListPage = () => {
    const [clients, setClients] = useState([]);
    const [passes, setPasses] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Obtener clientes
            const clientsResponse = await axios.get('/api/clients');
            setClients(clientsResponse.data);

            // Obtener pases
            const passesResponse = await axios.get('/api/passes');

            // Crear un mapa de id -> pass para acceso rápido
            const passMap = {};
            passesResponse.data.forEach(pass => {
                passMap[pass.id] = pass;
            });

            setPasses(passMap);
            setLoading(false);
        } catch (err) {
            setError('Error al cargar los datos');
            setLoading(false);
            console.error('Error al obtener datos:', err);
        }
    };

    const incrementVisits = async (passId) => {
        try {
            const response = await axios.put(`/api/passes/${passId}`);

            // Actualizar el mapa de pases
            setPasses(prev => ({
                ...prev,
                [passId]: response.data
            }));

        } catch (err) {
            console.error('Error al incrementar visitas:', err);
            alert('Error al actualizar las visitas');
        }
    };

    const deleteClient = async (clientId, passId) => {
        try {
            await axios.delete(`/api/clients/${clientId}`);

            // Eliminar también el pase si existe
            if (passId) {
                try {
                    await axios.delete(`/api/passes/${passId}`);
                } catch (passErr) {
                    console.error('Error al eliminar pase:', passErr);
                }
            }

            // Actualizar la lista de clientes
            setClients(prev => prev.filter(client => client._id !== clientId));
            setShowDeleteConfirm(null);

        } catch (err) {
            console.error('Error al eliminar cliente:', err);
            alert('Error al eliminar el cliente');
        }
    };

    // Filtrar clientes según término de búsqueda
    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.phone && client.phone.includes(searchTerm)) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) // Corrección aquí: incluir searchTerm.toLowerCase()
    );

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Cargando clientes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: 'red' }}>{error}</p>
                <button onClick={fetchData} className="btn btn-primary">
                    Reintentar
                </button>
            </div>
        );
    }

    // Añadir botón flotante para escanear (Componente funcional dentro de ClientListPage)
    const ScanButton = () => (
        <Link
            to="/scanner"  // Asegúrate de tener una ruta "/scanner" configurada en tu Router
            style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-color)',  // Asegúrate de que esta variable CSS esté definida
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
                textDecoration: 'none',
                color: 'white',
                fontSize: '24px',
                zIndex: 100
            }}
        >
            <span role="img" aria-label="scan">📷</span>
        </Link>
    );


    return (
        <div className="clients-page">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: '1rem 0 2rem'
            }}>
                <h1 style={{ color: 'var(--primary-color)' }}>Administrar Clientes</h1>
                <Link to="/new-client" className="btn btn-primary">
                    + Nuevo Cliente
                </Link>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Buscar cliente por nombre, teléfono o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredClients.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <p>No se encontraron clientes.</p>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="btn btn-primary"
                            style={{ marginTop: '1rem' }}
                        >
                            Limpiar búsqueda
                        </button>
                    )}
                </div>
            ) : (
                <div className="client-list">
                    {filteredClients.map(client => {
                        const pass = passes[client.passId];

                        return (
                            <div key={client._id} className="card client-card">
                                <h2 className="card-title">{client.name}</h2>

                                {client.phone && <p><strong>Teléfono:</strong> {client.phone}</p>}
                                {client.email && <p><strong>Email:</strong> {client.email}</p>}

                                {client.birthdate && client.birthdate.month && client.birthdate.day && (
                                    <p>
                                        <strong>Cumpleaños:</strong> {client.birthdate.day}/{client.birthdate.month}
                                    </p>
                                )}

                                {pass ? (
                                    <div style={{ margin: '1rem 0' }}>
                                        <p><strong>Visitas:</strong> {pass.visits}</p>
                                        <p><strong>Próxima recompensa:</strong> {pass.nextReward.reward} ({pass.nextReward.visits} visitas)</p>
                                    </div>
                                ) : (
                                    <p style={{ color: 'red', margin: '1rem 0' }}>
                                        Pase no encontrado
                                    </p>
                                )}

                                <div className="client-card-actions">
                                    {pass && (
                                        <>
                                            <button
                                                onClick={() => incrementVisits(pass.id)}
                                                className="btn btn-primary"
                                                style={{ flex: '1', marginRight: '0.5rem' }}
                                            >
                                                + Visita
                                            </button>

                                            <Link
                                                to={`/pass/${pass.id}`}
                                                className="btn btn-primary"
                                                style={{
                                                    flex: '1',
                                                    marginLeft: '0.5rem',
                                                    backgroundColor: '#555',
                                                    textDecoration: 'none',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                Ver QR
                                            </Link>
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={() => setShowDeleteConfirm(client._id)}
                                    className="btn"
                                    style={{
                                        marginTop: '1rem',
                                        backgroundColor: '#f44336',
                                        color: 'white'
                                    }}
                                >
                                    Eliminar Cliente
                                </button>

                                {/* Confirmación de eliminación */}
                                {showDeleteConfirm === client._id && (
                                    <div style={{
                                        backgroundColor: '#ffebee',
                                        padding: '1rem',
                                        borderRadius: 'var(--border-radius)',
                                        marginTop: '1rem'
                                    }}>
                                        <p style={{ marginBottom: '0.5rem' }}>
                                            ¿Estás segura de eliminar a este cliente? Esta acción no se puede deshacer.
                                        </p>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => deleteClient(client._id, client.passId)}
                                                className="btn"
                                                style={{ backgroundColor: '#f44336', color: 'white' }}
                                            >
                                                Sí, eliminar
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(null)}
                                                className="btn"
                                                style={{ backgroundColor: '#9e9e9e', color: 'white' }}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            {/* Usar el componente ScanButton aquí */}
            <ScanButton />
        </div>
    );
};

export default ClientListPage;