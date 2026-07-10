const nodemailer = require('nodemailer');
require('dotenv').config();

const enviarPedidoEmail = async (req, res) => {
  try {
    const { productos, total, clienteEmail, clienteNombre } = req.body;

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ message: 'El carrito de productos está vacío o es inválido.' });
    }

    const host = process.env.EMAIL_HOST;
    const port = process.env.EMAIL_PORT || 587;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const receiver = process.env.EMAIL_RECEIVER || user; // Enviar al dueño, o auto-envío por defecto

    // Crear el cuerpo del correo en HTML
    let tableRows = '';
    productos.forEach(item => {
      const subtotal = (item.precio * item.cantidad).toFixed(2);
      tableRows += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.nombre}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">$${Number(item.precio).toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.cantidad}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${subtotal}</td>
        </tr>
      `;
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #0b2240; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="background-color: #0b2240; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">SGR IMPORT</h2>
          <p style="margin: 5px 0 0 0; color: #10b981; font-weight: bold;">Nuevo Pedido Recibido</p>
        </div>
        <div style="padding: 20px; background-color: #ffffff; color: #333333;">
          <p>Estimado Administrador,</p>
          <p>Has recibido un nuevo pedido a través del sitio web SGR Import. Aquí están los detalles:</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #10b981;">
            <p style="margin: 0 0 5px 0;"><strong>Cliente:</strong> ${clienteNombre || 'Usuario Registrado'}</p>
            <p style="margin: 0;"><strong>Email de contacto:</strong> ${clienteEmail || req.user?.email || 'No provisto'}</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Artículo</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Precio Unitario</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Cantidad</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          
          <div style="text-align: right; font-size: 18px; font-weight: bold; margin-top: 15px; color: #0b2240;">
            Total del Pedido: <span style="color: #10b981;">$${Number(total || 0).toFixed(2)}</span>
          </div>
        </div>
        <div style="background-color: #f1f3f5; color: #666666; font-size: 12px; padding: 15px; text-align: center; border-top: 1px solid #ddd;">
          Este correo fue generado automáticamente por la plataforma SGR Import.
        </div>
      </div>
    `;

    // Validar si las credenciales SMTP están presentes
    if (!host || !user || !pass) {
      console.log('🚨 Credenciales SMTP no configuradas. Correo no enviado, simulando éxito.');
      console.log('--- EMAIL SIMULADO ---');
      console.log('Para:', receiver);
      console.log('De:', user || 'sistema@sgrimport.com');
      console.log('Asunto:', `Nuevo Pedido - SGR Import`);
      console.log('Cuerpo HTML:\n', emailHtml);
      console.log('----------------------');

      return res.status(200).json({
        message: 'Pedido procesado en modo simulación (SMTP no configurado en el servidor).',
        simulated: true,
        emailContenido: emailHtml
      });
    }

    // Configurar Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: parseInt(port) === 465, // true para 465, false para otros puertos
      auth: {
        user,
        pass
      }
    });

    const mailOptions = {
      from: `"SGR Import Web" <${user}>`,
      to: receiver,
      subject: `Nuevo Pedido - SGR Import - de ${clienteNombre || req.user?.email || 'Cliente'}`,
      html: emailHtml
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);
    console.log(`📧 Correo de pedido enviado con éxito a ${receiver}`);

    res.status(200).json({
      message: 'Pedido por correo enviado exitosamente.',
      simulated: false
    });

  } catch (error) {
    console.error('Error al procesar pedido por correo:', error);
    res.status(500).json({
      message: 'Error en el servidor al intentar enviar el correo del pedido.',
      error: error.message
    });
  }
};

module.exports = {
  enviarPedidoEmail
};
