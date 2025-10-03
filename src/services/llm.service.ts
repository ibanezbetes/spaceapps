import OpenAI from 'openai';
import { env } from '../config/env';
import { ChatResponse, ObjectDetails } from '../domain/models';

const hasKey = !!env.OPENAI_API_KEY;
const client = hasKey ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : undefined;

const BASE_PROMPT = (
  context: ObjectDetails,
  question?: string
) => `Eres un asistente experto en astronomía. No hay base de datos. Genera una ficha a partir del "context" dado y si es necesario realiza 1–2 comprobaciones rápidas conceptuales (no hagas llamadas externas reales). Marca incertidumbre cuando falten datos o si das rangos aproximados. Cita fuentes cuando existan. Responde en JSON válido con las claves solicitadas.

Contexto:
${JSON.stringify(context)}

${question ? `Pregunta del usuario: ${question}` : ''}

Devuelve un JSON con el siguiente formato exacto:
{
  "facts": {
    "name": "...",
    "type": "...",
    "distance_ly": "~valor|rango|unknown",
    "size_km_or_ly": "~valor|rango|unknown",
    "coordinates": {"ra": number, "dec": number}
  },
  "funFact": "...",
  ${question ? '"answer": "...",' : ''}
  "sources": ["..."]
}`;

export async function generateObjectCard(context: ObjectDetails, question?: string, stream = false): Promise<ChatResponse> {
  const model = env.LLM_MODEL || 'gpt-4.1';
  if (!hasKey) {
    // Fallback mock for tests/dev without API key
    const base: ChatResponse = {
      facts: {
        name: context.name,
        type: context.category,
        distance_ly: 'unknown',
        size_km_or_ly: 'unknown',
        coordinates: { ra: context.ra, dec: context.dec }
      },
      funFact: 'Estimación aproximada basada en el contexto; datos exactos no disponibles sin API.',
      sources: context.sources
    };
    if (question) {
      base.answer = 'Respuesta aproximada: sin clave de API, se proporciona una explicación breve basada en metadatos.';
    }
    return base;
  }

  if (!stream) {
    const response = await client!.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'Eres un asistente que devuelve JSON válido.' },
        { role: 'user', content: BASE_PROMPT(context, question) }
      ],
      temperature: 0.2
    });
    const text = response.choices?.[0]?.message?.content || '{}';
    return JSON.parse(text) as ChatResponse;
  }

  // For streaming, emulate by returning a full result; controller will chunk
  const response = await client!.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: 'Eres un asistente que devuelve JSON válido.' },
      { role: 'user', content: BASE_PROMPT(context, question) }
    ],
    temperature: 0.2
  });
  const text = response.choices?.[0]?.message?.content || '{}';
  return JSON.parse(text) as ChatResponse;
}
