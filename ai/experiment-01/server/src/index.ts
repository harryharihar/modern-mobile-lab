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

    const stream = await openai.responses.create({
      model: "gpt-5.6",
      input: prompt.trim(),
      stream: true,
    });

    res.status(200);
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const event of stream) {
      if (event.type === "response.output_text.delta") {
        console.log("CHUNK:", event.delta);

        res.write(`data: ${JSON.stringify(event.delta)}\n\n`);
      }

      if (event.type === "response.completed") {
        res.write("data: [DONE]\n\n");
      }
    }

    res.end();
  } catch (error) {
    console.error("OpenAI streaming request failed:", error);

    return res.status(500).json({
      error: "Failed to generate AI response",
    });
  }
});

app.listen(PORT, () => {
  console.log(`AI server running on http://localhost:${PORT}`);
});