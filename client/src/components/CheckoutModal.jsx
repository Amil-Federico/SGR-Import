import React, { useState, useEffect } from 'react';

const CheckoutModal = ({ cart, user, onCheckoutSuccess }) => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Número de WhatsApp del dueño de la tienda (configurable)
  const OWNER_WHATSAPP_NUMBER = '5491133334444'; // Ejemplo: Argentina (+54 9 11 3333-4444)

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || '');
    }
  }, [user]);

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.precio * item.cantidadSeleccionada, 0);
  };

  const total = calculateTotal();

  const formatPrice = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value);
  };

  // 1. Generar enlace y enviar por WhatsApp
  const handleWhatsAppCheckout = () => {
    if (!nombre.trim()) {
      setAlert({ type: 'danger', message: 'Por favor, ingresa tu nombre antes de continuar.' });
      return;
    }

    let message = `🛒 *SGR IMPORT - NUEVO PEDIDO* 🛒\n`;
    message += `-------------------------------------------\n`;
    message += `👤 *Cliente:* ${nombre}\n`;
    message += `📧 *Email:* ${user?.email || 'No especificado'}\n`;
    if (telefono.trim()) {
      message += `📞 *Teléfono:* ${telefono}\n`;
    }
    message += `-------------------------------------------\n\n`;
    message += `📦 *Detalle del Pedido:*\n`;

    cart.forEach((item) => {
      const subtotal = item.precio * item.cantidadSeleccionada;
      message += `- *${item.nombre}*\n`;
      message += `  Cant: ${item.cantidadSeleccionada} x ${formatPrice(item.precio)} = *${formatPrice(subtotal)}*\n`;
    });

    message += `\n-------------------------------------------\n`;
    message += `💰 *TOTAL A PAGAR: ${formatPrice(total)}*\n`;
    message += `-------------------------------------------\n`;
    message += `¡Muchas gracias! Aguardo confirmación de stock.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${OWNER_WHATSAPP_NUMBER}?text=${encodedMessage}`;

    // Abrir WhatsApp en nueva pestaña
    window.open(whatsappUrl, '_blank');
    
    // Limpiar carrito y cerrar modal
    onCheckoutSuccess();
    
    // Cerrar modal programáticamente con Bootstrap
    const modalElement = document.getElementById('checkoutModal');
    const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) modalInstance.hide();
  };

  // 2. Procesar y enviar por Email a través del Backend
  const handleEmailCheckout = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setAlert({ type: 'danger', message: 'Por favor, ingresa tu nombre antes de continuar.' });
      return;
    }

    setLoading(true);
    setAlert(null);

    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    try {
      const response = await fetch(`${API_URL}/pedidos/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productos: cart.map(item => ({
            id: item.id,
            nombre: item.nombre,
            precio: item.precio,
            cantidad: item.cantidadSeleccionada
          })),
          total: total,
          clienteNombre: nombre,
          clienteEmail: user?.email || 'cliente@sgrimport.com'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar el pedido por email.');
      }

      setAlert({ 
        type: 'success', 
        message: data.simulated 
          ? '🎉 Pedido simulado con éxito (SMTP no configurado). Detalles impresos en la consola del servidor.' 
          : '📧 ¡Pedido enviado exitosamente al correo del dueño!' 
      });

      // Esperar 2.5 segundos para mostrar el mensaje y luego limpiar carrito y cerrar modal
      setTimeout(() => {
        onCheckoutSuccess();
        const modalElement = document.getElementById('checkoutModal');
        const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) modalInstance.hide();
        setAlert(null);
      }, 2500);

    } catch (error) {
      console.error(error);
      setAlert({ type: 'danger', message: error.message || 'Ocurrió un error inesperado.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="modal fade" 
      id="checkoutModal" 
      tabIndex="-1" 
      aria-labelledby="checkoutModalLabel" 
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow border-0" style={{ borderRadius: '16px' }}>
          
          {/* Cabecera */}
          <div className="modal-header py-3 px-4" style={{ backgroundColor: 'var(--sgr-dark)', color: '#ffffff', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
            <h5 className="modal-title fw-bold" id="checkoutModalLabel">
              <i className="bi bi-wallet2 me-2"></i> Finalizar tu Pedido
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              data-bs-dismiss="modal" 
              aria-label="Close"
              style={{ filter: 'invert(1) grayscale(100%) brightness(200%)' }}
              disabled={loading}
            ></button>
          </div>

          {/* Cuerpo */}
          <div className="modal-body p-4">
            {alert && (
              <div className={`alert alert-${alert.type} d-flex align-items-center gap-2`} role="alert">
                <i className={`bi bi-${alert.type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'}`}></i>
                <div>{alert.message}</div>
              </div>
            )}

            <form onSubmit={handleEmailCheckout}>
              <h6 className="fw-bold text-dark mb-3">Información del Cliente</h6>
              
              <div className="mb-3">
                <label htmlFor="checkoutName" className="form-label small fw-semibold text-muted">Nombre Completo</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="checkoutName" 
                  placeholder="Ej. Juan Pérez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  disabled={loading}
                  style={{ borderRadius: '8px' }}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="checkoutPhone" className="form-label small fw-semibold text-muted">Teléfono de Contacto (Opcional)</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  id="checkoutPhone" 
                  placeholder="Ej. +5491167890123"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  disabled={loading}
                  style={{ borderRadius: '8px' }}
                />
              </div>

              {/* Resumen de Compra */}
              <div className="bg-light p-3 rounded mb-4" style={{ border: '1px solid var(--sgr-border)' }}>
                <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '0.9rem' }}>Resumen de Compra</h6>
                <div className="d-flex justify-content-between text-muted mb-1 small">
                  <span>Productos en carrito:</span>
                  <span>{cart.reduce((sum, item) => sum + item.cantidadSeleccionada, 0)} unidades</span>
                </div>
                <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                  <span className="fw-bold text-dark">Total:</span>
                  <span className="fw-bold fs-5 text-success">{formatPrice(total)}</span>
                </div>
              </div>

              <h6 className="fw-bold text-dark mb-3">Método de Notificación</h6>
              <p className="text-muted small mb-4">
                Elige cómo deseas notificar y formalizar tu pedido con el dueño de SGR Import:
              </p>

              {/* Botones de Selección */}
              <div className="d-grid gap-2">
                <button 
                  type="button" 
                  className="btn btn-success py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2"
                  onClick={handleWhatsAppCheckout}
                  disabled={loading}
                  style={{ borderRadius: '8px' }}
                >
                  <i className="bi bi-whatsapp fs-5"></i>
                  <span>Enviar por WhatsApp</span>
                </button>

                <button 
                  type="submit" 
                  className="btn btn-sgr-primary py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                  style={{ borderRadius: '8px' }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Enviando Email...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-envelope-at fs-5"></i>
                      <span>Enviar por Email</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
