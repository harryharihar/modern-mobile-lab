# Experiment 01 — Mobile AI / LLM Integration

Part of the Modern Mobile Lab — AI Series.

## Overview

This experiment demonstrates how to integrate an LLM into a React Native application using a secure backend architecture.

The application will:

- Accept a user prompt from React Native
- Send the prompt to a backend
- Authenticate with the OpenAI API from the backend
- Use the GPT-5.6 model
- Return an AI-generated response
- Stream the response progressively to React Native
- Render the response in the mobile UI

## Architecture

React Native
      |
      v
   AI Service
      |
      v
   HTTP API
      |
      v
Express Backend
      |
      v
OpenAI Responses API
      |
      v
   GPT-5.6
      |
      v
Streaming Response
      |
      v
React Native UI

## Topics Covered

- OpenAI API setup
- OpenAI projects
- API keys
- API security
- Input and output tokens
- Model selection
- GPT-5.6
- Responses API
- Backend architecture
- LLM streaming
- React Native streaming
- Progressive UI updates
- Markdown rendering
- Streaming performance optimization

## YouTube

This experiment is demonstrated on the Modern Mobile Lab YouTube channel.

## Status

Completed



Modern Mobile Lab

AI Playground

Ask an AI model anything

┌──────────────────────────────┐
│ Explain React Native Fabric  │
│ in simple terms.             │
└──────────────────────────────┘

           Ask AI

AI Response

Fabric is...


                USER
                  │
                  ▼
        ┌─────────────────┐
        │  React Native   │
        │                 │
        │ Prompt          │
        │ Ask AI          │
        │ Response        │
        └────────┬────────┘
                 │
                 │ HTTP POST
                 ▼
        ┌─────────────────┐
        │ Express Server  │
        │                 │
        │ /api/chat       │
        └────────┬────────┘
                 │
                 │ OpenAI SDK
                 ▼
        ┌─────────────────┐
        │   OpenAI API    │
        │                 │
        │    GPT-5.6      │
        └────────┬────────┘
                 │
                 │ Response
                 ▼
        ┌─────────────────┐
        │ Express Server  │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │  React Native   │
        └─────────────────┘

---

# Project Structure

```text
experiment-01/
├── README.md
├── mobile/
│   └── React Native / Expo application
└── server/
    ├── src/
    │   └── index.ts
    ├── .env
    ├── .env.example
    ├── .gitignore
    ├── package.json
    └── package-lock.json
```

The experiment is intentionally split into two applications:

- `mobile` — the React Native / Expo client
- `server` — the Node.js / Express backend

The mobile application never stores the OpenAI API key. The server is responsible for communicating with OpenAI.

---

# Prerequisites

Before running this experiment, install:

- Node.js
- npm
- Git
- Xcode
- iOS Simulator

You also need access to the OpenAI API and an OpenAI API key.

Check Node.js and npm:

```bash
node -v
npm -v
```

---

# Backend Setup

The backend was created as a separate Node.js application inside:

```text
server/
```

## 1. Node.js project

The backend is a Node.js project with its dependencies defined in `package.json`.

The backend uses TypeScript, so TypeScript tooling is included as development dependencies.

## 2. Backend dependencies

The backend uses:

- Express — HTTP server and API routes
- OpenAI — OpenAI Node.js SDK
- dotenv — loads environment variables
- TypeScript — TypeScript support
- tsx — runs the TypeScript server during development
- `@types/node` — Node.js type definitions
- `@types/express` — Express type definitions

The installed dependency versions are recorded in:

```text
server/package-lock.json
```

## 3. Backend source

The main backend implementation is:

```text
server/src/index.ts
```

It performs the following operations:

```text
Start Express
     ↓
Load environment variables
     ↓
Create OpenAI client
     ↓
Expose /api/chat
     ↓
Receive prompt
     ↓
Call OpenAI Responses API
     ↓
Return AI response
```

---

# OpenAI Configuration

Create an OpenAI project for this experiment and create an API key for the backend.

The API key must be stored locally in:

```text
server/.env
```

The environment file contains:

```env
OPENAI_API_KEY=your_real_openai_api_key
PORT=3000
```

Replace `your_real_openai_api_key` with your actual key.

**Never commit the real `.env` file to GitHub.**

The repository contains:

```text
server/.env.example
```

This is the safe template that shows which variables are required without exposing the secret.

Example:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

The backend `.gitignore` excludes:

```text
.env
node_modules/
dist/
```

---

# Why the API Key Is on the Backend

The mobile application should not contain the OpenAI API key.

An API key embedded in a mobile application can potentially be extracted from the application package.

The architecture used in this experiment is therefore:

```text
React Native
      |
      | prompt
      ▼
Express Backend
      |
      | secret API key
      ▼
OpenAI
```

The mobile application only knows about our backend API.

---

# Backend API

The backend exposes:

```text
POST /api/chat
```

Local development endpoint:

```text
http://localhost:3000/api/chat
```

The request body is:

```json
{
  "prompt": "Say hello in one sentence."
}
```

The backend sends the prompt to OpenAI and returns:

```json
{
  "response": "Hello!"
}
```

The exact AI response can vary.

---

# Start the Backend

Open a terminal and navigate to:

```text
ai/experiment-01/server
```

Start the development server:

```bash
npm run dev
```

Expected output:

```text
AI server running on http://localhost:3000
```

Keep this terminal running while using the mobile application.

---

# Test the Backend Independently

Before connecting React Native, the API can be tested directly.

Run:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Say hello in one sentence."}'
```

A successful response will look similar to:

```json
{
  "response": "Hello!"
}
```

Testing the backend first is useful because it confirms that:

1. The server is running.
2. The API route is available.
3. The environment variable is loaded.
4. The OpenAI API key is accepted.
5. OpenAI is returning a response.

---

# Mobile Setup

The mobile application is an Expo React Native application located in:

```text
mobile/
```

It uses Expo Router and TypeScript.

## Install dependencies

Navigate to:

```text
ai/experiment-01/mobile
```

Install the dependencies defined in `package.json`:

```bash
npm install
```

---

# Start the Mobile Application

Start Expo:

```bash
npx expo start
```

Expo starts the Metro development server.

To open the application in the iOS Simulator, press:

```text
i
```

You can also use the project's iOS npm script when available:

```bash
npm run ios
```

---

# Running Backend and Mobile Together

The experiment requires the backend and mobile application to run at the same time.

## Terminal 1 — Backend

```bash
cd ai/experiment-01/server
npm run dev
```

Keep this terminal running.

## Terminal 2 — Mobile

```bash
cd ai/experiment-01/mobile
npx expo start
```

Then press:

```text
i
```

to open the iOS Simulator.

---

# Mobile Application Flow

The mobile screen provides a simple AI playground:

```text
Modern Mobile Lab

AI Playground

Prompt
┌──────────────────────────────┐
│ Explain React Native Fabric  │
│ in simple terms.             │
└──────────────────────────────┘

          Ask AI

AI Response

Fabric is...
```

The user enters a prompt and presses **Ask AI**.

The mobile application then sends the prompt to the backend.

---

# Complete Request Flow

```text
┌──────────────────────┐
│   React Native       │
│                      │
│   Prompt             │
│   Ask AI             │
└──────────┬───────────┘
           │
           │ HTTP POST
           │ /api/chat
           ▼
┌──────────────────────┐
│   Express Server     │
│                      │
│   /api/chat          │
└──────────┬───────────┘
           │
           │ OpenAI SDK
           ▼
┌──────────────────────┐
│     OpenAI API       │
│                      │
│      GPT-5.6         │
└──────────┬───────────┘
           │
           │ Response
           ▼
┌──────────────────────┐
│   Express Server     │
└──────────┬───────────┘
           │
           │ JSON
           ▼
┌──────────────────────┐
│   React Native       │
│                      │
│   AI Response        │
└──────────────────────┘
```

---

# Mobile-to-Backend Communication

The mobile application sends a request similar to:

```json
{
  "prompt": "Explain React Native Fabric in simple terms."
}
```

to:

```text
POST http://localhost:3000/api/chat
```

The backend handles the OpenAI request and returns the generated response.

This means the mobile application does not need to communicate directly with OpenAI.

---

# iOS Simulator vs Physical Device

For the iOS Simulator, the development backend can normally be reached through:

```text
http://localhost:3000
```

When running on a physical device, `localhost` refers to the device itself.

In that situation, the mobile application should use the Mac's local network IP address, for example:

```text
http://192.168.x.x:3000
```

The Mac and physical device need network connectivity to each other.

---

# Model

The backend is configured to use:

```text
GPT-5.6
```

Model selection is kept on the server.

This allows the backend to control the model independently of the mobile application.

---

# Tokens

LLMs process text as tokens.

For an AI request, two useful concepts are:

### Input tokens

Tokens associated with the information sent to the model.

### Output tokens

Tokens associated with the response generated by the model.

Token usage matters for:

- Cost
- Context limits
- Performance
- Application design

Token usage and production limits can be expanded in future experiments.

---



# Troubleshooting

## Backend does not start

From the server directory, make sure dependencies are installed and start the development server:

```bash
npm install
npm run dev
```

## `OPENAI_API_KEY` is missing

Check:

```text
server/.env
```

and verify that it contains:

```env
OPENAI_API_KEY=your_real_openai_api_key
PORT=3000
```

Restart the server after changing the environment file.

## OpenAI returns `401`

A `401` authentication error normally means that the configured API key is invalid, missing, or still a placeholder.

Check `server/.env` and make sure the real API key is configured.

Never publish that key.

## `AI request failed`

Test the backend directly with:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Say hello in one sentence."}'
```

If the curl request fails, investigate the backend first.

If curl works but the mobile application fails, check the mobile-to-backend URL and network configuration.

---

# Security Checklist

Before pushing this experiment to GitHub:

- [ ] `.env` is ignored
- [ ] The real OpenAI API key is not in source code
- [ ] The real OpenAI API key is not in README files
- [ ] The real OpenAI API key is not in screenshots
- [ ] `.env.example` contains only placeholders
- [ ] `node_modules` is not committed

Verify that Git ignores the server environment file:

```bash
git check-ignore -v ai/experiment-01/server/.env
```

---

# Quick Start

After cloning the repository:

### Backend

```bash
cd ai/experiment-01/server
npm install
```

Configure:

```text
server/.env
```

Then:

```bash
npm run dev
```

### Mobile

In another terminal:

```bash
cd ai/experiment-01/mobile
npm install
npx expo start
```

Press:

```text
i
```

to open the iOS Simulator.

---

# Learning Goal

This experiment establishes the basic architecture for integrating AI into a mobile application:

```text
Mobile UI
    ↓
Backend API
    ↓
AI Provider
    ↓
Backend API
    ↓
Mobile UI
```

The backend provides a secure boundary around the AI provider, while React Native focuses on the user experience.

Future experiments in the Modern Mobile Lab AI Series build on these fundamentals.


# Backend Configuration

The following section documents how the backend for this experiment was configured and how each part is used.

## Step 1 — Initialize the Node.js Project

The backend starts as a Node.js project.

The Node package configuration is created using:

```bash
npm init -y
```

This creates:

```text
package.json
```

The `package.json` file contains the project information, dependencies, and scripts required to run the backend.

---

## Step 2 — Install Express

Express is used to create the HTTP server and API endpoints.

The Express dependency is installed with:

```bash
npm install express
```

Express allows us to create endpoints such as:

```text
POST /api/chat
```

The React Native application communicates with this endpoint.

---

## Step 3 — Install the OpenAI SDK

The backend needs to communicate with OpenAI.

The OpenAI Node.js SDK is installed with:

```bash
npm install openai
```

The SDK allows the backend to make requests to the OpenAI API without manually constructing every HTTP request.

---

## Step 4 — Install dotenv

The OpenAI API key is a secret and should not be written directly into the source code.

We use environment variables for this.

The `dotenv` package is installed with:

```bash
npm install dotenv
```

It allows the application to load values from:

```text
.env
```

---

## Step 5 — Install TypeScript Development Dependencies

The backend is written in TypeScript.

The required development dependencies are:

```bash
npm install -D typescript tsx @types/node @types/express
```

These packages provide:

- TypeScript support
- Type definitions for Node.js
- Type definitions for Express
- `tsx` for running TypeScript directly during development

---

# Backend Dependencies

The backend uses:

```text
Express
OpenAI
dotenv
TypeScript
tsx
@types/node
@types/express
```

| Package | Purpose |
|---|---|
| Express | HTTP server and API endpoints |
| OpenAI | Communicate with OpenAI |
| dotenv | Load environment variables |
| TypeScript | TypeScript development |
| tsx | Run TypeScript during development |
| @types/node | Node.js type definitions |
| @types/express | Express type definitions |

---

## Step 6 — Configure `package.json`

The backend uses `package.json` to define the project information, dependencies, and npm scripts.

The development script is:

```json
"scripts": {
  "dev": "tsx src/index.ts"
}
```

This allows the backend to be started with:

```bash
npm run dev
```

The backend entry point is:

```text
src/index.ts
```

The development flow is:

```text
npm run dev
     ↓
tsx src/index.ts
     ↓
Express Server
     ↓
http://localhost:3000
```

---

## Step 7 — Configure Environment Variables

The OpenAI API key is kept in the server environment.

The local configuration file is:

```text
server/.env
```

It contains:

```env
OPENAI_API_KEY=your_real_openai_api_key
PORT=3000
```

Replace `your_real_openai_api_key` with the actual OpenAI API key.

The real `.env` file must never be committed to GitHub.

---

## Step 8 — Configure `.env.example`

The repository contains:

```text
server/.env.example
```

This file documents the required environment variables without exposing the real API key.

Example:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

The `.env.example` file can safely be committed to GitHub.

---

## Step 9 — Configure `.gitignore`

The backend uses `.gitignore` to prevent private or generated files from being committed.

Important entries are:

```gitignore
node_modules/
.env
dist/
```

The most important entry is:

```text
.env
```

because this file contains the OpenAI API key.

---

## Step 10 — Configure the OpenAI Client

The OpenAI client is configured in:

```text
server/src/index.ts
```

The API key is loaded from:

```text
process.env.OPENAI_API_KEY
```

The configuration flow is:

```text
server/.env
      ↓
dotenv
      ↓
process.env.OPENAI_API_KEY
      ↓
OpenAI client
      ↓
OpenAI API
```

This keeps the API key outside the source code.

---

## Step 11 — Configure the Express API

The backend creates an Express server and exposes:

```text
POST /api/chat
```

The endpoint receives a JSON request:

```json
{
  "prompt": "Say hello in one sentence."
}
```

The server extracts the prompt and sends it to OpenAI.

The response is returned to the mobile application as:

```json
{
  "response": "Hello!"
}
```

---

## Step 12 — Configure the AI Model

The model is selected by the backend.

For this experiment the configured model is:

```text
GPT-5.6
```

Keeping model selection on the backend means the mobile application does not need to manage OpenAI credentials or provider-specific configuration.

---

## Step 13 — Backend Error Handling

The backend validates that a prompt has been provided.

If the prompt is missing or invalid, the API returns an error response.

If the OpenAI request fails, the backend logs the server-side error and returns a safe error response to the client.

This prevents internal server details from being exposed unnecessarily to the mobile application.

---

## Step 14 — Start the Backend

From the server directory:

```bash
npm run dev
```

Expected output:

```text
AI server running on http://localhost:3000
```

Keep this terminal running.

---

## Step 15 — Test the Backend

The backend should be tested independently before connecting the mobile application.

Use:

```bash
curl http://localhost:3000
```

Then test the AI endpoint:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Say hello in one sentence."}'
```

A successful response looks similar to:

```json
{
  "response": "Hello!"
}
```

The exact response can vary because it is generated by the AI model.

---

## Step 16 — Why Test With curl?

Testing the backend independently separates backend problems from mobile application problems.

The test flow is:

```text
curl
  ↓
Express
  ↓
/api/chat
  ↓
OpenAI
  ↓
AI response
  ↓
Express
  ↓
curl
```

If this works, the backend and OpenAI integration are working independently of React Native.

---

# Backend Configuration Summary

```text
server/
├── src/
│   └── index.ts
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

### `src/index.ts`

Main TypeScript backend implementation.

### `.env`

Contains local secrets and configuration.

**Never commit this file.**

### `.env.example`

Safe configuration template.

### `.gitignore`

Prevents secrets and generated dependencies from being committed.

### `package.json`

Contains project metadata, dependencies, and npm scripts.

### `package-lock.json`

Records the installed dependency versions.

### `README.md`

Documents the backend configuration and setup process.

---

# Backend Ready

Once the backend is running successfully, the React Native application can connect to:

```text
http://localhost:3000/api/chat
```

The complete experiment then becomes:

```text
React Native
      ↓
POST /api/chat
      ↓
Express Backend
      ↓
OpenAI Responses API
      ↓
GPT-5.6
      ↓
Express Backend
      ↓
React Native
```
