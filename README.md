# BolKeOrder (बोलके Order) 🎙️🛒

> "Just say it. We'll handle the rest."

BolKeOrder is a voice-first commerce AI platform designed to make food and grocery delivery accessible to millions of non-tech-savvy and elderly users in India/Bharat. By replacing complex UI flows with natural, vernacular voice interactions via a phone call or web microphone, it bridges the digital divide for daily commerce.



## 🏆 Hackathon Context & Problem Statement

**The Problem:** Modern delivery apps have complex, deeply-nested UIs. This creates a high barrier to entry for millions of elderly adults, visually impaired users, or those who aren't deeply digitally literate. They want to order food or groceries but can't navigate the apps.

**The Solution:** Vernacular voice-first ordering. A user simply makes a call or clicks "Speak" on the web, and naturally describes their order in Hindi, English, Kannada, or other local languages. The AI parser extracts the intent, confirms the cart, remembers user preferences, and hooks into delivery APIs.

## 🏗️ Architecture

![BolKeOrder System Architecture](./bolkeorder_system_architecture.svg)

<details>
<summary>Text-based architecture overview</summary>

```text
User ──(Voice / Call)──> Vapi.ai (STT/TTS & Call Management)
                              │
                              ▼ (Webhook)
                        FastAPI Backend ────> Next.js Dashboard (Operators)
                        (Intent parsing)             ▲
                              │                      │ (GraphQL via Apollo)
                              ▼                      │
                        Agents Layer <───────────────┘
                        (Order/Memory/Response)
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
    PostgreSQL              Redis                 Qdrant
  (Users, Orders)       (Cache, Queue)        (Memory, Prefs)
```

</details>

## ScreenShots:
<img width="1903" height="824" alt="Screenshot 2026-04-17 143654" src="https://github.com/user-attachments/assets/3ea4bc2f-1f8c-4fe7-9425-805c3013fb8c" />
<img width="2537" height="1607" alt="Screenshot 2026-04-17 143644" src="https://github.com/user-attachments/assets/15287064-e94e-420b-97bd-e3ae1602cbf3" />
<img width="2252" height="1592" alt="Screenshot 2026-04-17 143712" src="https://github.com/user-attachments/assets/011bb5c7-05f7-4877-9d8d-4abca778fadb" />
<img width="2313" height="1414" alt="Screenshot 2026-04-17 143751" src="https://github.com/user-attachments/assets/7e1c2676-545d-401e-9708-e33bce778131" />




## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React 18, TailwindCSS, shadcn/ui, Apollo Client, Vapi.ai Web SDK
- **Backend:** Python 3.11, FastAPI, Strawberry (GraphQL), SQLAlchemy, Alembic
- **AI & Integrations:** Vapi.ai (Voice), OpenAI GPT-4o / Gemini 1.5 Pro (LLM/NLU)
- **Databases:** PostgreSQL (Relational), Redis (Cache), Qdrant (Vector / Memory)
- **Deployment:** Docker Compose

## 🚀 Quick Start

Ensure you have [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/) installed.

1. Clone the repository:
   ```bash
   git clone https://github.com/Atul-k-m/BolKeOrder.git
   cd BolKeOrder
   ```
2. Set up environment variables (see Environment Setup Guide Below)
3. Run the complete stack:
   ```bash
   docker-compose up -d
   ```
4. Frontend is accessible at `http://localhost:3000`
5. Backend API is accessible at `http://localhost:8000`

## ⚙️ Environment Setup Guide

Create `.env` file in the root based on the following template (this is required for Docker compose):

```env
# Application
APP_ENV=development
SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=http://localhost:3000

# Database
DATABASE_URL=postgresql+asyncpg://user:pass@postgres:5432/bolkeorder
REDIS_URL=redis://redis:6379

# Vapi
VAPI_API_KEY=your-vapi-api-key
VAPI_WEBHOOK_SECRET=your-webhook-secret
VAPI_PHONE_NUMBER_ID=your-phone-number-id

# AI Models
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-4o
# GEMINI_API_KEY=your-gemini-key

# Object Storage / Vector DB
QDRANT_URL=http://qdrant:6333
QDRANT_API_KEY=your-qdrant-api-key

# Mock Platform Integrations (For Hackathon Demo)
SWIGGY_API_KEY=mock
ZOMATO_API_KEY=mock
ZEPTO_API_KEY=mock
```

## 🎙️ Vapi Webhook Configuration Steps

1. Log into your [Vapi Dashboard](https://dashboard.vapi.ai/).
2. Create a new Assistant or configure an existing one.
3. Under the **Server** or **Webhooks** section, set the Webhook URL to: 
   `https://<your-ngrok-or-production-domain>/webhook/vapi`
4. Set up the Webhook Secret and copy it to your `.env` file (`VAPI_WEBHOOK_SECRET`).
5. Ensure events like `call.started`, `speech.update`, and `call.ended` are forwarded to this webhook.

## 🧠 Qdrant Collection Setup Script

To initialize Qdrant memory collections (run within the backend container or locally if connected):

```bash
cd backend
python -c "from services.qdrant_service import init_collections; init_collections()"
```
*Note: This will verify/create `user_preferences`, `order_history`, and `menu_catalog`.*

## 🔌 APIs & Docs

- **REST API (FastAPI auto-generated Docs):** `http://localhost:8000/docs`
- **GraphQL Playground:** `http://localhost:8000/graphql`

