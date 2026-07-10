import React from 'react';

const ArticuloCard = ({ articulo, onAddToCart }) => {
  const { nombre, precio, cantidad, descripcion, imagen } = articulo;
  const isOutOfStock = cantidad <= 0;

  // Formatear precio a moneda
  const formatPrice = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value);
  };

  return (
    <div className="col-12 col-md-6 col-lg-4 col-xl-3 mb-4 animate-fade-in">
      <div className="card sgr-card">
        {/* Contenedor de Imagen y Badge de Stock */}
        <div className="sgr-card-img-container">
          <img 
            src={imagen || 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500'} 
            alt={nombre} 
            className="sgr-card-img"
            loading="lazy"
          />
          {isOutOfStock ? (
            <span className="sgr-card-badge-out">Sin Stock</span>
          ) : (
            <span className="sgr-card-badge">Stock: {cantidad}</span>
          )}
        </div>

        {/* Detalles del Artículo */}
        <div className="card-body d-flex flex-column p-4">
          <h5 className="card-title fw-bold text-dark mb-2 text-truncate-2" style={{ height: '48px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {nombre}
          </h5>
          <p className="card-text text-muted mb-3 text-truncate-3" style={{ fontSize: '0.875rem', height: '60px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
            {descripcion || 'Sin descripción disponible para este producto.'}
          </p>
          
          <div className="mt-auto d-flex align-items-center justify-content-between pt-3 border-top">
            <span className="sgr-price-tag">{formatPrice(precio)}</span>
            <button 
              className={`btn ${isOutOfStock ? 'btn-secondary' : 'btn-sgr-success'} d-flex align-items-center gap-2`}
              onClick={() => !isOutOfStock && onAddToCart(articulo)}
              disabled={isOutOfStock}
              style={{ borderRadius: '8px', padding: '0.5rem 1rem' }}
            >
              <i className="bi bi-cart-plus"></i>
              <span>{isOutOfStock ? 'Sin Stock' : 'Agregar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticuloCard;
