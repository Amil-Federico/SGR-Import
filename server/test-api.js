const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const articuloRoutes = require('./routes/articuloRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
require('dotenv').config();

const PORT = 5055;
const BASE_URL = `http://localhost:${PORT}/api`;

const runTests = async () => {
  let server;
  try {
    console.log('🧪 Iniciando pruebas de integración de la API...');

    // 1. Configurar y arrancar servidor de prueba
    const app = express();
    app.use(cors());
    app.use(express.json());

    app.use('/api/auth', authRoutes);
    app.use('/api/articulos', articuloRoutes);
    app.use('/api/pedidos', pedidoRoutes);

    await sequelize.sync({ force: true });
    console.log('✔ Base de datos de prueba sincronizada.');

    server = app.listen(PORT, async () => {
      console.log(`✔ Servidor de prueba levantado en el puerto ${PORT}.`);
      
      try {
        await executeTestSuite();
        console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON CORRECTAMENTE!');
        server.close();
        await sequelize.close();
        process.exit(0);
      } catch (error) {
        console.error('\n❌ ERROR EN LAS PRUEBAS:', error.message);
        if (server) server.close();
        await sequelize.close();
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('❌ Error al iniciar el entorno de pruebas:', error);
    if (server) server.close();
    process.exit(1);
  }
};

const executeTestSuite = async () => {
  // Test Data
  const testUser = {
    email: 'test_client@sgrimport.com',
    password: 'password123',
    rol: 'cliente'
  };

  const adminUser = {
    email: 'admin_test@sgrimport.com',
    password: 'adminpassword',
    rol: 'admin'
  };

  let clientToken = '';
  let adminToken = '';
  let createdArticleId = '';

  // 1. REGISTRO DE CLIENTE
  console.log('\n--- Prueba 1: Registro de usuario cliente ---');
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });
  const regData = await regRes.json();
  assert(regRes.status === 201, `Se esperaba status 201, se obtuvo ${regRes.status}. Msg: ${regData.message}`);
  console.log('✔ Cliente registrado con éxito.');

  // 2. LOGIN DE CLIENTE
  console.log('\n--- Prueba 2: Login de usuario cliente ---');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUser.email, password: testUser.password })
  });
  const loginData = await loginRes.json();
  assert(loginRes.status === 200, `Se esperaba status 200, se obtuvo ${loginRes.status}. Msg: ${loginData.message}`);
  assert(!!loginData.token, 'Se esperaba un token en el login');
  clientToken = loginData.token;
  console.log('✔ Login de cliente exitoso. Token recibido.');

  // 3. REGISTRO DE ADMIN
  console.log('\n--- Prueba 3: Registro de usuario admin ---');
  const regAdminRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adminUser)
  });
  assert(regAdminRes.status === 201, `Registro admin falló con ${regAdminRes.status}`);
  console.log('✔ Admin registrado con éxito.');

  // 4. LOGIN DE ADMIN
  console.log('\n--- Prueba 4: Login de usuario admin ---');
  const loginAdminRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminUser.email, password: adminUser.password })
  });
  const loginAdminData = await loginAdminRes.json();
  assert(loginAdminRes.status === 200, `Login admin falló con ${loginAdminRes.status}`);
  adminToken = loginAdminData.token;
  console.log('✔ Login de admin exitoso. Token recibido.');

  // 5. OBTENER CATALOGO VACIO
  console.log('\n--- Prueba 5: Obtener catálogo de artículos ---');
  const getArtRes = await fetch(`${BASE_URL}/articulos`);
  const getArtData = await getArtRes.json();
  assert(getArtRes.status === 200, `Error al obtener artículos`);
  assert(Array.isArray(getArtData), 'El catálogo debe retornar un array');
  console.log(`✔ Catálogo obtenido. Artículos cargados: ${getArtData.length}`);

  // 6. CREAR ARTICULO SIN SER ADMIN (DEBE FALLAR 403)
  console.log('\n--- Prueba 6: Intentar crear artículo con rol "cliente" (debe ser denegado) ---');
  const dummyArticle = {
    nombre: 'Botella Test Falla',
    precio: 99.99,
    cantidad: 10,
    descripcion: 'No debería crearse'
  };
  const createFailRes = await fetch(`${BASE_URL}/articulos`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${clientToken}`
    },
    body: JSON.stringify(dummyArticle)
  });
  assert(createFailRes.status === 403, `Se esperaba 403 Forbidden, se obtuvo ${createFailRes.status}`);
  console.log('✔ Acceso denegado correctamente para rol cliente.');

  // 7. CREAR ARTICULO SIENDO ADMIN
  console.log('\n--- Prueba 7: Crear artículo con rol "admin" ---');
  const validArticle = {
    nombre: 'Botella Test Exitosa',
    precio: 155.50,
    cantidad: 12,
    descripcion: 'Creado en las pruebas de integración.',
    imagen: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500'
  };
  const createOkRes = await fetch(`${BASE_URL}/articulos`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(validArticle)
  });
  const createOkData = await createOkRes.json();
  assert(createOkRes.status === 201, `Se esperaba 201 Created, se obtuvo ${createOkRes.status}`);
  assert(!!createOkData.articulo.id, 'Falta id del artículo creado');
  createdArticleId = createOkData.articulo.id;
  console.log(`✔ Artículo creado exitosamente con ID: ${createdArticleId}`);

  // 8. EDITAR ARTICULO SIENDO ADMIN
  console.log('\n--- Prueba 8: Editar artículo con rol "admin" ---');
  const editArticle = {
    nombre: 'Botella Test Modificada',
    precio: 200.00,
    cantidad: 5
  };
  const editRes = await fetch(`${BASE_URL}/articulos/${createdArticleId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(editArticle)
  });
  const editData = await editRes.json();
  assert(editRes.status === 200, `Se esperaba 200 OK, se obtuvo ${editRes.status}`);
  assert(editData.articulo.nombre === 'Botella Test Modificada', 'El nombre no cambió');
  assert(Number(editData.articulo.precio) === 200.00, 'El precio no cambió');
  console.log('✔ Artículo editado correctamente.');

  // 9. PROCESAR PEDIDO EMAIL (JWT CLIENTE)
  console.log('\n--- Prueba 9: Procesar checkout/pedido por correo ---');
  const orderPayload = {
    productos: [
      { id: createdArticleId, nombre: 'Botella Test Modificada', precio: 200.00, cantidad: 2 }
    ],
    total: 400.00,
    clienteNombre: 'Test Client',
    clienteEmail: 'cliente_test_email@sgrimport.com'
  };
  const orderRes = await fetch(`${BASE_URL}/pedidos/email`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${clientToken}`
    },
    body: JSON.stringify(orderPayload)
  });
  const orderData = await orderRes.json();
  assert(orderRes.status === 200, `Se esperaba 200 OK, se obtuvo ${orderRes.status}. Msg: ${orderData.message}`);
  assert(orderData.simulated === true, 'Se esperaba simulación al no haber SMTP');
  console.log('✔ Pedido por correo procesado y simulado correctamente.');

  // 10. ELIMINAR ARTICULO SIENDO ADMIN
  console.log('\n--- Prueba 10: Eliminar artículo con rol "admin" ---');
  const deleteRes = await fetch(`${BASE_URL}/articulos/${createdArticleId}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${adminToken}`
    }
  });
  assert(deleteRes.status === 200, `Se esperaba 200 OK al eliminar, se obtuvo ${deleteRes.status}`);
  console.log('✔ Artículo eliminado correctamente.');

  // 11. VERIFICAR QUE SE ELIMINÓ DEL CATALOGO
  console.log('\n--- Prueba 11: Verificar eliminación en catálogo ---');
  const getArtFinalRes = await fetch(`${BASE_URL}/articulos`);
  const getArtFinalData = await getArtFinalRes.json();
  const found = getArtFinalData.some(a => a.id === createdArticleId);
  assert(!found, 'El artículo eliminado aún se encuentra en el catálogo');
  console.log('✔ Catálogo validado. El artículo ya no figura.');
};

const assert = (condition, errorMessage) => {
  if (!condition) {
    throw new Error(errorMessage || 'Validación fallida');
  }
};

runTests();
