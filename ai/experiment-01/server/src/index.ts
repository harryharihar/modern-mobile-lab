import express from "express";
import OpenAI from "openai";
import "dotenv/config";

const app = express();

const PORT = 3000;

app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        error: "Prompt is required",
      });
    }

    const response = await openai.responses.create({
      model: "gpt-5.6",
      input: prompt.trim(),
    });

    return res.status(200).json({
      response: response.output_text,
    });
  } catch (error) {
    console.error("OpenAI request failed:", error);

    return res.status(500).json({
      error: "Failed to generate AI response",
    });
  }
});

app.listen(PORT, () => {
  console.log(`AI server running on http://localhost:${PORT}`);
});