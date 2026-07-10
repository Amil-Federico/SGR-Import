import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rol, setRol] = useState('cliente');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || !confirmPassword) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rol })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrarse.');
      }

      setSuccess('🎉 ¡Usuario registrado con éxito! Redirigiendo al login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Ocurrió un error inesperado al registrar el usuario.');
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
          <p className="text-muted small">Crea tu cuenta gratis</p>
        </div>

        {/* Alertas */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert" style={{ borderRadius: '8px', fontSize: '0.9rem' }}>
            <i className="bi bi-exclamation-triangle-fill"></i>
            <div>{error}</div>
          </div>
        )}

        {success && (
          <div className="alert alert-success d-flex align-items-center gap-2 py-2" role="alert" style={{ borderRadius: '8px', fontSize: '0.9rem' }}>
            <i className="bi bi-check-circle-fill"></i>
            <div>{success}</div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="regEmail" className="form-label small fw-semibold text-muted">Correo Electrónico</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted" style={{ borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
                <i className="bi bi-envelope"></i>
              </span>
              <input 
                type="email" 
                className="form-control border-start-0" 
                id="regEmail" 
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                style={{ borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="regPass" className="form-label small fw-semibold text-muted">Contraseña</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted" style={{ borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
                <i className="bi bi-lock"></i>
              </span>
              <input 
                type="password" 
                className="form-control border-start-0" 
                id="regPass" 
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                style={{ borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="regConfirmPass" className="form-label small fw-semibold text-muted">Confirmar Contraseña</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted" style={{ borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
                <i className="bi bi-shield-lock"></i>
              </span>
              <input 
                type="password" 
                className="form-control border-start-0" 
                id="regConfirmPass" 
                placeholder="Repite la contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                style={{ borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}
              />
            </div>
          </div>

          {/* Selector de Rol (útil para pruebas) */}
          <div className="mb-4">
            <label htmlFor="regRole" className="form-label small fw-semibold text-muted">Rol de Usuario</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted" style={{ borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
                <i className="bi bi-person-badge"></i>
              </span>
              <select 
                className="form-select border-start-0" 
                id="regRole"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                disabled={loading}
                style={{ borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}
              >
                <option value="cliente">Cliente (Estándar)</option>
                <option value="admin">Administrador (Acceso a CRUD)</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-sgr-success w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 mb-3"
            disabled={loading}
            style={{ borderRadius: '8px' }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Registrando...</span>
              </>
            ) : (
              <span>Registrarse</span>
            )}
          </button>
        </form>

        <div className="text-center mt-3">
          <span className="text-muted small">¿Ya tienes una cuenta? </span>
          <Link to="/login" className="text-success fw-bold small text-decoration-none">Ingresa aquí</Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
