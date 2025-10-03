// Listar modelos disponibles en Gemini API
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log('🔑 API Key:', GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : 'NO CONFIGURADA');
console.log('\n📡 Listando modelos disponibles...\n');

fetch(`https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`)
  .then(response => response.json())
  .then(data => {
    console.log('📦 Modelos disponibles:');
    if (data.models) {
      data.models.forEach(model => {
        console.log(`\n  ✅ ${model.name}`);
        console.log(`     Descripción: ${model.displayName}`);
        console.log(`     Métodos soportados: ${model.supportedGenerationMethods?.join(', ')}`);
      });
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
  });
