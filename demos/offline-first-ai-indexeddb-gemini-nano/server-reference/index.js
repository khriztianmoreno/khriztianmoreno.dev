/**
 * Reference implementation of the /api/generate fallback the frontend
 * calls when there's no local model and the device is online. Not
 * deployed anywhere — this repo ships no server and no API key. Copy it
 * into your own backend if you want the fallback to actually work.
 */
import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/generate', async (req, res) => {
  const { prompt, history = [] } = req.body;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [
        ...history
          .filter((turn) => turn.role !== 'system')
          .map((turn) => ({
            role: turn.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: turn.content }],
          })),
        { role: 'user', parts: [{ text: prompt }] },
      ],
    });

    res.json({ text: response.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Fallback server listening on :3000'));
