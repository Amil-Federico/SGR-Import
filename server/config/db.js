const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
  const isPostgres = process.env.DATABASE_URL.startsWith('postgres') || process.env.DATABASE_URL.startsWith('db');
  
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: isPostgres ? 'postgres' : 'sqlite',
    dialectOptions: isPostgres ? {
      ssl: {
        require: true,
        rejectUnauthorized: false // Requerido para conexiones seguras con Supabase
      }
    } : {},
    logging: false
  });
  console.log(`🔌 Conectado a la base de datos a través de DATABASE_URL (${isPostgres ? 'PostgreSQL' : 'SQLite'}).`);
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
  });
  console.log('⚠️ DATABASE_URL no provista en .env. Usando SQLite local (database.sqlite).');
}

module.exports = sequelize;
