require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 Configuración de CORS mejorada para permitir conexión desde Framer
const corsOptions = {
  origin: "*",  // Permite acceso desde cualquier origen (ajústalo si necesitas más seguridad)
  methods: "POST, GET, OPTIONS",
  allowedHeaders: ["Content-Type"]
};
app.use(cors(corsOptions));
app.use(express.json());

// ✅ Verificar que la API Key de Anthropic esté definida
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("❌ Error: No se ha definido la API Key de Anthropic.");
  process.exit(1);
} else {
  console.log("✅ API Key de Anthropic detectada.");
}

// 🔥 Configurar conexión con Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 📌 Ruta principal para generar frases con Claude 3.5 Sonnet
app.post('/generate-phrases', async (req, res) => {
  try {
    const { userInput } = req.body;

    if (!userInput) {
      return res.status(400).json({ error: '❌ Se requiere texto de entrada' });
    }

    // Hacer la solicitud a Claude 3.5 Sonnet
    const completion = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: `Actúa como un generador avanzado de frases persuasivas basadas en técnicas de PNL.
Cuando el usuario indique un objetivo o intención, genera 4 tipos de frases persuasivas siguiendo estas instrucciones precisas:

1. Utiliza predominantemente el conector "y" (al menos el 70% de las veces), empleando ocasionalmente "mientras" o "entonces" (aproximadamente el 30% de las veces).
2. **No utilices ninguna palabra que contenga la secuencia de letras "pr" de forma consecutiva, en mayúsculas o minúsculas.** Evita ejemplos como "problema", "profesor", "próximo", "presente", etc. Usa alternativas sin dicha secuencia, por ejemplo: "desafío" en lugar de "problema", "guía" en lugar de "profesor", "siguiente" en lugar de "próximo", "actualidad" en lugar de "presente".
3. Usa siempre el "yo operante" (frases en primera persona activa).
4. Incluye elementos emocionales positivos (por ejemplo, "me siento conectado", "disfruto", "celebro", etc.).
5. Incorpora referencias a la activación de la mente inconsciente.
6. Estructura las frases en tiempo presente, evitando el futuro.
7. **Antes de devolver la respuesta, revisa palabra por palabra y asegúrate de que ninguna contenga la secuencia "pr".** Si encuentras alguna, sustitúyela antes de mostrar el resultado.

Formatea la respuesta utilizando los siguientes encabezados:
"### Command Tonality:" seguido de la frase.
"### Secuencia Encadenada:" seguido de 4 frases, una por línea.
"### Frase Multisensorial:" seguida de la frase.
"### Frase de Poder Mental:" seguida de la frase.`,
      messages: [
        {
          role: "user",
          content: userInput
        }
      ],
    });

    res.json({ result: completion.content });
  } catch (error) {
    console.error('❌ Error detallado:', error.message);
    if (error.response) {
      console.error('🔍 Datos de la respuesta:', error.response.data);
    }
    res.status(500).json({ error: '❌ Error al generar frases', details: error.message });
  }
});

// 📌 Ruta básica para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.send('🚀 Servidor de generación de frases PNL activo con Claude 3.5 Sonnet.');
});

// 🚀 Iniciar el servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor ejecutándose en el puerto ${PORT}`);
});
