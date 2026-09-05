# Experiment 02 — Structured AI / JSON Schema

Experiment 02 demonstrates how to build a reliable AI-powered mobile feature using **Structured Outputs and JSON Schema**.

The goal is to move from free-form AI responses to predictable, application-friendly structured data.

In this experiment, a React Native application sends a natural-language food-order request to a Node.js backend. The backend uses the OpenAI Responses API with Structured Outputs and JSON Schema to convert the request into structured order data.

The backend then validates the result with Zod and applies simple business rules before returning the final response to the mobile application.

---

## Experiment Goal

The main goal of this experiment is to understand how AI-generated information can be converted into structured application data.

Instead of receiving free-form text:

```text
The customer wants one large Margherita pizza with extra cheese.
```

the application receives predictable structured data:

```json
{
  "intent": "create_order",
  "items": [
    {
      "name": "Margherita pizza",
      "quantity": 1,
      "size": "large",
      "customizations": ["extra cheese"]
    }
  ]
}
```

This makes the AI response easier for application code to consume.

---

## Learning Path

```text
AI / LLM
   ↓
Free-form AI responses
   ↓
Why free-form text is difficult for applications
   ↓
JSON
   ↓
Structured data
   ↓
JSON Schema
   ↓
Schema validation
   ↓
Structured Outputs
   ↓
OpenAI Responses API
   ↓
TypeScript types
   ↓
React Native
   ↓
Real mobile use case
```

---

## What This Experiment Covers

- Free-form AI responses
- Structured AI responses
- JSON Schema
- Schema validation
- Structured Outputs
- OpenAI Responses API
- `strict: true`
- Enums
- Zod runtime validation
- TypeScript type inference
- React Native integration
- Backend API design
- Error handling
- Incomplete requests
- Unsupported requests
- AI interpretation vs business logic
- Backend as the source of truth

---

# Why Free-form AI Responses Are Difficult

AI models normally return natural-language responses.

For example:

```text
The customer wants one large Margherita pizza
with extra cheese.
```

This is easy for a human to understand.

However, an application needs predictable fields.

The application needs to know:

```text
What is the intent?
What item did the customer request?
How many?
What size?
What customizations?
```

If the application has to parse arbitrary text every time, the integration becomes fragile.

Structured AI responses solve this problem by providing predictable application data.

---

# JSON Schema

JSON Schema defines the expected structure of the data.

For this experiment, the schema represents a food order.

The order contains:

```text
intent
items
```

Each item contains:

```text
name
quantity
size
customizations
```

The schema also restricts specific values.

For example:

```text
intent:

create_order
modify_order
cancel_order
unknown
```

And:

```text
size:

small
medium
large
unknown
```

The schema therefore acts as a **data contract** between the AI system and the application.

---

# Important Concept: Schema Is a Data Contract

A schema describes:

```text
What does the data look like?
```

It does not describe:

```text
What is allowed by the business?
```

For example, a schema can say:

```text
size = large
```

But the schema does not know whether:

- Large pizza is available
- The restaurant sells that pizza
- Extra cheese is available
- The customer can order it
- The price is correct
- The restaurant is open

Those are business rules.

Business rules belong to the backend/application.

---

# Structured Outputs

Structured Outputs allow the AI model to generate data according to a defined JSON Schema.

This experiment uses the OpenAI Responses API.

Example:

```ts
const response = await openai.responses.create({
  model: "gpt-5.6",

  input: `
You are a food ordering assistant.

Extract the customer's order request into the provided structured format.

Customer request:
${prompt.trim()}
`,

  text: {
    format: {
      type: "json_schema",
      name: "food_order",
      schema: orderSchema,
      strict: true,
    },
  },
});
```

The important configuration is:

```ts
text: {
  format: {
    type: "json_schema",
    name: "food_order",
    schema: orderSchema,
    strict: true,
  },
}
```

---

# Why `strict: true`?

`strict: true` tells the model to follow the supported schema constraints.

For example, the schema defines the possible pizza sizes as:

```text
small
medium
large
unknown
```

The model should therefore return one of those supported values rather than inventing a completely different value.

This makes the response more predictable for application code.

---

# JSON Mode vs Structured Outputs

These two concepts should not be confused.

## JSON Mode

JSON Mode focuses on returning valid JSON.

```text
AI
 ↓
Valid JSON
```

The JSON can still have a structure that the application does not expect.

---

## Structured Outputs

Structured Outputs use a defined JSON Schema.

```text
AI
 ↓
JSON Schema
 ↓
Structured JSON
```

The application defines the expected structure first.

The AI then produces structured data according to that contract.

---

# Zod Runtime Validation

Structured Outputs provide a structured response from the AI.

The backend should still validate the received data.

This experiment uses **Zod** for runtime validation.

Example:

```ts
const orderZodSchema = z.object({
  intent: z.enum([
    "create_order",
    "modify_order",
    "cancel_order",
    "unknown",
  ]),

  items: z.array(
    z.object({
      name: z.string(),
      quantity: z.number().int(),
      size: z.enum([
        "small",
        "medium",
        "large",
        "unknown",
      ]),
      customizations: z.array(z.string()),
    })
  ),
});
```

The AI response is parsed:

```ts
const result = JSON.parse(response.output_text);
```

Then validated:

```ts
const validatedResult =
  orderZodSchema.parse(result);
```

If the result does not match the expected application structure, Zod throws a validation error.

---

# TypeScript Type Safety

The TypeScript type can be derived from the Zod schema:

```ts
type FoodOrder = z.infer<typeof orderZodSchema>;
```

This gives the application compile-time type safety.

The overall flow becomes:

```text
JSON Schema
     ↓
AI response structure
     ↓
Zod validation
     ↓
Runtime safety
     ↓
TypeScript
     ↓
Compile-time safety
```

---

# AI Interpretation vs Business Logic

This is one of the most important concepts in the experiment.

The AI is responsible for understanding the user's natural-language request.

For example:

```text
I want one large Margherita pizza
with extra cheese.
```

The AI can interpret this as:

```json
{
  "intent": "create_order",
  "items": [
    {
      "name": "Margherita pizza",
      "quantity": 1,
      "size": "large",
      "customizations": [
        "extra cheese"
      ]
    }
  ]
}
```

But the AI should not become the source of truth for the actual business operation.

The backend should still verify:

```text
Does the menu item exist?
        ↓
Is the requested size available?
        ↓
Is the customization available?
        ↓
What is the actual price?
        ↓
Is the restaurant accepting orders?
        ↓
Can this customer place the order?
        ↓
Can the order actually be created?
```

---

# Backend Is the Source of Truth

The important architecture boundary is:

```text
User
 ↓
Natural Language
 ↓
AI
 ↓
Structured Data
 ↓
Backend Validation
 ↓
Business Rules
 ↓
Application Action
```

The AI structures the user's intent.

The backend validates what is actually possible.

The backend remains the source of truth.

The AI should not invent:

- Product IDs
- Prices
- Availability
- Payment status
- Order status
- Permissions
- Database state

Those should come from the application's trusted systems.

---

# Generalized Schema Pattern

JSON Schema is a generalized pattern.

The exact schema depends on the application and use case.

For example, a food ordering application may need:

```text
intent
items
quantity
size
customizations
```

A travel application might need:

```text
destination
dates
travelers
budget
```

A support application might need:

```text
category
priority
summary
customerIntent
```

The concept remains the same:

```text
Application
     ↓
Define required structure
     ↓
Create JSON Schema
     ↓
AI produces structured data
     ↓
Validate
     ↓
Use in application
```

The pattern is reusable, but the actual schema is specific to the application.

---

# Experiment Use Case

The use case for this experiment is a simple food-ordering assistant.

The user enters an order using natural language.

Example:

```text
I want one large Margherita pizza with extra cheese
```

The backend converts the request into structured data.

The mobile application then displays the structured result.

---

# Order Schema

The current order schema is:

```ts
const orderSchema = {
  type: "object",
  properties: {
    intent: {
      type: "string",
      enum: [
        "create_order",
        "modify_order",
        "cancel_order",
        "unknown",
      ],
    },

    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },

          quantity: {
            type: "integer",
          },

          size: {
            type: "string",
            enum: [
              "small",
              "medium",
              "large",
              "unknown",
            ],
          },

          customizations: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },

        required: [
          "name",
          "quantity",
          "size",
          "customizations",
        ],

        additionalProperties: false,
      },
    },
  },

  required: [
    "intent",
    "items",
  ],

  additionalProperties: false,
};
```

---

# API

The backend exposes:

```text
POST /api/order
```

## Request

```json
{
  "prompt": "I want one large Margherita pizza with extra cheese"
}
```

## Response

```json
{
  "result": {
    "intent": "create_order",
    "items": [
      {
        "name": "Margherita pizza",
        "quantity": 1,
        "size": "large",
        "customizations": [
          "extra cheese"
        ]
      }
    ]
  },
  "nextAction": "place_order"
}
```

---

# Backend Decision Logic

The backend currently produces three possible actions:

```text
place_order
ask_clarification
unsupported_request
```

## `place_order`

The request contains enough information for the current demo rules.

---

## `ask_clarification`

The request requires additional information.

Example:

```text
I want a pizza
```

The AI can identify:

```json
{
  "intent": "create_order",
  "items": [
    {
      "name": "pizza",
      "quantity": 1,
      "size": "unknown",
      "customizations": []
    }
  ]
}
```

The backend detects the missing pizza size and returns:

```text
ask_clarification
```

---

## `unsupported_request`

The user asks for something outside the food-ordering capability.

Example:

```text
What is the weather today?
```

The AI returns:

```json
{
  "intent": "unknown",
  "items": []
}
```

The backend returns:

```text
unsupported_request
```

---

# Architecture

```text
┌─────────────────────────┐
│      React Native       │
│         Mobile          │
└────────────┬────────────┘
             │
             │ POST /api/order
             ▼
┌─────────────────────────┐
│      Node.js / Express  │
│         Backend         │
└────────────┬────────────┘
             │
             │ Responses API
             ▼
┌─────────────────────────┐
│         GPT-5.6         │
└────────────┬────────────┘
             │
             │ Structured Output
             ▼
┌─────────────────────────┐
│       JSON Schema       │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│      Zod Validation     │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│     Business Logic      │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│      JSON Response      │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│      React Native UI    │
└─────────────────────────┘
```

---

# Project Structure

```text
experiment-02/
│
├── README.md
│
├── mobile/
│   ├── assets/
│   ├── src/
│   │   └── app/
│   │       ├── _layout.tsx
│   │       └── index.tsx
│   ├── app.json
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
│
└── server/
    ├── src/
    │   └── index.ts
    ├── .env.example
    ├── .gitignore
    ├── package.json
    ├── package-lock.json
    └── tsconfig.json
```

---

# Backend Setup

## Prerequisites

- Node.js
- npm
- OpenAI API key
- Expo development environment for the mobile application

---

## Install Backend Dependencies

```bash
cd ai/experiment-02/server
npm install
```

---

## Environment Configuration

Create:

```text
server/.env
```

Add:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Never commit the real `.env` file.

The repository contains:

```text
server/.env.example
```

as a template.

---

## Start Backend

```bash
npm run dev
```

The development server runs on:

```text
http://localhost:3000
```

---

## Build Backend

```bash
npm run build
```

The TypeScript build should complete without errors.

---

## Start Production Build

```bash
npm start
```

---

# Backend Health Check

The server provides:

```text
GET /health
```

Test:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok"
}
```

---

# Mobile Setup

The mobile application is built with React Native and Expo.

The experiment uses an Expo SDK 57 application.

Navigate to:

```bash
cd ai/experiment-02/mobile
```

Install dependencies:

```bash
npm install
```

If required for the Expo SDK 57 setup:

```bash
npx expo install expo-asset
```

Start the application:

```bash
npx expo start
```

For a physical device, `localhost` may need to be replaced with the local IP address of the development machine.

---

# Mobile API Configuration

The current development endpoint is:

```text
http://localhost:3000/api/order
```

The mobile application sends:

```json
{
  "prompt": "I want one large Margherita pizza with extra cheese"
}
```

to the backend.

---

# Mobile TypeScript Check

Run:

```bash
npx tsc --noEmit
```

This checks the mobile application's TypeScript without producing build files.

---

# API Testing with cURL

Example:

```bash
curl -X POST http://localhost:3000/api/order \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "I want one large Margherita pizza with extra cheese"
  }'
```

---

# Demo Scenarios

## Scenario 1 — Complete Order

Input:

```text
I want one large Margherita pizza with extra cheese
```

Expected structured data:

```json
{
  "intent": "create_order",
  "items": [
    {
      "name": "Margherita pizza",
      "quantity": 1,
      "size": "large",
      "customizations": [
        "extra cheese"
      ]
    }
  ]
}
```

Expected action:

```text
place_order
```

Mobile UI:

```text
Intent: create_order

Name: Margherita pizza
Quantity: 1
Size: large
Customizations: extra cheese

✅ Order looks good! Ready to place your order.
```

---

## Scenario 2 — Multiple Items

Input:

```text
I want two medium pepperoni pizzas and one small coke
```

Expected structured response contains multiple items:

```json
{
  "intent": "create_order",
  "items": [
    {
      "name": "pepperoni pizza",
      "quantity": 2,
      "size": "medium",
      "customizations": []
    },
    {
      "name": "coke",
      "quantity": 1,
      "size": "small",
      "customizations": []
    }
  ]
}
```

---

## Scenario 3 — Incomplete Order

Input:

```text
I want a pizza
```

Expected:

```json
{
  "intent": "create_order",
  "items": [
    {
      "name": "pizza",
      "quantity": 1,
      "size": "unknown",
      "customizations": []
    }
  ]
}
```

Expected action:

```text
ask_clarification
```

Mobile UI:

```text
Intent: create_order

Name: pizza
Quantity: 1
Size: unknown
Customizations: None

⚠️ More information is needed to complete your order.
```

---

## Scenario 4 — Ambiguous Request

Input:

```text
I want some food
```

Expected:

```json
{
  "intent": "unknown",
  "items": []
}
```

The request does not contain enough information to create a food order.

---

## Scenario 5 — Unsupported Request

Input:

```text
What is the weather today?
```

Expected:

```json
{
  "intent": "unknown",
  "items": []
}
```

Expected action:

```text
unsupported_request
```

Mobile UI:

```text
Intent: unknown

ℹ️ This assistant only handles food orders.
```

---

# Error Handling

The mobile application handles failed API requests.

If the request fails, the application displays:

```text
❌ Unable to analyze the order. Please try again.
```

The backend validates the incoming prompt.

If the prompt is missing or empty:

```json
{
  "error": "Prompt is required"
}
```

with HTTP status:

```text
400 Bad Request
```

---

# Security

The OpenAI API key must remain on the backend.

The React Native application should never contain the secret API key.

Correct architecture:

```text
React Native
      ↓
Your Backend
      ↓
OpenAI API
```

Not:

```text
React Native
      ↓
OpenAI API
```

with the API key embedded inside the mobile application.

The real `.env` file is ignored by Git.

Only `.env.example` should be committed.

---

# Git Ignore

The experiment intentionally ignores:

```text
node_modules/
.env
dist/
.DS_Store
```

The real OpenAI API key must never be committed.

Before committing, verify:

```bash
git status --short --untracked-files=all
```

The real `server/.env` should not appear in the output.

---

# Validation Performed

The backend build:

```bash
npm run build
```

passes successfully.

The mobile TypeScript check:

```bash
npx tsc --noEmit
```

passes successfully.

The backend health endpoint:

```bash
curl http://localhost:3000/health
```

returns:

```json
{
  "status": "ok"
}
```

The Structured Outputs endpoint has been tested with:

- Complete order
- Multiple items
- Ambiguous request
- Incomplete order
- Unsupported request

---

# Experiment 01 → Experiment 02

Experiment 01 focused on AI streaming:

```text
AI Response
     ↓
Streaming
     ↓
Chunks
     ↓
SSE
     ↓
Progressive React Native UI
```

Experiment 02 focuses on structured AI responses:

```text
AI Response
     ↓
Structured Outputs
     ↓
JSON Schema
     ↓
Validation
     ↓
Reliable Application Data
```

Together they demonstrate two different dimensions of AI integration.

### Streaming

Answers:

```text
How does the response arrive?
```

### Structured Outputs

Answers:

```text
What shape does the response have?
```

These concepts solve different problems and can be used independently.

---

# Structured Outputs vs Tool Calling

Structured Outputs:

```text
AI
 ↓
Structured Data
```

Tool Calling:

```text
AI
 ↓
Tool Request
 ↓
Application
 ↓
Tool Result
 ↓
AI
```

Structured Outputs are useful when the application needs structured information.

Tool Calling is useful when the AI needs to interact with application capabilities.

For example, the AI might structure:

```text
I want a large Margherita pizza.
```

Then a later Tool Calling experiment could allow the AI to request:

```text
checkMenuItem()
```

or:

```text
createOrder()
```

---

# Important Engineering Lessons

## 1. AI output should be treated as application data

Free-form text is difficult for applications to consume reliably.

## 2. JSON Schema provides a contract

It defines the expected structure of the response.

## 3. Structured Outputs improve reliability

The model is guided by the defined schema instead of relying only on a prompt such as:

```text
Return JSON.
```

## 4. Runtime validation is still important

The backend validates the AI-generated data before using it.

## 5. TypeScript provides compile-time safety

Types can be derived from the Zod schema.

## 6. Schema is not business logic

Schema defines the shape of data.

Business rules belong to the backend/application.

## 7. AI should not be the source of truth

AI interprets natural-language intent.

The backend validates real application state and business rules.

## 8. The schema depends on the use case

JSON Schema is a general pattern, but the actual fields should be designed around the application's requirements.

## 9. Structured Outputs and Streaming are different

Streaming controls how data arrives.

Structured Outputs control the shape of the data.

## 10. Structured Outputs and Tool Calling are different

Structured Outputs return structured information.

Tool Calling allows AI to request actions from application capabilities.

---

# Complete Request Flow

```text
User enters:

"I want one large Margherita pizza
with extra cheese"

        ↓

React Native

        ↓

POST /api/order

        ↓

Node.js / Express

        ↓

OpenAI Responses API

        ↓

GPT-5.6

        ↓

Structured Outputs

        ↓

JSON Schema

        ↓

Structured JSON

        ↓

JSON.parse()

        ↓

Zod Validation

        ↓

Business Logic

        ↓

nextAction

        ↓

JSON Response

        ↓

React Native

        ↓

Display structured result
```

---

# Future Improvements

The current experiment intentionally keeps the business logic simple.

A production implementation could add:

- Real menu data
- Product IDs
- Database validation
- Price calculation
- Inventory checking
- Restaurant availability
- Address validation
- Authentication
- Payment processing
- Order persistence
- Tool Calling
- Better clarification flows
- More detailed error handling
- Automated tests

These capabilities will be explored in later experiments.

---

# Experiment Status

**Experiment 02 — Structured AI / JSON Schema**

Status: **In Progress**

Next:

**Experiment 03 — Tool Calling**

---

# Repository

Modern Mobile Lab:

https://github.com/harryharihar/modern-mobile-lab
