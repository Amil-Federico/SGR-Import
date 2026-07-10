const sequelize = require('../config/db');
const Usuario = require('./Usuario');
const Articulo = require('./Articulo');

// Aquí se pueden definir relaciones o asociaciones si en el futuro se requieren
// Por ejemplo: Usuario.hasMany(Pedido); Pedido.belongsTo(Usuario);

module.exports = {
  sequelize,
  Usuario,
  Articulo
};
