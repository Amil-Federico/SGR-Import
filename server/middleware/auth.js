const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Espera formato 'Bearer TOKEN'

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. Token no provisto.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    req.user = verified;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado.' });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No autenticado.' });
  }
  
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Requiere rol de Administrador.' });
  }
  
  next();
};

module.exports = {
  verifyToken,
  isAdmin
};
