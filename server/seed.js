const bcrypt = require('bcryptjs');
const { sequelize, Usuario, Articulo } = require('./models');
require('dotenv').config();

const seed = async () => {
  try {
    console.log('🌱 Iniciando sembrado de base de datos...');
    
    // Conectar y sincronizar
    await sequelize.sync({ force: true });
    console.log('✔ Base de datos limpiada y sincronizada (force: true).');

    // 1. Crear Usuarios de prueba
    console.log('👤 Creando usuarios de prueba...');
    const adminSalt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', adminSalt);
    const clientPassword = await bcrypt.hash('cliente123', adminSalt);

    await Usuario.create({
      email: 'admin@sgrimport.com',
      password: adminPassword,
      rol: 'admin'
    });

    await Usuario.create({
      email: 'cliente@sgrimport.com',
      password: clientPassword,
      rol: 'cliente'
    });

    console.log('✔ Usuarios creados con éxito:');
    console.log('   - Admin: admin@sgrimport.com | admin123');
    console.log('   - Cliente: cliente@sgrimport.com | cliente123');

    // 2. Crear 10 productos (Botellas de colores)
    console.log('🍼 Creando botellas de colores en catálogo...');
    const botellas = [
      {
        nombre: 'Botella Deportiva Azul Eléctrico',
        precio: 1250.00,
        cantidad: 25,
        descripcion: 'Botella de plástico Tritan libre de BPA, ideal para running y ciclismo. Capacidad de 750ml con pico deportivo antiderrames.',
        imagen: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80'
      },
      {
        nombre: 'Botella Térmica Verde Oliva',
        precio: 3400.00,
        cantidad: 15,
        descripcion: 'Botella de acero inoxidable con doble pared de aislamiento. Mantiene bebidas frías por 24 horas y calientes por 12 horas. Capacidad de 1L.',
        imagen: 'https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?w=600&auto=format&fit=crop&q=80'
      },
      {
        nombre: 'Botella de Vidrio Rosa Pastel',
        precio: 1800.00,
        cantidad: 20,
        descripcion: 'Elegante botella de vidrio borosilicatado de alta resistencia con funda protectora de silicona rosa pastel. Tapa de bambú ecológica. Capacidad de 550ml.',
        imagen: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&auto=format&fit=crop&q=80'
      },
      {
        nombre: 'Botella Motivacional Negro Mate',
        precio: 2100.00,
        cantidad: 30,
        descripcion: 'Botella de 2 litros con frases motivacionales y marcador de tiempo para asegurar tu hidratación diaria. Incluye sorbete desmontable y correa de transporte.',
        imagen: 'https://images.unsplash.com/photo-1618506557292-ec1862b3c506?w=600&auto=format&fit=crop&q=80'
      },
      {
        nombre: 'Botella de Aluminio Roja Sport',
        precio: 1500.00,
        cantidad: 8,
        descripcion: 'Botella súper liviana de aluminio reciclado con mosquetón para colgar en mochilas. Perfecta para caminatas y campamentos. Capacidad de 600ml.',
        imagen: 'https://images.unsplash.com/photo-1628102479410-b302c0199e82?w=600&auto=format&fit=crop&q=80'
      },
      {
        nombre: 'Botella de Vidrio Transparente SGR',
        precio: 1300.00,
        cantidad: 18,
        descripcion: 'Botella clásica para agua o jugos de vidrio de alta calidad. Viene con una funda protectora gris oscuro. Capacidad de 500ml.',
        imagen: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&auto=format&fit=crop&q=80'
      },
      {
        nombre: 'Botella Térmica Amarillo Sol',
        precio: 3200.00,
        cantidad: 12,
        descripcion: 'Añade color a tu día con esta botella térmica amarilla brillante de acero inoxidable. Excelente agarre con recubrimiento de pintura en polvo. Capacidad de 750ml.',
        imagen: 'https://images.unsplash.com/photo-1589362189688-21005ca7d0ca?w=600&auto=format&fit=crop&q=80'
      },
      {
        nombre: 'Botella Premium Turquesa',
        precio: 2900.00,
        cantidad: 5,
        descripcion: 'Botella de agua térmica con diseño ergonómico y tapa magnética. Mantiene tus bebidas frías durante el entrenamiento. Capacidad de 650ml.',
        imagen: 'https://images.unsplash.com/photo-1536936801211-0df755947b29?w=600&auto=format&fit=crop&q=80'
      },
      {
        nombre: 'Botella Infantil Violeta Glitter',
        precio: 1100.00,
        cantidad: 40,
        descripcion: 'Botella pequeña de 400ml para niños con sorbete rebatible de silicona y divertido diseño con brillos. Fácil de abrir y cerrar por manos pequeñas.',
        imagen: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=600&auto=format&fit=crop&q=80'
      },
      {
        nombre: 'Botella de Vidrio Naranja Sunset',
        precio: 1950.00,
        cantidad: 3,
        descripcion: 'Botella de vidrio templado con manga de silicona naranja texturada para un excelente agarre. Libre de químicos y olores. Capacidad de 600ml.',
        imagen: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&auto=format&fit=crop&q=80'
      }
    ];

    await Articulo.bulkCreate(botellas);
    console.log('✔ Catálogo de 10 botellas creado con éxito.');
    console.log('🌱 Sembrado finalizado correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el sembrado de base de datos:', error);
    process.exit(1);
  }
};

seed();
