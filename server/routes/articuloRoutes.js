const express = require('express');
const router = express.Router();
const { getArticulos, createArticulo, updateArticulo, deleteArticulo } = require('../controllers/articuloController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Obtener todos los artículos (público)
router.get('/', getArticulos);

// Crear un artículo (Admin)
router.post('/', verifyToken, isAdmin, createArticulo);

// Editar un artículo (Admin)
router.put('/:id', verifyToken, isAdmin, updateArticulo);

// Eliminar un artículo (Admin)
router.delete('/:id', verifyToken, isAdmin, deleteArticulo);

module.exports = router;
