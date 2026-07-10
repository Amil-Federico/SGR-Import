import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';

// Importar Componentes
import Navbar from './components/Navbar';
import ArticuloCard from './components/ArticuloCard';
import CarritoSidebar from './components/CarritoSidebar';
import CheckoutModal from './components/CheckoutModal';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';

const App = () => {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  
  // Carrito y Sesión
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Cargar sesión del usuario desde localStorage
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }

    // Cargar artículos del backend
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/articulos`);
      if (!response.ok) throw new Error('Error al conectar con la base de datos.');
      const data = await response.json();
      setArticulos(data);
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar al servidor. Asegúrate de que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  // Manejo de Sesión
  const handleLoginSuccess = (userToken, userData) => {
    setToken(userToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Manejo de Carrito
  const handleAddToCart = (articulo) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === articulo.id);
      
      if (existingItem) {
        // Validar que no supere el stock disponible
        if (existingItem.cantidadSeleccionada >= articulo.cantidad) {
          alert(`Límite alcanzado. Solo hay ${articulo.cantidad} unidades disponibles.`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === articulo.id
            ? { ...item, cantidadSeleccionada: item.cantidadSeleccionada + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...articulo, cantidadSeleccionada: 1 }];
      }
    });
  };

  const handleUpdateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(id);
      return;
    }
    
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id) {
          // Validar contra stock
          if (newQty > item.cantidad) {
            alert(`Límite alcanzado. Solo hay ${item.cantidad} unidades disponibles.`);
            return item;
          }
          return { ...item, cantidadSeleccionada: newQty };
        }
        return item;
      })
    );
  };

  const handleRemoveFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleCheckoutSuccess = () => {
    setCart([]);
    // Recargar catálogo por si se consumieron existencias
    fetchCatalog();
  };

  // Filtros
  const getCategories = () => {
    const categories = ['Todas', 'Térmica', 'Deportiva', 'Vidrio'];
    return categories;
  };

  const filteredArticulos = articulos.filter((item) => {
    const matchesSearch = 
      item.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.descripcion && item.descripcion.toLowerCase().includes(searchQuery.toLowerCase()));
      
    let matchesCategory = true;
    if (selectedCategory !== 'Todas') {
      const textToSearch = `${item.nombre} ${item.descripcion || ''}`.toLowerCase();
      matchesCategory = textToSearch.includes(selectedCategory.toLowerCase());
    }

    return matchesSearch && matchesCategory;
  });

  const cartCount = cart.reduce((sum, item) => sum + item.cantidadSeleccionada, 0);

  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100 bg-light">
        
        {/* Navbar */}
        <Navbar cartCount={cartCount} user={user} onLogout={handleLogout} />

        {/* Main Content */}
        <main className="flex-grow-1">
          <Routes>
            
            {/* Vista Pública: Catálogo */}
            <Route 
              path="/" 
              element={
                <div className="container py-4">
                  {/* Hero Banner */}
                  <div className="sgr-hero animate-fade-in shadow">
                    <div className="row align-items-center">
                      <div className="col-lg-8">
                        <span className="badge bg-success mb-2 px-3 py-2 text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>Importación Exclusiva</span>
                        <h1 className="display-4 fw-extrabold text-white mb-2">Colección de Botellas Premium</h1>
                        <p className="lead text-white-50 mb-0">Mantente hidratado con estilo. Botellas térmicas, deportivas y de vidrio borosilicatado de máxima calidad.</p>
                      </div>
                    </div>
                  </div>

                  {/* Filtros y Buscador */}
                  <div className="row mb-5 align-items-center gap-3 gap-md-0">
                    <div className="col-12 col-md-6 d-flex flex-wrap gap-2">
                      {getCategories().map((category) => (
                        <button
                          key={category}
                          className={`btn ${selectedCategory === category ? 'btn-sgr-primary' : 'btn-outline-secondary bg-white'} px-4 py-2 fw-semibold`}
                          onClick={() => setSelectedCategory(category)}
                          style={{ borderRadius: '8px' }}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0 text-muted" style={{ borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
                          <i className="bi bi-search"></i>
                        </span>
                        <input 
                          type="text" 
                          className="form-control border-start-0 py-2.5" 
                          placeholder="Buscar por nombre, color o características..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{ borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mensaje de error de servidor */}
                  {error && (
                    <div className="alert alert-warning text-center p-4 border shadow-sm rounded-3 my-5" role="alert">
                      <i className="bi bi-cloud-slash-fill text-warning fs-1 d-block mb-3"></i>
                      <h5 className="fw-bold text-dark">{error}</h5>
                      <p className="text-muted small">Por favor, inicia el backend y la base de datos o asegúrate de estar ejecutando en modo de prueba.</p>
                      <button className="btn btn-sgr-primary mt-2" onClick={fetchCatalog}>Reintentar Conexión</button>
                    </div>
                  )}

                  {/* Catálogo Grid */}
                  {!error && (
                    <>
                      {loading ? (
                        <div className="text-center py-5">
                          <div className="spinner-border text-success" role="status">
                            <span className="visually-hidden">Cargando...</span>
                          </div>
                          <p className="mt-2 text-muted">Cargando catálogo de botellas...</p>
                        </div>
                      ) : (
                        <div className="row">
                          {filteredArticulos.length === 0 ? (
                            <div className="col-12 text-center py-5 text-muted">
                              <i className="bi bi-box-fill fs-1 d-block mb-2 text-muted"></i>
                              <h5 className="fw-bold text-dark">No se encontraron artículos</h5>
                              <p className="small">Intenta buscar con otros términos o cambia el filtro de categorías.</p>
                            </div>
                          ) : (
                            filteredArticulos.map((articulo) => (
                              <ArticuloCard 
                                key={articulo.id} 
                                articulo={articulo} 
                                onAddToCart={handleAddToCart} 
                              />
                            ))
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              } 
            />

            {/* Rutas de Auth */}
            <Route 
              path="/login" 
              element={user ? <Navigate to={user.rol === 'admin' ? '/admin' : '/'} /> : <Login onLoginSuccess={handleLoginSuccess} />} 
            />
            <Route 
              path="/register" 
              element={user ? <Navigate to="/" /> : <Register />} 
            />

            {/* Ruta Protegida: Admin Dashboard */}
            <Route 
              path="/admin" 
              element={user && user.rol === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/login" />} 
            />
            
            <Route path="*" element={<Navigate to="/" />} />

          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-dark text-white py-4 mt-auto border-top border-secondary">
          <div className="container">
            <div className="row align-items-center justify-content-between">
              <div className="col-12 col-md-6 text-center text-md-start mb-3 mb-md-0">
                <span className="fw-bold fs-5 text-white d-flex align-items-center gap-2 justify-content-center justify-content-md-start">
                  <i className="bi bi-box-seam-fill text-success"></i> SGR Import
                </span>
                <span className="small text-secondary d-block mt-1">Tu importadora de confianza. Todos los derechos reservados &copy; 2026.</span>
              </div>
              <div className="col-12 col-md-6 text-center text-md-end">
                <div className="d-flex justify-content-center justify-content-md-end gap-3 fs-5 text-secondary">
                  <a href="#" className="text-secondary hover-success"><i className="bi bi-instagram"></i></a>
                  <a href="#" className="text-secondary hover-success"><i className="bi bi-facebook"></i></a>
                  <a href="#" className="text-secondary hover-success"><i className="bi bi-whatsapp"></i></a>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Sidebar Carrito */}
        <CarritoSidebar 
          cart={cart} 
          onUpdateQuantity={handleUpdateQuantity} 
          onRemoveFromCart={handleRemoveFromCart}
          onClearCart={handleClearCart}
        />

        {/* Modal de Finalización de Compra */}
        <CheckoutModal 
          cart={cart} 
          user={user} 
          onCheckoutSuccess={handleCheckoutSuccess} 
        />

      </div>
    </BrowserRouter>
  );
};

export default App;
