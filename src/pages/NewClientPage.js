import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NewClientPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    birthdate: {
      month: '',
      day: ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'birthdateMonth' || name === 'birthdateDay') {
      setFormData({
        ...formData,
        birthdate: {
          ...formData.birthdate,
          [name.replace('birthdate', '').toLowerCase()]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Validar datos
      if (!formData.name.trim()) {
        throw new Error('El nombre es obligatorio');
      }
      
      // Formatear datos para el API
      const clientData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        birthdate: {
          month: formData.birthdate.month ? parseInt(formData.birthdate.month) : null,
          day: formData.birthdate.day ? parseInt(formData.birthdate.day) : null
        }
      };
      
      // Enviar al API
      const response = await axios.post('/api/clients', clientData);
      
      // Redirigir a la página con el QR
      navigate(`/pass/${response.data.pass.id}`, { 
        state: { 
          pass: response.data.pass,
          passUrl: response.data.passUrl,
          client: response.data.client
        } 
      });
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al crear el cliente');
      console.error('Error al crear cliente:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generar opciones para los meses
  const monthOptions = [
    { value: '', label: 'Seleccionar mes' },
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];

  // Generar opciones para los días
  const dayOptions = [
    { value: '', label: 'Seleccionar día' },
    ...Array.from({ length: 31 }, (_, i) => ({
      value: String(i + 1),
      label: String(i + 1)
    }))
  ];

  return (
    <div className="new-client-page">
      <div className="form-container" style={{ maxWidth: '500px', margin: '2rem auto' }}>
        <h1 className="form-title">Crear Nuevo Pase</h1>
        
        {error && (
          <div style={{ 
            backgroundColor: '#ffebee', 
            color: '#c62828', 
            padding: '0.75rem', 
            borderRadius: '4px', 
            marginBottom: '1rem' 
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Nombre completo *</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nombre de la clienta"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone" className="form-label">Teléfono</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(Opcional)"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="(Opcional)"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Fecha de cumpleaños (Opcional)</label>
            <div className="birthdate-container">
              <div className="form-group">
                <select
                  id="birthdateMonth"
                  name="birthdateMonth"
                  className="form-select"
                  value={formData.birthdate.month}
                  onChange={handleChange}
                >
                  {monthOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <select
                  id="birthdateDay"
                  name="birthdateDay"
                  className="form-select"
                  value={formData.birthdate.day}
                  onChange={handleChange}
                >
                  {dayOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ marginTop: '1rem' }}
          >
            {loading ? 'Creando pase...' : 'Crear Pase'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewClientPage;