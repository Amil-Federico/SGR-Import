import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión.');
      }

      // Guardar token en localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.usuario));
      
      // Actualizar estado global de la app
      onLoginSuccess(data.token, data.usuario);

      // Redirigir según el rol
      if (data.usuario.rol === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }

    } catch (err) {
      console.error(err);
      setError(err.message || 'Ocurrió un error inesperado al intentar ingresar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card">
        
        {/* Cabecera / Logo */}
        <div className="text-center mb-4">
          <i className="bi bi-box-seam-fill text-success fs-1"></i>
          <h3 className="fw-bold text-dark mt-2">SGR Import</h3>
          <p className="text-muted small">Ingresa a tu cuenta para continuar</p>
        </div>

        {/* Alertas */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert" style={{ borderRadius: '8px', fontSize: '0.9rem' }}>
            <i className="bi bi-exclamation-triangle-fill"></i>
            <div>{error}</div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="loginEmail" className="form-label small fw-semibold text-muted">Correo Electrónico</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted" style={{ borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
                <i className="bi bi-envelope"></i>
              </span>
              <input 
                type="email" 
                className="form-control border-start-0" 
                id="loginEmail" 
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                style={{ borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between">
              <label htmlFor="loginPass" className="form-label small fw-semibold text-muted">Contraseña</label>
            </div>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted" style={{ borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
                <i className="bi bi-lock"></i>
              </span>
              <input 
                type="password" 
                className="form-control border-start-0" 
                id="loginPass" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                style={{ borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-sgr-primary w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 mb-3"
            disabled={loading}
            style={{ borderRadius: '8px' }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Cargando...</span>
              </>
            ) : (
              <span>Ingresar</span>
            )}
          </button>
        </form>

        {/* Tip Informativo de Credenciales Sembradas */}
        <div className="bg-light p-3 rounded mb-3 text-start small border">
          <p className="mb-1 text-dark fw-bold"><i className="bi bi-info-circle-fill text-success me-1"></i> Credenciales de prueba (seeding):</p>
          <ul className="mb-0 ps-3 text-muted">
            <li><strong>Admin:</strong> admin@sgrimport.com / admin123</li>
            <li><strong>Cliente:</strong> cliente@sgrimport.com / cliente123</li>
          </ul>
        </div>

        {/* Registro Link */}
        <div className="text-center mt-3">
          <span className="text-muted small">¿No tienes una cuenta? </span>
          <Link to="/register" className="text-success fw-bold small text-decoration-none">Regístrate aquí</Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
