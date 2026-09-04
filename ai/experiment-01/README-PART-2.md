# Modern Mobile Lab — Experiment 01 — Part 2
## AI Streaming & Chunks

Part 2 of the Modern Mobile Lab AI Series.

This part extends Experiment 01 by implementing streaming AI responses using the OpenAI Responses API, Node.js + Express, Server-Sent Events (SSE), React Native Streams, and Markdown rendering.

Instead of waiting for the complete AI response, the application receives generated text progressively and updates the UI as chunks arrive.

---

# Overview

In Part 1 of Experiment 01, we created a basic AI integration using:

- React Native
- Expo
- Node.js
- Express
- TypeScript
- OpenAI Responses API

The application used a traditional request/response flow.

```text
React Native
     |
     | HTTP POST
     ↓
Express Backend
     |
     | OpenAI API
     ↓
OpenAI
     |
     | Complete response
     ↓
Express Backend
     |
     ↓
React Native
```

The mobile application waited for the complete AI response before displaying it.

Part 2 introduces streaming.

The new flow is:

```text
React Native
     |
     | HTTP POST
     ↓
Express Backend
     |
     | stream: true
     ↓
OpenAI Responses API
     |
     | Streaming events
     ↓
Express Backend
     |
     | Server-Sent Events
     ↓
React Native
     |
     | ReadableStream
     ↓
Progressive UI Updates
```

---

# What We Are Building

The final application uses the following architecture:

```text
React Native + Expo
        ↓
expo/fetch
        ↓
Express Backend
        ↓
OpenAI Responses API
        ↓
Streaming Events
        ↓
Server-Sent Events
        ↓
React Native ReadableStream
        ↓
SSE Parsing
        ↓
Progressive UI Updates
        ↓
Markdown Rendering
```

The goal is to create an AI experience where the response appears progressively instead of appearing only after the complete response has been generated.

---

# Part 2 Goals

In this part we learn:

- AI response streaming
- Streaming chunks
- OpenAI Responses API streaming
- `stream: true`
- `response.output_text.delta`
- `event.delta`
- `response.completed`
- `for await...of`
- Server-Sent Events (SSE)
- `text/event-stream`
- `res.write()`
- `ReadableStream`
- `response.body.getReader()`
- `TextDecoder`
- Network buffering
- SSE event parsing
- Progressive React state updates
- Markdown rendering
- Streaming Markdown considerations

---

# Normal Response vs Streaming

## Traditional Request / Response

A traditional AI request waits for the complete response.

```text
User
 ↓
Request
 ↓
AI generates complete response
 ↓
Complete response
 ↓
Mobile UI
```

The mobile application receives the response only after the model has finished generating it.

For example:

```text
User:

Explain artificial intelligence.
```

The application waits until the complete answer is available.

Only then does it update the UI.

---

## Streaming Response

With streaming enabled, the response is delivered progressively.

```text
User
 ↓
Request
 ↓
AI starts generating
 ↓
Chunk 1
 ↓
Chunk 2
 ↓
Chunk 3
 ↓
Chunk 4
 ↓
...
 ↓
Final chunk
```

The mobile application can update the UI while the model is still generating the response.

For example:

```text
Chunk 1:
Artificial

Chunk 2:
 intelligence

Chunk 3:
 is

Chunk 4:
 changing

Chunk 5:
 our

Chunk 6:
 lives.
```

The client progressively builds:

```text
Artificial
Artificial intelligence
Artificial intelligence is
Artificial intelligence is changing
Artificial intelligence is changing our
Artificial intelligence is changing our lives.
```

### Important

Streaming does not necessarily make the model generate faster.

Streaming changes when generated output becomes available to the client.

Without streaming:

```text
Generate everything
       ↓
Wait
       ↓
Display everything
```

With streaming:

```text
Generate
   ↓
Receive
   ↓
Display
   ↓
Generate
   ↓
Receive
   ↓
Display
```

This improves perceived responsiveness because users can start reading before the complete response is available.

---

# What Is a Chunk?

A chunk is a piece of generated output received while the response is being streamed.

For example:

```text
"Artificial"
" intelligence"
" is"
" changing"
" our"
" everyday"
" lives."
```

The exact chunk boundaries are controlled by the streaming system.

A chunk is not necessarily:

- one word
- one sentence
- one token

The application should treat each received piece as incremental output.

The final response is constructed by appending the chunks:

```text
response =
chunk1 + chunk2 + chunk3 + ...
```

For example:

```text
chunk1 = "Artificial"
chunk2 = " intelligence"
chunk3 = " is changing"
```

The final response becomes:

```text
Artificial intelligence is changing
```

---

# Architecture

The complete Part 2 architecture is:

```text
┌─────────────────────────────┐
│       React Native          │
│                             │
│       User enters prompt    │
└──────────────┬──────────────┘
               │
               │ HTTP POST
               ▼
┌─────────────────────────────┐
│       Express Backend       │
│                             │
│     OpenAI Responses API    │
└──────────────┬──────────────┘
               │
               │ stream: true
               ▼
┌─────────────────────────────┐
│           OpenAI            │
│                             │
│ response.output_text.delta  │
└──────────────┬──────────────┘
               │
               │ text chunks
               ▼
┌─────────────────────────────┐
│        Express SSE          │
│                             │
│ data: "chunk"               │
│ data: "chunk"               │
│ data: "chunk"               │
│ data: [DONE]                │
└──────────────┬──────────────┘
               │
               │ HTTP stream
               ▼
┌─────────────────────────────┐
│       React Native          │
│                             │
│ response.body               │
│       ↓                     │
│ getReader()                 │
│       ↓                     │
│ TextDecoder                 │
│       ↓                     │
│ Buffer                      │
│       ↓                     │
│ SSE parsing                 │
│       ↓                     │
│ setResponse()               │
│       ↓                     │
│ Markdown                    │
└─────────────────────────────┘
```

---

# Project Structure

```text
modern-mobile-lab/
└── ai/
    └── experiment-01/
        ├── README.md
        ├── README-PART-2.md
        │
        ├── mobile/
        │   ├── src/
        │   │   └── app/
        │   │       └── index.tsx
        │   ├── package.json
        │   └── package-lock.json
        │
        └── server/
            ├── src/
            │   └── index.ts
            ├── package.json
            └── .env
```

---

# Prerequisites

You need:

- Node.js
- npm
- Expo
- React Native / Expo development environment
- OpenAI API key
- iOS Simulator, Android Emulator, or physical device

The OpenAI API key must be kept on the backend.

The mobile application must never contain the OpenAI API key.

---

# Backend Setup

Navigate to the server:

```bash
cd ai/experiment-01/server
```

Install dependencies:

```bash
npm install
```

The server uses:

- `express`
- `openai`
- `dotenv`
- `typescript`
- `tsx`
- `@types/node`
- `@types/express`

Create:

```text
ai/experiment-01/server/.env
```

Add:

```env
OPENAI_API_KEY=your_openai_api_key
```

Never commit `.env` to Git.

The `.env` file is ignored by Git.

---

# OpenAI Responses API Streaming

The OpenAI Responses API supports streaming responses.

The important change from the normal implementation is:

```typescript
const stream = await openai.responses.create({
  model: "gpt-5.6",
  input: prompt.trim(),
  stream: true,
});
```

The key option is:

```typescript
stream: true
```

Without streaming:

```typescript
const response = await openai.responses.create({
  model: "gpt-5.6",
  input: prompt.trim(),
});
```

The application receives the completed response.

With streaming:

```typescript
const stream = await openai.responses.create({
  model: "gpt-5.6",
  input: prompt.trim(),
  stream: true,
});
```

The application receives a stream of events.

---

# Streaming Events

The Responses API produces different event types while streaming.

For this implementation, text generation is handled using:

```text
response.output_text.delta
```

This event contains an incremental piece of generated text.

The text is available through:

```typescript
event.delta
```

Example:

```typescript
for await (const event of stream) {
  if (event.type === "response.output_text.delta") {
    console.log("CHUNK:", event.delta);
  }
}
```

Example terminal output:

```text
CHUNK: Artificial
CHUNK:  intelligence
CHUNK:  is
CHUNK:  changing
CHUNK:  our
CHUNK:  lives.
```

The stream also provides:

```text
response.completed
```

when the response has completed.

---

# Server-Sent Events

The backend needs to forward the streamed text to the React Native application.

For this experiment, Server-Sent Events (SSE) are used.

SSE allows a server to keep an HTTP connection open and send multiple events to the client.

The backend configures the response as an SSE stream:

```typescript
res.status(200);

res.setHeader("Content-Type", "text/event-stream");
res.setHeader("Cache-Control", "no-cache");
res.setHeader("Connection", "keep-alive");
```

The most important header is:

```text
Content-Type: text/event-stream
```

This tells the client that the response is an SSE stream.

---

# Forwarding Chunks Using SSE

When OpenAI sends a text delta:

```typescript
if (event.type === "response.output_text.delta") {
  console.log("CHUNK:", event.delta);

  res.write(`data: ${JSON.stringify(event.delta)}\n\n`);
}
```

The backend converts the OpenAI text delta into an SSE message.

For example:

```text
data: "Artificial"

data: " intelligence"

data: " is"
```

The two newline characters:

```text
\n\n
```

separate SSE events.

---

# Stream Completion

When OpenAI reports that the response is completed:

```typescript
if (event.type === "response.completed") {
  res.write("data: [DONE]\n\n");
}
```

`[DONE]` is an application-level marker created by this backend.

It is not an OpenAI event.

It tells the React Native application:

```text
No more application-level chunks are coming.
```

The HTTP response is then closed:

```typescript
res.end();
```

---

# Complete Backend Source Code

File:

```text
ai/experiment-01/server/src/index.ts
```

Complete implementation:

```typescript
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
```

---

# Running the Backend

From:

```text
ai/experiment-01/server
```

run:

```bash
npm run dev
```

Expected output:

```text
AI server running on http://localhost:3000
```

---

# Testing the Backend

The backend should be tested independently before testing the React Native application.

## Health Check

Run:

```bash
curl http://localhost:3000/health
```

Expected:

```json
{
  "status": "ok"
}
```

---

## Streaming Test

Use:

```bash
curl -N -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Explain artificial intelligence in 5 sentences."}'
```

The response should arrive progressively.

Example:

```text
data: "Artificial"

data: " intelligence"

data: " is"

data: " changing"

data: " our"

data: " lives."

data: [DONE]
```

The `-N` option prevents curl from buffering the response so the streaming behavior can be observed.

---

# Mobile Setup

Navigate to the mobile application:

```bash
cd ai/experiment-01/mobile
```

Install dependencies:

```bash
npm install
```

The mobile application uses Expo SDK 57.

Start Expo:

```bash
npx expo start
```

For an iOS simulator, press:

```text
i
```

---

# React Native Streaming

The previous implementation used:

```typescript
const data = await result.json();
```

That approach waits for the complete response.

For streaming, we need to access the response body as a stream.

This experiment uses:

```typescript
import { fetch } from "expo/fetch";
```

Expo provides streaming fetch support through:

```typescript
response.body.getReader()
```

---

# Making the Request

The request itself is similar to Part 1:

```typescript
const result = await fetch(`${API_URL}/api/chat`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    prompt: trimmedPrompt,
  }),
});
```

The difference is how we consume the response.

---

# Checking the Response

Before reading the stream:

```typescript
if (!result.ok) {
  const data = await result.json();

  throw new Error(data.error || "AI request failed");
}
```

Then verify that the response has a body:

```typescript
if (!result.body) {
  throw new Error("Streaming is not supported");
}
```

---

# ReadableStream

The response body is a `ReadableStream`.

Create a reader:

```typescript
const reader = result.body.getReader();
```

The reader allows the application to consume the response incrementally.

We repeatedly call:

```typescript
const { done, value } = await reader.read();
```

Two important values are returned.

### `done`

Indicates whether the stream has finished.

### `value`

Contains the bytes received from the stream.

The loop continues until:

```typescript
done === true
```

---

# TextDecoder

The received stream data is byte data.

Create a decoder:

```typescript
const decoder = new TextDecoder();
```

Decode the received bytes:

```typescript
buffer += decoder.decode(value, {
  stream: true,
});
```

The decoder converts the received byte data into text.

The `stream: true` option allows decoding to continue correctly across multiple chunks.

---

# Why We Need a Buffer

A very important concept when working with network streams is:

```text
One reader.read()
```

does not necessarily equal:

```text
One SSE event
```

For example, an SSE event might be:

```text
data: "Hello"\n\n
```

But the network could deliver it as:

```text
Read #1:

data: "Hel
```

and:

```text
Read #2:

lo"\n\n
```

Or one read might contain multiple events:

```text
data: "Hello"\n\ndata: "world"\n\n
```

Therefore, we maintain a buffer:

```typescript
let buffer = "";
```

Every received piece is added to it:

```typescript
buffer += decoder.decode(value, {
  stream: true,
});
```

The buffer allows us to safely reconstruct complete SSE events.

---

# Parsing SSE Events

SSE events are separated by:

```text
\n\n
```

So we split the buffer:

```typescript
const events = buffer.split("\n\n");
```

The last element may be incomplete.

Therefore, we keep it in the buffer:

```typescript
buffer = events.pop() || "";
```

This allows an incomplete event to be completed by the next network read.

---

# Parsing Each Event

We process the complete events:

```typescript
for (const event of events) {
  if (!event.startsWith("data: ")) {
    continue;
  }

  const data = event.replace("data: ", "");

  if (data === "[DONE]") {
    continue;
  }

  const chunk = JSON.parse(data);

  console.log("FRONTEND CHUNK:", chunk);

  setResponse((current) => current + chunk);
}
```

The process is:

```text
SSE event
   ↓
Check data:
   ↓
Remove "data: "
   ↓
Check [DONE]
   ↓
Parse JSON
   ↓
Get chunk
   ↓
Append chunk
   ↓
Update UI
```

---

# Progressive UI Updates

The important line is:

```typescript
setResponse((current) => current + chunk);
```

Suppose the current response is:

```text
Artificial intelligence
```

and the next chunk is:

```text
 is changing
```

The state becomes:

```text
Artificial intelligence is changing
```

The next chunk is appended again.

This creates the progressive AI response effect.

Using the functional form:

```typescript
setResponse((current) => current + chunk);
```

ensures that the update is based on the current state value.

---

# Markdown Rendering

AI responses commonly contain Markdown.

For example:

```markdown
## Artificial Intelligence

Artificial intelligence is changing everyday life.

**Examples**

- Smart assistants
- Recommendation systems
- AI-powered applications
```

A standard React Native `<Text>` component does not interpret Markdown syntax.

For example:

```tsx
<Text>
  {response}
</Text>
```

would display the Markdown syntax itself.

To render Markdown correctly, this experiment uses:

```text
@ronradtke/react-native-markdown-display
```

---

# Installing Markdown Support

From the mobile directory:

```bash
cd ai/experiment-01/mobile
```

Install:

```bash
npm install @ronradtke/react-native-markdown-display
```

The dependency is added to `package.json`:

```json
{
  "dependencies": {
    "@ronradtke/react-native-markdown-display": "^9.0.3"
  }
}
```

---

# Import Markdown

In:

```text
ai/experiment-01/mobile/src/app/index.tsx
```

add:

```typescript
import Markdown from "@ronradtke/react-native-markdown-display";
```

---

# Rendering the Response

Replace:

```tsx
<Text style={styles.response}>
  {response || "Your AI response will appear here."}
</Text>
```

with:

```tsx
<Markdown>
  {response || "Your AI response will appear here."}
</Markdown>
```

Now Markdown content can be rendered as React Native UI.

---

# Complete React Native Source Code

File:

```text
ai/experiment-01/mobile/src/app/index.tsx
```

The complete Part 2 implementation is:

```tsx
import { fetch } from "expo/fetch";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Markdown from "@ronradtke/react-native-markdown-display";

const API_URL = "http://localhost:3000";

export default function HomeScreen() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      return;
    }

    setLoading(true);
    setResponse("");

    try {
      const result = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: trimmedPrompt,
        }),
      });

      if (!result.ok) {
        const data = await result.json();

        throw new Error(data.error || "AI request failed");
      }

      if (!result.body) {
        throw new Error("Streaming is not supported");
      }

      const reader = result.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, {
          stream: true,
        });

        const events = buffer.split("\n\n");

        buffer = events.pop() || "";

        for (const event of events) {
          if (!event.startsWith("data: ")) {
            continue;
          }

          const data = event.replace("data: ", "");

          if (data === "[DONE]") {
            continue;
          }

          const chunk = JSON.parse(data);

          console.log("FRONTEND CHUNK:", chunk);

          setResponse((current) => current + chunk);
        }
      }
    } catch (error) {
      console.error("AI request failed:", error);

      setResponse(
        error instanceof Error
          ? error.message
          : "Unable to get a response from the AI."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>MODERN MOBILE LAB</Text>

      <Text style={styles.title}>AI Playground</Text>

      <Text style={styles.subtitle}>
        Ask an AI model anything
      </Text>

      <TextInput
        value={prompt}
        onChangeText={setPrompt}
        placeholder="Ask something..."
        placeholderTextColor="#888"
        multiline
        style={styles.input}
      />

      <Pressable
        onPress={askAI}
        disabled={loading}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Ask AI</Text>
        )}
      </Pressable>

      <ScrollView
        style={styles.responseContainer}
        contentContainerStyle={styles.responseContent}
      >
        <Markdown>
          {response || "Your AI response will appear here."}
        </Markdown>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
    backgroundColor: "#fff",
  },

  brand: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 12,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },

  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: "top",
  },

  button: {
    height: 52,
    borderRadius: 12,
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  responseContainer: {
    flex: 1,
    marginTop: 24,
  },

  responseContent: {
    paddingBottom: 40,
  },
});
```

---

# Markdown vs Streaming

Streaming and Markdown solve two different problems.

## Streaming

Streaming answers:

> How does the response arrive?

```text
chunk
 ↓
chunk
 ↓
chunk
 ↓
chunk
```

## Markdown

Markdown answers:

> How should the response be displayed?

```text
Heading
Paragraph
List
Code block
```

The two concerns can be represented as:

```text
                 AI Response
                      |
            ┌─────────┴─────────┐
            ↓                   ↓
       Streaming             Markdown
            ↓                   ↓
     How data arrives     How data looks
```

Streaming is responsible for receiving the response progressively.

Markdown rendering is responsible for displaying the accumulated response correctly.

---

# Markdown While Streaming

Markdown can be incomplete while the AI response is being generated.

For example, a model might initially send:

````text
```javascript
````

and later send the code and closing fence.

This means a Markdown renderer needs to handle incomplete Markdown while the response is still arriving.

The Markdown package used in this experiment also provides:

```tsx
<MarkdownStream />
```

for actively streaming Markdown content.

For this experiment, the simpler:

```tsx
<Markdown>
  {response}
</Markdown>
```

implementation is used to keep the architecture straightforward.

`MarkdownStream` can be explored as a further improvement for a production AI chat interface.

---

# Testing the Complete Application

## Step 1 — Start the Backend

Open Terminal 1:

```bash
cd ai/experiment-01/server
npm run dev
```

Expected:

```text
AI server running on http://localhost:3000
```

---

## Step 2 — Test Backend Health

Open Terminal 2:

```bash
curl http://localhost:3000/health
```

Expected:

```json
{
  "status": "ok"
}
```

---

## Step 3 — Test Backend Streaming

Run:

```bash
curl -N -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Explain artificial intelligence in 5 sentences."}'
```

Expected behavior:

```text
data: "Artificial"

data: " intelligence"

data: " is"

...

data: [DONE]
```

---

## Step 4 — Start React Native

Open Terminal 3:

```bash
cd ai/experiment-01/mobile
npx expo start
```

Launch the application in Expo Go or the simulator.

---

## Step 5 — Test Streaming

Use:

```text
Explain how artificial intelligence is changing our everyday lives in 5–8 sentences.
```

Press:

```text
Ask AI
```

The response should appear progressively.

---

## Step 6 — Test Markdown

Use:

```text
Explain artificial intelligence. Include:
1. A heading
2. A short introduction
3. Three practical examples
4. A small JavaScript code example
5. A conclusion
```

The response should contain formatted Markdown.

The application should render:

- headings
- paragraphs
- lists
- emphasis
- code blocks

instead of displaying raw Markdown syntax.

---

# Console Debugging

The backend logs chunks using:

```typescript
console.log("CHUNK:", event.delta);
```

Example:

```text
CHUNK: Artificial
CHUNK:  intelligence
CHUNK:  is
CHUNK:  changing
```

The mobile application logs received chunks using:

```typescript
console.log("FRONTEND CHUNK:", chunk);
```

Example:

```text
FRONTEND CHUNK: Artificial
FRONTEND CHUNK:  intelligence
FRONTEND CHUNK:  is
FRONTEND CHUNK:  changing
```

This makes it possible to verify the complete streaming pipeline.

---

# Security

The OpenAI API key must remain on the backend.

Correct architecture:

```text
React Native
     ↓
Express Backend
     ↓
OpenAI
```

The mobile application should never contain:

```text
OPENAI_API_KEY=...
```

Do not:

- hardcode the API key
- put the API key in React Native code
- commit `.env`
- upload the API key to GitHub
- expose the OpenAI API key to the client

The server reads the key using:

```typescript
process.env.OPENAI_API_KEY
```

The `.env` file must remain ignored by Git.

---

# Troubleshooting

## Backend Returns 401

Check:

```text
ai/experiment-01/server/.env
```

Make sure the OpenAI API key is valid.

Restart the backend after changing the `.env` file.

---

## Backend Is Not Running

Start it with:

```bash
cd ai/experiment-01/server
npm run dev
```

Expected:

```text
AI server running on http://localhost:3000
```

---

## Health Check Fails

Run:

```bash
curl http://localhost:3000/health
```

Expected:

```json
{
  "status": "ok"
}
```

If it fails, check whether another process is using port `3000` or whether the backend is running.

---

## Mobile Receives No Response

Check that the backend is running.

Then verify:

```bash
curl http://localhost:3000/health
```

Also verify the `API_URL` used by the React Native application:

```typescript
const API_URL = "http://localhost:3000";
```

When using a physical device, `localhost` refers to the device itself, not the development computer. In that case, use the development computer's local network IP address instead.

Example:

```typescript
const API_URL = "http://192.168.1.100:3000";
```

The phone and computer must be able to communicate over the same network.

---

## Streaming Does Not Appear Progressively

Check the backend terminal.

You should see:

```text
CHUNK: ...
CHUNK: ...
CHUNK: ...
```

Then check the React Native console.

You should see:

```text
FRONTEND CHUNK: ...
FRONTEND CHUNK: ...
FRONTEND CHUNK: ...
```

If the backend receives chunks but React Native does not, investigate the network/SSE layer.

---

## Markdown Is Displayed as Raw Text

Make sure the package is installed:

```bash
npm install @ronradtke/react-native-markdown-display
```

Make sure the import exists:

```typescript
import Markdown from "@ronradtke/react-native-markdown-display";
```

And make sure the response is rendered using:

```tsx
<Markdown>
  {response}
</Markdown>
```

instead of:

```tsx
<Text>
  {response}
</Text>
```

---

## Streaming Stops Unexpectedly

Check both terminals.

Backend:

```text
CHUNK: ...
```

Mobile:

```text
FRONTEND CHUNK: ...
```

Also check whether the backend reports an OpenAI error.

The backend catches errors with:

```typescript
catch (error) {
  console.error("OpenAI streaming request failed:", error);
}
```

---

# What We Learned

## 1. AI Streaming

Instead of waiting for a complete response, output is received progressively.

## 2. Chunks / Deltas

The response arrives as incremental pieces.

## 3. OpenAI Responses API Streaming

Streaming is enabled using:

```typescript
stream: true
```

## 4. OpenAI Text Delta

Text output is received through:

```text
response.output_text.delta
```

and:

```typescript
event.delta
```

## 5. Response Completion

The stream provides:

```text
response.completed
```

to indicate that the response has completed.

## 6. Server-Sent Events

The backend forwards chunks to the mobile application using SSE.

## 7. ReadableStream

React Native consumes the HTTP response progressively using:

```typescript
response.body.getReader()
```

## 8. TextDecoder

The received bytes are decoded into text.

## 9. Buffering

A buffer is required because network reads do not necessarily align with SSE event boundaries.

## 10. SSE Parsing

The application extracts complete SSE events from the buffered response.

## 11. Progressive UI

Each chunk is appended to the current React state:

```typescript
setResponse((current) => current + chunk);
```

## 12. Markdown

AI-generated Markdown is rendered using:

```tsx
<Markdown>
  {response}
</Markdown>
```

---

# Complete Request Flow

The complete Part 2 flow is:

```text
1. User enters prompt
          ↓
2. React Native sends POST request
          ↓
3. Express receives prompt
          ↓
4. Express calls OpenAI Responses API
          ↓
5. OpenAI starts streaming
          ↓
6. Backend receives response.output_text.delta
          ↓
7. Backend extracts event.delta
          ↓
8. Backend converts delta to SSE
          ↓
9. React Native receives HTTP stream
          ↓
10. response.body.getReader()
          ↓
11. TextDecoder converts bytes to text
          ↓
12. Buffer collects incomplete data
          ↓
13. SSE events are extracted
          ↓
14. JSON is parsed
          ↓
15. Chunk is appended to React state
          ↓
16. UI updates progressively
          ↓
17. Markdown renderer formats the response
          ↓
18. response.completed
          ↓
19. Backend sends [DONE]
          ↓
20. Backend closes the stream
```

---

# Key Concepts

## `stream: true`

Enables streaming from the OpenAI Responses API.

```typescript
stream: true
```

---

## `response.output_text.delta`

Identifies an event containing incremental text output.

```typescript
if (event.type === "response.output_text.delta") {
  console.log(event.delta);
}
```

---

## `event.delta`

Contains the text received in the current output delta.

```typescript
event.delta
```

---

## `for await...of`

Allows asynchronous iteration over the OpenAI stream.

```typescript
for await (const event of stream) {
  // process event
}
```

---

## `text/event-stream`

Identifies the backend response as an SSE stream.

```typescript
res.setHeader("Content-Type", "text/event-stream");
```

---

## `res.write()`

Writes another SSE event to the open HTTP response.

```typescript
res.write(`data: ${JSON.stringify(event.delta)}\n\n`);
```

---

## `response.body`

Provides access to the response body stream on the mobile side.

```typescript
result.body
```

---

## `getReader()`

Creates a reader for consuming the stream.

```typescript
const reader = result.body.getReader();
```

---

## `TextDecoder`

Converts incoming byte data into text.

```typescript
const decoder = new TextDecoder();
```

---

## Buffer

Stores incomplete data until a complete SSE event can be parsed.

```typescript
let buffer = "";
```

---

## Progressive State Update

Appends each new chunk to the current response.

```typescript
setResponse((current) => current + chunk);
```

---

## Markdown

Converts AI-generated Markdown into formatted React Native UI.

```tsx
<Markdown>
  {response}
</Markdown>
```

---

# Official Documentation

## OpenAI Responses API — Streaming

Official OpenAI documentation:

https://platform.openai.com/docs/api-reference/responses-streaming

Important concepts used in this experiment:

```text
stream: true
response.output_text.delta
event.delta
response.completed
```

---

## OpenAI Responses API

Official OpenAI Responses API documentation:

https://platform.openai.com/docs/api-reference/responses

---

## Expo — `expo/fetch`

Official Expo SDK 57 documentation:

https://docs.expo.dev/versions/v57.0.0/sdk/expo/

The documentation covers:

```typescript
import { fetch } from "expo/fetch";
```

and streaming responses using:

```typescript
response.body.getReader()
```

It also documents:

- `ReadableStream`
- `TextDecoder`
- `TextEncoder`
- streaming fetch

---

## React Native Markdown Display

GitHub:

https://github.com/RonRadtke/react-native-markdown-display

NPM:

https://www.npmjs.com/package/@ronradtke/react-native-markdown-display

The package provides:

```tsx
<Markdown />
```

for Markdown rendering and:

```tsx
<MarkdownStream />
```

for actively streaming Markdown content.

---

# Running the Complete Project

## Terminal 1 — Backend

```bash
cd ai/experiment-01/server
npm install
npm run dev
```

Expected:

```text
AI server running on http://localhost:3000
```

---

## Terminal 2 — Mobile

```bash
cd ai/experiment-01/mobile
npm install
npx expo start
```

Launch the application in Expo Go or the simulator.

---

## Backend Health Check

```bash
curl http://localhost:3000/health
```

Expected:

```json
{
  "status": "ok"
}
```

---

## Backend Streaming Check

```bash
curl -N -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Explain artificial intelligence in 5 sentences."}'
```

---

# Environment Variables

Create:

```text
ai/experiment-01/server/.env
```

Add:

```env
OPENAI_API_KEY=your_openai_api_key
```

Never commit this file.

The repository should contain:

```text
.env
```

in `.gitignore`, but not the actual API key.

For documentation or sharing the project, use an example file if needed:

```text
.env.example
```

Example:

```env
OPENAI_API_KEY=your_openai_api_key
```

---

# Git Safety Checklist

Before committing the project:

```bash
git status
```

Make sure `.env` is not listed as an untracked file.

Verify Git ignores the environment file:

```bash
git check-ignore -v ai/experiment-01/server/.env
```

The API key must never be committed.

Before pushing to GitHub, verify that no real API key exists in tracked files.

---

# Part 2 Complete

Experiment 01 — Part 2 demonstrates how to build a streaming AI experience using:

- React Native
- Expo
- TypeScript
- Express
- OpenAI Responses API
- Server-Sent Events
- ReadableStream
- TextDecoder
- Progressive UI updates
- Markdown rendering

The implementation provides the foundation for more advanced AI application patterns in future Modern Mobile Lab experiments.

---

# Next

Future topics in the Modern Mobile Lab AI Series include:

- Structured AI / JSON Schema
- Tool Calling
- RAG & Embeddings
- Multimodal AI
- Voice AI
- Agentic Workflows
- Mobile AI Architecture
- Production AI considerations
