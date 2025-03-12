import axios from 'axios';

// Configuración base para axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// En tus servicios o componentes que hacen peticiones API
const API_URL = process.env.REACT_APP_API_URL || '/api';

// Al hacer las peticiones
axios.get(`${API_URL}/clients`)

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  response => response,
  error => {
    // Log del error
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

// Servicios de pases
export const passService = {
  // Obtener todos los pases
  getAllPasses: async () => {
    const response = await api.get('/passes');
    return response.data;
  },
  
  // Obtener un pase por ID
  getPassById: async (id) => {
    const response = await api.get(`/passes/${id}`);
    return response.data;
  },
  
  // Incrementar visitas
  incrementVisits: async (id) => {
    const response = await api.put(`/passes/${id}`);
    return response.data;
  },
  
  // Obtener URL para descargar el pase
  getPassDownloadUrl: (id) => {
    return `${api.defaults.baseURL}/passes/${id}/download`;
  }
};

// Servicios de clientes
export const clientService = {
  // Obtener todos los clientes
  getAllClients: async () => {
    const response = await api.get('/clients');
    return response.data;
  },
  
  // Obtener un cliente por ID
  getClientById: async (id) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },
  
  // Crear un nuevo cliente
  createClient: async (clientData) => {
    const response = await api.post('/clients', clientData);
    return response.data;
  },
  
  // Actualizar un cliente
  updateClient: async (id, clientData) => {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data;
  },
  
  // Eliminar un cliente
  deleteClient: async (id) => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  }
};

export default {
  pass: passService,
  client: clientService
};