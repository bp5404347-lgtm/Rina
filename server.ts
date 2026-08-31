import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the environment.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API: Chat with Rina AI
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history = [], language = "hi-IN" } = req.body;

      if (!message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ error: "Message is required" });
      }

      const ai = getGeminiClient();

      let langInstruction = "Respond primarily in natural, polite Hindi (Devanagari script or natural conversational Hindi).";
      if (language === "hinglish") {
        langInstruction = "Respond in natural conversational Hinglish (Roman script Hindi-English mix, like 'Namaste! Main aapki madad kaise kar sakti hoon?').";
      } else if (language === "en-US" || language === "en-IN") {
        langInstruction = "Respond in polite, clear English with a friendly tone.";
      }

      const systemInstruction = `You are Rina (रीना), a friendly, polite, and helpful AI assistant.
Your characteristics:
- You speak clearly, warmly, and concisely so that your responses are pleasant to listen to via voice.
- ${langInstruction}
- Keep responses compact (1-3 sentences for simple questions, crisp explanations for informative ones) so they sound great when read aloud.
- Use respectful phrasing like "नमस्ते", "जी ज़रूर", "मैं आपकी कैसे मदद कर सकती हूँ?".
- Do not use markdown syntax that sounds awkward when spoken (like asterisks or hashtag symbols) unless formatting code.`;

      // Build conversation contents
      const formattedContents = [];
      
      // Add previous history turns if available
      if (Array.isArray(history)) {
        for (const item of history.slice(-8)) {
          if (item.sender === "user" && item.text) {
            formattedContents.push({
              role: "user",
              parts: [{ text: item.text }],
            });
          } else if (item.sender === "rina" && item.text) {
            formattedContents.push({
              role: "model",
              parts: [{ text: item.text }],
            });
          }
        }
      }

      // Append current user message
      formattedContents.push({
        role: "user",
        parts: [{ text: message }],
      });

      // Model fallback cascade to handle 503 high demand or temporary outages seamlessly
      const modelsToTry = [
        "gemini-flash-latest",
        "gemini-3.7-flash",
        "gemini-3.6-flash",
        "gemini-3.1-flash-lite",
      ];

      let reply: string | null = null;
      let lastError: any = null;

      for (const model of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: formattedContents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });

          if (response.text) {
            reply = response.text;
            break; // Successfully got response
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`Model ${model} unavailable (${err?.status || err?.message}). Trying fallback...`);
          // Brief pause before trying next fallback model
          await new Promise((res) => setTimeout(res, 300));
        }
      }

      if (!reply) {
        throw lastError || new Error("All AI models are currently busy. Please try again.");
      }

      res.json({ reply });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      const errorMessage = error?.message || "Internal server error";
      res.status(500).json({ error: errorMessage });
    }
  });

  // API: Gemini TTS generation (optional enhanced voice)
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voice = "Kore" } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: `Speak in a warm, clear, natural tone: ${text}` }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice || "Kore" },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        res.json({ audio: base64Audio, mimeType: "audio/pcm;rate=24000" });
      } else {
        res.status(404).json({ error: "No audio generated" });
      }
    } catch (error: any) {
      console.warn("Gemini TTS fallback:", error?.message);
      res.status(500).json({ error: error?.message || "TTS error" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Rina AI Assistant server running on http://localhost:${PORT}`);
  });
}

startServer();
