// Script de prueba para el módulo de Ventas de Saldo
// Este archivo puede ejecutarse en un navegador o con Node.js para probar las funcionalidades

const API_BASE_URL = 'http://localhost:4002'; // Ajustar según la configuración del backend
const TOKEN = ''; // Agregar un token JWT válido aquí para pruebas

// Función para realizar pruebas de API
async function testBalanceSalesAPI() {
  console.log('Iniciando pruebas del API de Ventas de Saldo...');
  
  try {
    // 1. Obtener todas las ventas de saldo
    console.log('1. Obteniendo lista de ventas de saldo...');
    const salesResponse = await fetch(`${API_BASE_URL}/balance-sales`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    
    if (!salesResponse.ok) {
      throw new Error(`Error al obtener ventas: ${salesResponse.statusText}`);
    }
    
    const sales = await salesResponse.json();
    console.log(`Ventas obtenidas: ${sales.length}`);
    console.log(sales);
    
    // 2. Crear una nueva venta de saldo
    console.log('\n2. Creando nueva venta de saldo...');
    const newSale = {
      usuarioId: 1, // Ajustar según los datos disponibles
      telefonicaId: 1, // Ajustar según los datos disponibles
      flujoSaldoId: 1, // Ajustar según los datos disponibles
      cantidad: 1,
      monto: 100,
      fecha: new Date().toISOString(),
      observacion: 'Venta de prueba',
    };
    
    const createResponse = await fetch(`${API_BASE_URL}/balance-sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(newSale),
    });
    
    if (!createResponse.ok) {
      throw new Error(`Error al crear venta: ${createResponse.statusText}`);
    }
    
    const createdSale = await createResponse.json();
    console.log('Venta creada:');
    console.log(createdSale);
    
    // 3. Obtener venta por ID
    console.log(`\n3. Obteniendo venta con ID ${createdSale.id}...`);
    const saleByIdResponse = await fetch(`${API_BASE_URL}/balance-sales/${createdSale.id}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    
    if (!saleByIdResponse.ok) {
      throw new Error(`Error al obtener venta por ID: ${saleByIdResponse.statusText}`);
    }
    
    const saleById = await saleByIdResponse.json();
    console.log('Venta obtenida por ID:');
    console.log(saleById);
    
    // 4. Actualizar venta
    console.log(`\n4. Actualizando venta con ID ${createdSale.id}...`);
    const updateData = {
      cantidad: 2,
      monto: 200,
      observacion: 'Venta actualizada',
    };
    
    const updateResponse = await fetch(`${API_BASE_URL}/balance-sales/${createdSale.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(updateData),
    });
    
    if (!updateResponse.ok) {
      throw new Error(`Error al actualizar venta: ${updateResponse.statusText}`);
    }
    
    const updatedSale = await updateResponse.json();
    console.log('Venta actualizada:');
    console.log(updatedSale);
    
    // 5. Eliminar venta
    console.log(`\n5. Eliminando venta con ID ${createdSale.id}...`);
    const deleteResponse = await fetch(`${API_BASE_URL}/balance-sales/${createdSale.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    
    if (!deleteResponse.ok) {
      throw new Error(`Error al eliminar venta: ${deleteResponse.statusText}`);
    }
    
    console.log('Venta eliminada correctamente');
    
    // 6. Verificar que la venta fue eliminada
    console.log(`\n6. Verificando eliminación de venta con ID ${createdSale.id}...`);
    const verifyDeleteResponse = await fetch(`${API_BASE_URL}/balance-sales/${createdSale.id}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    
    if (verifyDeleteResponse.status === 404) {
      console.log('Venta eliminada correctamente (404 Not Found)');
    } else if (verifyDeleteResponse.ok) {
      const deletedSale = await verifyDeleteResponse.json();
      console.log('La venta aún existe pero podría estar marcada como inactiva:');
      console.log(deletedSale);
    } else {
      console.log(`Estado de respuesta: ${verifyDeleteResponse.status}`);
    }
    
    console.log('\nPruebas completadas con éxito!');
    
  } catch (error) {
    console.error('Error en las pruebas:', error);
  }
}

// Ejecutar pruebas
// Para ejecutar en navegador, descomentar:
// document.addEventListener('DOMContentLoaded', testBalanceSalesAPI);

// Para ejecutar en Node.js con fetch (requiere node-fetch en Node.js < 18):
// testBalanceSalesAPI();

// Exportar función para uso en otros archivos
export { testBalanceSalesAPI };
