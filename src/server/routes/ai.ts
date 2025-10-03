/**
 * Ruta para chat con IA (Google Gemini)
 */

import express from 'express';

const router = express.Router();

// Configuración de Gemini
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface ChatRequest {
  message: string;
  context?: {
    regionName?: string;
    regionDescription?: string;
    ra: number;
    dec: number;
  };
  history?: Array<{ role: string; content: string }>;
}

/**
 * POST /api/ai/chat
 * Envía un mensaje al chat de IA y recibe una respuesta
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, context, history = [] }: ChatRequest = req.body;

    console.log('[AI CHAT] Nueva petición:', { message: message.substring(0, 50), hasContext: !!context });

    if (!message) {
      return res.status(400).json({ error: 'El mensaje es requerido' });
    }

    // Leer la API key en tiempo de ejecución
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

    // Si no hay API key, devolver mensaje de error amigable
    if (!GEMINI_API_KEY) {
      console.error('[AI CHAT] API Key no configurada');
      console.error('[AI CHAT] process.env.GEMINI_API_KEY:', process.env.GEMINI_API_KEY);
      console.error('[AI CHAT] Todas las env vars:', Object.keys(process.env).filter(k => k.includes('GEMINI')));
      return res.status(503).json({
        response: 'Lo siento, el servicio de chat IA no está configurado. Por favor, configura GEMINI_API_KEY en las variables de entorno.',
      });
    }

    console.log('[AI CHAT] API Key disponible:', GEMINI_API_KEY.substring(0, 10) + '...');

    // Construir el contexto para la IA
    let systemPrompt = `Eres un asistente astronómico experto y amigable. Tu trabajo es ayudar a usuarios a entender objetos y regiones del universo.`;
    
    if (context?.regionName) {
      systemPrompt += `\n\nEl usuario está preguntando sobre: ${context.regionName}`;
      if (context.regionDescription) {
        systemPrompt += `\nDescripción: ${context.regionDescription}`;
      }
      systemPrompt += `\nCoordenadas: RA=${context.ra.toFixed(4)}°, Dec=${context.dec.toFixed(4)}°`;
    }

    systemPrompt += `\n\nResponde de forma clara, educativa y entusiasta. Usa términos técnicos cuando sea apropiado pero explícalos. Sé conciso pero informativo (máximo 200 palabras).`;

    // Construir el historial de conversación para Gemini
    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }],
      },
      {
        role: 'model',
        parts: [{ text: '¡Entendido! Estoy listo para ayudarte a explorar el universo.' }],
      },
    ];

    // Añadir historial de conversación
    history.forEach((msg) => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    });

    // Añadir el mensaje actual
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // Llamar a la API de Gemini
    console.log('[AI CHAT] Llamando a Gemini API...');
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 500,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      }),
    });

    console.log('[AI CHAT] Respuesta de Gemini - Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[AI CHAT] Error de Gemini:', JSON.stringify(errorData, null, 2));
      throw new Error(`Error de Gemini: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data: any = await response.json();
    console.log('[AI CHAT] Datos recibidos:', JSON.stringify(data, null, 2));

    // Extraer la respuesta
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Lo siento, no pude generar una respuesta.';

    console.log('[AI CHAT] Respuesta generada exitosamente');
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('[AI CHAT] Error completo:', error);
    console.error('[AI CHAT] Stack trace:', (error as Error).stack);
    res.status(500).json({
      response: 'Lo siento, hubo un error al procesar tu pregunta. Por favor, intenta de nuevo más tarde.',
    });
  }
});

export default router;
