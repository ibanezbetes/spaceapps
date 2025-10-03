# Configuración del Chat IA con Google Gemini

## 🤖 Cómo obtener tu API Key de Gemini (GRATIS)

Google Gemini ofrece una API gratuita muy generosa que es perfecta para este proyecto.

### Paso 1: Obtener la API Key

1. **Ve a Google AI Studio**: https://aistudio.google.com/app/apikey
   - O también: https://makersuite.google.com/app/apikey

2. **Inicia sesión** con tu cuenta de Google

3. **Haz clic en "Create API Key"** o "Get API Key"

4. **Copia la clave** que se genera (algo como `AIzaSy...`)

### Paso 2: Configurar en el proyecto

1. **Crea un archivo `.env`** en la raíz del proyecto (si no existe):
   ```bash
   cp .env.example .env
   ```

2. **Edita el archivo `.env`** y pega tu API key:
   ```env
   GEMINI_API_KEY=AIzaSy_tu_clave_aqui
   ```

3. **Reinicia el servidor** para que cargue la nueva configuración:
   ```bash
   npm run dev
   ```

### Paso 3: Probar el chat

1. Abre la aplicación en http://localhost:5173
2. Haz clic en cualquier región del mapa astronómico
3. Verás un botón **"💬 Pregunta a la IA sobre [región]"**
4. Haz clic y empieza a chatear

## 📊 Límites de la API gratuita

Google Gemini ofrece un nivel gratuito muy generoso:

- **60 peticiones por minuto**
- **1,500 peticiones por día**
- **1 millón de tokens por mes**

Esto es más que suficiente para desarrollo y uso personal.

## ❓ Preguntas frecuentes

### ¿Es realmente gratis?

Sí, Google Gemini tiene un nivel completamente gratuito. No necesitas tarjeta de crédito.

### ¿Qué pasa si no configuro la API?

El botón de chat seguirá apareciendo, pero mostrará un mensaje indicando que el servicio no está configurado.

### ¿Puedo usar otra IA?

Sí, el código está preparado para que puedas cambiar fácilmente a otra API (OpenAI, Claude, etc.) modificando el archivo `src/server/routes/ai.ts`.

### ¿La API key es segura?

La API key solo se usa en el servidor (backend), nunca se expone al cliente. Asegúrate de no commitear el archivo `.env` a git (ya está en `.gitignore`).

## 🔧 Solución de problemas

### Error: "El servicio de chat IA no está configurado"

- Verifica que el archivo `.env` existe en la raíz del proyecto
- Verifica que la variable `GEMINI_API_KEY` está correctamente configurada
- Reinicia el servidor después de editar `.env`

### Error: "Invalid API key"

- Verifica que copiaste la clave completa (empieza con `AIzaSy...`)
- Genera una nueva clave en Google AI Studio si es necesario

### El chat no responde

- Abre la consola del navegador (F12) y busca errores
- Verifica que el servidor backend esté corriendo en el puerto 3000
- Revisa los logs del servidor para ver mensajes de error

## 📚 Recursos adicionales

- [Documentación de Gemini API](https://ai.google.dev/docs)
- [Google AI Studio](https://aistudio.google.com/)
- [Límites y cuotas de Gemini](https://ai.google.dev/pricing)
