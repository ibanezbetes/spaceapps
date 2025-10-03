// Script de prueba rápida para verificar la API de Gemini
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

console.log('🔑 API Key:', GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : 'NO CONFIGURADA');
console.log('🌐 URL:', GEMINI_API_URL);
console.log('\n📡 Enviando petición de prueba...\n');

const testMessage = {
  contents: [
    {
      role: 'user',
      parts: [{ text: 'Hola, responde solo con "OK" si funcionas correctamente' }]
    }
  ]
};

fetch(GEMINI_API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-goog-api-key': GEMINI_API_KEY,
  },
  body: JSON.stringify(testMessage),
})
  .then(response => {
    console.log('✅ Status:', response.status);
    console.log('✅ Status Text:', response.statusText);
    return response.json();
  })
  .then(data => {
    console.log('\n📦 Respuesta completa:');
    console.log(JSON.stringify(data, null, 2));
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      console.log('\n✨ Texto extraído:', text);
      console.log('\n🎉 ¡Gemini funciona correctamente!');
    } else {
      console.log('\n❌ No se pudo extraer el texto de la respuesta');
    }
  })
  .catch(error => {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  });
