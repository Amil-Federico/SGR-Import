const { Articulo } = require('../models');

// Obtener todos los artículos (público)
const getArticulos = async (req, res) => {
  try {
    const articulos = await Articulo.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(articulos);
  } catch (error) {
    console.error('Error al obtener artículos:', error);
    res.status(500).json({ message: 'Error en el servidor al obtener los artículos.', error: error.message });
  }
};

// Crear un artículo (Admin)
const createArticulo = async (req, res) => {
  try {
    const { nombre, cantidad, precio, descripcion, imagen } = req.body;

    if (!nombre || precio === undefined || cantidad === undefined) {
      return res.status(400).json({ message: 'Nombre, precio y cantidad son campos obligatorios.' });
    }

    const nuevoArticulo = await Articulo.create({
      nombre,
      cantidad,
      precio,
      descripcion,
      imagen: imagen || undefined
    });

    res.status(201).json({
      message: 'Artículo creado exitosamente.',
      articulo: nuevoArticulo
    });
  } catch (error) {
    console.error('Error al crear artículo:', error);
    res.status(500).json({ message: 'Error en el servidor al crear el artículo.', error: error.message });
  }
};

// Editar un artículo (Admin)
const updateArticulo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, cantidad, precio, descripcion, imagen } = req.body;

    const articulo = await Articulo.findByPk(id);
    if (!articulo) {
      return res.status(404).json({ message: 'Artículo no encontrado.' });
    }

    // Actualizar campos
    if (nombre !== undefined) articulo.nombre = nombre;
    if (cantidad !== undefined) articulo.cantidad = cantidad;
    if (precio !== undefined) articulo.precio = precio;
    if (descripcion !== undefined) articulo.descripcion = descripcion;
    if (imagen !== undefined) articulo.imagen = imagen;

    await articulo.save();

    res.json({
      message: 'Artículo actualizado exitosamente.',
      articulo
    });
  } catch (error) {
    console.error('Error al actualizar artículo:', error);
    res.status(500).json({ message: 'Error en el servidor al actualizar el artículo.', error: error.message });
  }
};

// Eliminar un artículo (Admin)
const deleteArticulo = async (req, res) => {
  try {
    const { id } = req.params;

    const articulo = await Articulo.findByPk(id);
    if (!articulo) {
      return res.status(404).json({ message: 'Artículo no encontrado.' });
    }

    await articulo.destroy();

    res.json({
      message: 'Artículo eliminado exitosamente.'
    });
  } catch (error) {
    console.error('Error al eliminar artículo:', error);
    res.status(500).json({ message: 'Error en el servidor al eliminar el artículo.', error: error.message });
  }
};

module.exports = {
  getArticulos,
  createArticulo,
  updateArticulo,
  deleteArticulo
};
