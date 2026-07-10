const express = require('express');
const router = express.Router();
const { enviarPedidoEmail } = require('../controllers/pedidoController');
const { verifyToken } = require('../middleware/auth');

// Endpoint para procesar y enviar el pedido por email (protegido por JWT)
router.post('/email', verifyToken, enviarPedidoEmail);

module.exports = router;
