# Legalet Prospect Research Agent

AI-powered sales intelligence for California workers' comp defense law firms.

## Setup

### 1. Deploy to Vercel

Push this repo to GitHub, then import into Vercel.

### 2. Add Environment Variable

In Vercel → Project Settings → Environment Variables, add:

```
ANTHROPIC_API_KEY = your_anthropic_api_key_here
```

Get your API key from: https://console.anthropic.com/

### 3. Deploy

Vercel will auto-deploy on every push to main.

## How it works

- Frontend: React/Vite app
- Backend: Vercel serverless function at `/api/research.js`
- The serverless function calls the Anthropic API with web search enabled
- Returns a structured JSON prospect profile

## Project structure

```
├── api/
│   └── research.js     # Vercel serverless function (Anthropic proxy)
├── src/
│   ├── App.jsx         # Main React app
│   └── main.jsx        # Entry point
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```
