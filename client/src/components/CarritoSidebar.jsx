import React from 'react';

const CarritoSidebar = ({ cart, onUpdateQuantity, onRemoveFromCart, onClearCart }) => {
  
  const formatPrice = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.precio * item.cantidadSeleccionada, 0);
  };

  const total = calculateTotal();

  return (
    <div 
      className="offcanvas offcanvas-end offcanvas-sgr sgr-glass-panel" 
      data-bs-scroll="true" 
      tabIndex="-1" 
      id="cartSidebar" 
      aria-labelledby="cartSidebarLabel"
    >
      {/* Cabecera */}
      <div className="offcanvas-header py-3 px-4">
        <h5 className="offcanvas-title fw-bold d-flex align-items-center gap-2" id="cartSidebarLabel">
          <i className="bi bi-cart3"></i> Tu Carrito
        </h5>
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>

      {/* Cuerpo */}
      <div className="offcanvas-body p-4 d-flex flex-column">
        {cart.length === 0 ? (
          <div className="my-auto text-center py-5">
            <i className="bi bi-cart-x text-muted" style={{ fontSize: '4rem' }}></i>
            <h5 className="mt-3 fw-bold text-dark">Tu carrito está vacío</h5>
            <p className="text-muted small">Agrega productos desde el catálogo para comenzar tu compra.</p>
            <button className="btn btn-sgr-primary mt-3" data-bs-dismiss="offcanvas">
              Ver Catálogo
            </button>
          </div>
        ) : (
          <>
            {/* Lista de productos */}
            <div className="flex-grow-1 overflow-auto pe-1" style={{ maxHeight: 'calc(100vh - 280px)' }}>
              {cart.map((item) => (
                <div key={item.id} className="d-flex align-items-center gap-3 pb-3 mb-3 border-bottom">
                  {/* Imagen */}
                  <img 
                    src={item.imagen} 
                    alt={item.nombre} 
                    style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--sgr-border)' }} 
                  />
                  
                  {/* Datos del producto */}
                  <div className="flex-grow-1 min-w-0">
                    <h6 className="fw-bold mb-1 text-truncate" style={{ fontSize: '0.925rem' }}>{item.nombre}</h6>
                    <div className="text-muted small mb-2">{formatPrice(item.precio)} c/u</div>
                    
                    {/* Controles de cantidad */}
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="input-group input-group-sm" style={{ width: '100px' }}>
                        <button 
                          className="btn btn-outline-secondary px-2" 
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, item.cantidadSeleccionada - 1)}
                        >
                          <i className="bi bi-dash"></i>
                        </button>
                        <span className="form-control text-center bg-light fw-bold py-0 d-flex align-items-center justify-content-center" style={{ fontSize: '0.85rem' }}>
                          {item.cantidadSeleccionada}
                        </span>
                        <button 
                          className="btn btn-outline-secondary px-2" 
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, item.cantidadSeleccionada + 1)}
                          disabled={item.cantidadSeleccionada >= item.cantidad} // No superar stock total
                        >
                          <i className="bi bi-plus"></i>
                        </button>
                      </div>
                      
                      {/* Eliminar */}
                      <button 
                        className="btn btn-link text-danger p-0" 
                        onClick={() => onRemoveFromCart(item.id)}
                        title="Eliminar artículo"
                      >
                        <i className="bi bi-trash-fill fs-5"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desglose de totales y acciones */}
            <div className="mt-auto pt-3 border-top bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-semibold text-muted">Subtotal:</span>
                <span className="fs-5 fw-bold text-dark">{formatPrice(total)}</span>
              </div>
              
              <div className="d-grid gap-2">
                {/* Botón Finalizar Compra - Cierra offcanvas y abre modal */}
                <button 
                  className="btn btn-sgr-success py-2.5 fw-bold"
                  data-bs-toggle="modal"
                  data-bs-target="#checkoutModal"
                  data-bs-dismiss="offcanvas"
                >
                  <i className="bi bi-shield-check me-2"></i> Finalizar Compra
                </button>
                
                <button 
                  className="btn btn-outline-danger py-2 btn-sm fw-semibold"
                  onClick={onClearCart}
                >
                  <i className="bi bi-cart-x-fill me-1"></i> Vaciar Carrito
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CarritoSidebar;
