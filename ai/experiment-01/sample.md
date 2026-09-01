┌──────────────────┐
│  React Native    │
│                  │
│ Prompt + Button  │
└────────┬─────────┘
         │
         │ HTTP POST
         ▼
┌──────────────────┐
│ Express Backend  │
│                  │
│ /api/chat        │
└────────┬─────────┘
         │
         │ OpenAI SDK
         ▼
┌──────────────────┐
│    OpenAI API    │
│                  │
│     GPT-5.6      │
└──────────────────┘


Project Structure 
ai/
└── experiment-01/
    │
    ├── README.md
    │
    ├── mobile/
    │
    └── server/
        ├── src/
        │   └── index.ts
        ├── .env
        ├── .env.example
        ├── .gitignore
        └── package.json


        Cpmplete Flow 
                            USER
                      │
                      ▼
              ┌───────────────┐
              │ React Native  │
              │               │
              │ Prompt        │
              │ Ask AI        │
              └───────┬───────┘
                      │
                      │ POST /api/chat
                      ▼
              ┌───────────────┐
              │ Express       │
              │               │
              │ Validate      │
              │ OpenAI SDK    │
              └───────┬───────┘
                      │
                      │ Responses API
                      ▼
              ┌───────────────┐
              │ OpenAI        │
              │               │
              │ GPT-5.6       │
              └───────┬───────┘
                      │
                      │ Response
                      ▼
              ┌───────────────┐
              │ Express       │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ React Native  │
              └───────────────┘

            