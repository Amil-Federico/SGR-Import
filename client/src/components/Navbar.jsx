import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ cartCount, user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-sgr sticky-top py-3">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-box-seam-fill text-success me-2 fs-3"></i>
          <span className="fs-4">SGR Import</span>
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-center">
            <li className="nav-item">
              <Link className="nav-link" to="/">Catálogo</Link>
            </li>
            {user && user.rol === 'admin' && (
              <li className="nav-item">
                <Link className="nav-link text-success fw-bold" to="/admin">
                  <i className="bi bi-speedometer2 me-1"></i> Panel Admin
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {/* Botón Carrito */}
            <button 
              className="btn btn-outline-light position-relative d-flex align-items-center gap-2 px-3 py-2"
              data-bs-toggle="offcanvas"
              data-bs-target="#cartSidebar"
              aria-controls="cartSidebar"
              style={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <i className="bi bi-cart3 fs-5"></i>
              <span className="d-none d-sm-inline fw-semibold">Carrito</span>
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success border border-light">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Estado de Autenticación */}
            {user ? (
              <div className="dropdown">
                <button 
                  className="btn btn-sgr-success dropdown-toggle d-flex align-items-center gap-2"
                  type="button" 
                  id="userDropdown" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle"></i>
                  <span className="d-none d-md-inline" style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 p-2 mt-2" aria-labelledby="userDropdown" style={{ borderRadius: '8px' }}>
                  <li className="dropdown-header border-bottom pb-2 mb-2">
                    <strong>Rol:</strong> {user.rol === 'admin' ? 'Administrador' : 'Cliente'}
                  </li>
                  {user.rol === 'admin' && (
                    <li>
                      <Link className="dropdown-item rounded py-2" to="/admin">
                        <i className="bi bi-sliders me-2"></i>Administrar
                      </Link>
                    </li>
                  )}
                  <li>
                    <button className="dropdown-item text-danger rounded py-2" onClick={handleLogoutClick}>
                      <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link className="btn btn-outline-light text-decoration-none px-3" to="/login">Ingresar</Link>
                <Link className="btn btn-sgr-success px-3" to="/register">Registrarse</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
