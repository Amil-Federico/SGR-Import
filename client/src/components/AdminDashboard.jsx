import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ user, onArticulosUpdated }) => {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form State
  const [formId, setFormId] = useState(null); // null = Crear, ID = Editar
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const formRef = useRef(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Proteger ruta en frontend
    if (!user || user.rol !== 'admin') {
      navigate('/');
      return;
    }
    fetchArticulos();
  }, [user]);

  const fetchArticulos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/articulos`);
      if (!response.ok) throw new Error('Error al conectar con la API.');
      const data = await response.json();
      setArticulos(data);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar el listado de productos.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!nombre || precio === '' || cantidad === '') {
      setError('Por favor, completa los campos requeridos (Nombre, Precio, Cantidad).');
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('token');
    
    const payload = {
      nombre,
      precio: parseFloat(precio),
      cantidad: parseInt(cantidad),
      descripcion,
      imagen: imagen.trim() || undefined
    };

    try {
      let response;
      if (formId) {
        // EDITAR
        response = await fetch(`${API_URL}/articulos/${formId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        // CREAR
        response = await fetch(`${API_URL}/articulos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar el artículo.');
      }

      setSuccess(formId ? '🎉 Artículo actualizado con éxito.' : '🎉 Artículo creado con éxito.');
      resetForm();
      await fetchArticulos();
      onArticulosUpdated?.();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al procesar la solicitud.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (articulo) => {
    setFormId(articulo.id);
    setNombre(articulo.nombre);
    setPrecio(articulo.precio);
    setCantidad(articulo.cantidad);
    setDescripcion(articulo.descripcion || '');
    setImagen(articulo.imagen || '');
    setError('');
    setSuccess('');

    // Scroll al formulario
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteClick = async (id, nombreArticulo) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la botella "${nombreArticulo}"?`)) {
      return;
    }

    setError('');
    setSuccess('');
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/articulos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar el artículo.');
      }

      setSuccess('🗑 Artículo eliminado exitosamente.');
      await fetchArticulos();
      onArticulosUpdated?.();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al eliminar el producto.');
    }
  };

  const resetForm = () => {
    setFormId(null);
    setNombre('');
    setPrecio('');
    setCantidad('');
    setDescripcion('');
    setImagen('');
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value);
  };

  // Filtrado
  const filteredArticulos = articulos.filter(item =>
    item.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.descripcion && item.descripcion.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Estadísticas
  const totalArticulos = articulos.length;
  const stockTotal = articulos.reduce((sum, item) => sum + item.cantidad, 0);
  const stockBajoCount = articulos.filter(item => item.cantidad < 5).length;

  if (loading && articulos.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2 text-muted">Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <div className="container py-5 animate-fade-in">
      
      {/* Encabezado */}
      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Panel de Control SGR Import</h2>
          <p className="text-muted mb-0">Gestión de stock, catálogo de botellas y métricas operativas.</p>
        </div>
        <div className="bg-light px-3 py-2 rounded d-flex align-items-center gap-2 border">
          <i className="bi bi-shield-lock-fill text-success fs-5"></i>
          <span className="fw-semibold small text-dark">Modo Administrador</span>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
          <button type="button" className="btn-close" onClick={() => setError('')} aria-label="Close"></button>
        </div>
      )}
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>{success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')} aria-label="Close"></button>
        </div>
      )}

      {/* Métricas Cards */}
      <div className="row mb-5">
        <div className="col-12 col-md-4 mb-3">
          <div className="card admin-card-stat p-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted fw-bold text-uppercase mb-1 small">Total Productos</h6>
                <h2 className="fw-bold text-dark mb-0">{totalArticulos}</h2>
              </div>
              <div className="bg-light p-3 rounded" style={{ border: '1px solid var(--sgr-border)' }}>
                <i className="bi bi-box-seam fs-3 text-primary"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4 mb-3">
          <div className="card admin-card-stat stat-green p-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted fw-bold text-uppercase mb-1 small">Stock Acumulado</h6>
                <h2 className="fw-bold text-dark mb-0">{stockTotal}</h2>
              </div>
              <div className="bg-light p-3 rounded" style={{ border: '1px solid var(--sgr-border)' }}>
                <i className="bi bi-grid-3x3-gap fs-3 text-success"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4 mb-3">
          <div className="card admin-card-stat p-4" style={{ borderLeftColor: stockBajoCount > 0 ? '#dc3545' : '#0b2240' }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted fw-bold text-uppercase mb-1 small">Alertas de Stock (&lt;5)</h6>
                <h2 className={`fw-bold mb-0 ${stockBajoCount > 0 ? 'text-danger' : 'text-dark'}`}>{stockBajoCount}</h2>
              </div>
              <div className="bg-light p-3 rounded" style={{ border: '1px solid var(--sgr-border)' }}>
                <i className={`bi bi-exclamation-octagon fs-3 ${stockBajoCount > 0 ? 'text-danger' : 'text-muted'}`}></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        
        {/* Formulario de Carga (Columna 4) */}
        <div className="col-12 col-lg-4 mb-4" ref={formRef}>
          <div className="card shadow-sm border p-4 bg-white" style={{ borderRadius: '12px' }}>
            <h5 className="fw-bold text-dark border-bottom pb-3 mb-4">
              <i className="bi bi-pencil-square me-2 text-success"></i>
              {formId ? 'Editar Botella' : 'Agregar Nueva Botella'}
            </h5>
            
            <form onSubmit={handleFormSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Nombre del Artículo *</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Ej. Botella Deportiva Verde"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  disabled={submitting}
                  style={{ borderRadius: '8px' }}
                />
              </div>

              <div className="row">
                <div className="col-6 mb-3">
                  <label className="form-label small fw-semibold text-muted">Precio ($) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    className="form-control"
                    placeholder="0.00"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    required
                    disabled={submitting}
                    style={{ borderRadius: '8px' }}
                  />
                </div>
                <div className="col-6 mb-3">
                  <label className="form-label small fw-semibold text-muted">Cantidad *</label>
                  <input 
                    type="number" 
                    min="0"
                    className="form-control"
                    placeholder="0"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    required
                    disabled={submitting}
                    style={{ borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">URL de Imagen (Opcional)</label>
                <input 
                  type="url" 
                  className="form-control"
                  placeholder="https://images.unsplash.com/..."
                  value={imagen}
                  onChange={(e) => setImagen(e.target.value)}
                  disabled={submitting}
                  style={{ borderRadius: '8px' }}
                />
                
                {/* Vista Previa */}
                {imagen.trim() && (
                  <div className="mt-3 text-center border p-2 bg-light rounded" style={{ overflow: 'hidden' }}>
                    <span className="small text-muted d-block mb-1">Vista previa de imagen:</span>
                    <img 
                      src={imagen} 
                      alt="Vista previa" 
                      style={{ maxHeight: '120px', maxWidth: '100%', objectFit: 'contain', borderRadius: '6px' }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-muted">Descripción</label>
                <textarea 
                  className="form-control"
                  rows="3"
                  placeholder="Detalles sobre capacidad, material, etc."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  disabled={submitting}
                  style={{ borderRadius: '8px' }}
                ></textarea>
              </div>

              <div className="d-grid gap-2">
                <button 
                  type="submit" 
                  className="btn btn-sgr-success py-2 fw-bold"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>{formId ? 'Guardar Cambios' : 'Registrar Producto'}</span>
                  )}
                </button>

                {formId && (
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary py-2 fw-semibold"
                    onClick={resetForm}
                    disabled={submitting}
                  >
                    Cancelar Edición
                  </button>
                )}
              </div>

            </form>
          </div>
        </div>

        {/* Tabla de Artículos (Columna 8) */}
        <div className="col-12 col-lg-8">
          <div className="admin-table-container border">
            
            {/* Buscador de Tabla */}
            <div className="p-3 bg-light border-bottom d-flex align-items-center">
              <div className="input-group" style={{ maxWidth: '350px' }}>
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control border-start-0 bg-white"
                  placeholder="Buscar botella..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Tabla */}
            <div className="table-responsive">
              <table className="table table-hover align-middle admin-table mb-0">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: '80px' }}>Miniatura</th>
                    <th scope="col">Nombre</th>
                    <th scope="col">Precio</th>
                    <th scope="col" className="text-center">Stock</th>
                    <th scope="col" className="text-end" style={{ width: '150px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticulos.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-muted">
                        <i className="bi bi-archive-fill fs-1 d-block mb-2"></i>
                        No se encontraron botellas cargadas.
                      </td>
                    </tr>
                  ) : (
                    filteredArticulos.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <img 
                            src={item.imagen} 
                            alt={item.nombre} 
                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }}
                          />
                        </td>
                        <td>
                          <div className="fw-bold text-dark">{item.nombre}</div>
                          <div className="text-muted small text-truncate" style={{ maxWidth: '280px' }}>
                            {item.descripcion || 'Sin descripción.'}
                          </div>
                        </td>
                        <td className="fw-bold text-dark">{formatPrice(item.precio)}</td>
                        <td className="text-center">
                          {item.cantidad === 0 ? (
                            <span className="badge bg-danger rounded-pill px-2.5 py-1.5">Sin Stock</span>
                          ) : item.cantidad < 5 ? (
                            <span className="badge bg-warning text-dark rounded-pill px-2.5 py-1.5">Bajo: {item.cantidad}</span>
                          ) : (
                            <span className="badge bg-success rounded-pill px-2.5 py-1.5">Ok: {item.cantidad}</span>
                          )}
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEditClick(item)}
                              title="Editar producto"
                            >
                              <i className="bi bi-pencil-fill"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteClick(item.id, item.nombre)}
                              title="Eliminar producto"
                            >
                              <i className="bi bi-trash-fill"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
