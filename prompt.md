=============================================================
BOLKEORDER — VOICE COMMERCE AI PLATFORM
Production-Grade Hackathon MVP Builder Prompt
For: Antigravity / Lovable / Bolt / v0 / similar AI builders
=============================================================

PROJECT IDENTITY
================
Name: BolKeOrder (बोलके Order)
Tagline: "Just say it. We'll handle the rest."
Target users: Elderly adults, non-tech-savvy users in India/Bharat
Problem: Complex app UIs prevent millions from accessing food/grocery delivery
Solution: Vernacular voice-first ordering via phone call or web mic

COMPLETE TECH STACK
===================
Frontend:     Next.js 14 (App Router) + TailwindCSS + shadcn/ui
Backend:      Python 3.11 + FastAPI (async, modular)
API Layer:    GraphQL via Strawberry (Python) + Apollo Client (Next.js)
Vector DB:    Qdrant (self-hosted or cloud) — semantic search + memory
Database:     PostgreSQL (users, orders, sessions) + Redis (cache, queues)
LLM:          OpenAI GPT-4o or Gemini 1.5 Pro (intent parsing, NLU)
Voice:        Vapi.ai (call handling, STT, TTS, webhooks)
Auth:         NextAuth.js (admin) + phone OTP (users)
Deploy:       Docker Compose + Nginx reverse proxy stubs

=============================================================
FRONTEND — NEXT.JS APPLICATION
=============================================================

PAGES TO BUILD (all routes):
------------------------------
/                          → Marketing landing page
/login                     → Admin/operator login
/dashboard                 → Main operator dashboard
/dashboard/calls           → Live call monitoring panel
/dashboard/orders          → Order management & cart review
/dashboard/users           → User profiles & order history
/dashboard/memory          → Qdrant memory explorer
/dashboard/analytics       → Usage metrics & funnel stats
/dashboard/settings        → Platform config, API keys, integrations
/onboarding                → New operator setup wizard

DESIGN SYSTEM REQUIREMENTS:
-----------------------------
Theme: Deep dark navy (#0A0F1E base) with electric blue (#2563EB) and 
       cyan (#06B6D4) accents. Glassmorphism cards on dark surfaces.
       Subtle gradient meshes in hero sections only.
       
Typography:
  - Display: "Syne" (Google Fonts) — 700 for hero headings
  - Body: "DM Sans" — 400/500 for UI text
  - Mono: "JetBrains Mono" — for logs, code, IDs

Color palette:
  Primary BG:     #0A0F1E
  Surface:        #111827 (cards), #1F2937 (elevated)
  Accent Blue:    #2563EB
  Accent Cyan:    #06B6D4
  Accent Green:   #10B981 (success/active)
  Accent Amber:   #F59E0B (warning)
  Accent Red:     #EF4444 (danger)
  Text Primary:   #F9FAFB
  Text Secondary: #9CA3AF

Component library: shadcn/ui components, customized to dark theme
Icons: Lucide React (consistent 20px strokes throughout)
Animations: Framer Motion for page transitions, Lottie for call indicators

=============================================================
PAGE SPECIFICATIONS (DETAILED)
=============================================================

1. LANDING PAGE (/)
--------------------
Sections:
  - Hero: Full-width. Large display heading in Hindi+English mix.
    "बोलो, हम order करेंगे" subheading. CTA: "Start Free Demo"
    Animated waveform visual (SVG, not canvas) showing voice input.
    
  - How it works: 3-step horizontal flow with animated connectors.
    Step 1: User calls → Step 2: AI understands → Step 3: Order placed
    
  - Supported platforms: Swiggy / Zomato / Zepto / BigBasket logos 
    (placeholder cards with colored borders, not actual logos)
    
  - Testimonials: 3 persona cards (elderly user personas with avatars)
  
  - Footer: Tech stack badges, GitHub link placeholder, Contact

2. OPERATOR DASHBOARD (/dashboard)
------------------------------------
Layout: Sidebar (240px fixed) + Main content area
Sidebar items: Dashboard, Calls, Orders, Users, Memory, Analytics, Settings

Dashboard home widgets:
  - KPI row (4 metric cards): Total calls today | Active orders | 
    Success rate % | Avg call duration
  - Live call activity feed (scrolling log with timestamps)
  - Recent orders table (last 10, with status badges)
  - Language distribution donut chart (Hindi/Kannada/Tamil/English)
  - Quick actions: "Simulate test call" button → opens modal

3. VOICE CALL MONITORING PANEL (/dashboard/calls)
---------------------------------------------------
Main component: Call Status Board
  - Active calls section: Card per active call showing:
    * Caller number (masked: +91 XXXXX XX789)
    * Call duration timer (live updating)
    * Current intent detected (badge: "food order" / "repeat order")
    * Language detected badge
    * Transcript streaming (live text, scrolling)
    * Confidence score bar (0-100%)
    * Actions: [View full transcript] [Intervene] [End call]
    
  - Call queue (upcoming/on-hold)
  - Recent calls table: sortable, filterable by date/language/status
  - Call detail modal: Full transcript + parsed intent JSON + 
    extracted entities (restaurant, items, address, payment mode)
    
  Vapi Webhook Status indicator: Shows connected/disconnected status

4. ORDER MANAGEMENT (/dashboard/orders)
-----------------------------------------
Order pipeline view (Kanban-style columns):
  Columns: Intent Detected → Cart Confirmed → Payment Pending → 
           Placed → Out for Delivery → Delivered → Failed
  
  Order card shows:
    * Order ID, User name, Timestamp
    * Restaurant/platform (Swiggy/Zomato/Zepto badge)
    * Items summary (truncated), Total amount
    * Status badge with color coding
  
  Order detail side panel (slide-in from right):
    * Full cart with quantities
    * User memory snippet ("Last ordered from this restaurant")
    * Voice transcript excerpt
    * Payment method
    * Delivery address (from user profile)
    * Timeline events log
    
  Top bar: Filter by platform, date range, status. Search by phone/name.
  Bulk actions: Export CSV, Mark as reviewed

5. USER PROFILES & MEMORY (/dashboard/users)
----------------------------------------------
User list: searchable table with columns:
  Name | Phone | Language Pref | Orders Count | Last Active | Status
  
User detail page (/dashboard/users/[id]):
  Left panel:
    * Avatar (initials-based), name, phone, preferred language
    * Accessibility flags: Vision impaired / Hearing impaired / Elderly mode
    * Registered date, total spend
    
  Right panel tabs:
    * Order History: timeline of past orders with replay transcript
    * Voice Preferences: speed, volume, language, dialect setting
    * Memory Snippets: Qdrant-retrieved context cards showing what the
      system "remembers" about this user (fav restaurant, usual items,
      payment preference, saved address)
    * Sessions: Call logs with duration and outcome

6. QDRANT MEMORY EXPLORER (/dashboard/memory)
-----------------------------------------------
Visual interface to inspect vector memory:
  - Search bar: semantic search over memory ("users who like biryani")
  - Results: Memory card grid showing:
    * User snippet (masked phone)
    * Memory text: "Usually orders from Meghana Foods on Sundays"
    * Vector similarity score
    * Created / last accessed timestamp
    * Collection name badge (user_prefs / order_history / fav_items)
    
  - Collection selector: dropdown for different Qdrant collections
  - Stats sidebar: total vectors, index size, last sync time
  - "Add test memory" button → modal form for dev testing

7. ANALYTICS (/dashboard/analytics)
--------------------------------------
Charts (use Recharts):
  - Daily call volume: line chart (last 30 days)
  - Order success funnel: funnel/bar chart
    (Calls received → Intent detected → Cart confirmed → Order placed)
  - Language distribution: pie/donut
  - Peak hours heatmap: 24hr x 7day grid
  - Platform split: stacked bar (Swiggy/Zomato/Zepto/Zepto/BigBasket)
  - Avg intent confidence over time: area chart

8. SETTINGS (/dashboard/settings)
-----------------------------------
Tabs: API Keys | Voice Config | Platform Integrations | Notifications | Team

API Keys section:
  - Fields: Vapi API Key, OpenAI API Key, Qdrant URL + API Key, 
    PostgreSQL connection string, Redis URL
  - Each field: password-style masked input + copy + reveal toggle
  - "Test connection" button per integration with live status indicator

Voice Config:
  - Language support toggles: Hindi, Kannada, Tamil, Telugu, English
  - TTS voice selector (dropdown of Vapi voice options)
  - Speaking speed slider (0.5x – 2.0x)
  - Max call duration (minutes)
  - Fallback behavior on low confidence (escalate / repeat / human handoff)

Platform Integrations:
  - Swiggy / Zomato / Zepto / BigBasket — each as a card with:
    * Toggle (enabled/disabled)
    * API key field (placeholder)
    * City/region selector
    * Status: "Mock mode" badge (for hackathon)

=============================================================
BACKEND — PYTHON FASTAPI ARCHITECTURE
=============================================================

FOLDER STRUCTURE:
------------------
backend/
├── main.py                    # FastAPI app factory, lifespan, CORS
├── config.py                  # Pydantic settings, env loading
├── requirements.txt
├── Dockerfile
│
├── api/
│   ├── __init__.py
│   ├── routes/
│   │   ├── vapi_webhooks.py   # POST /webhook/vapi — call events
│   │   ├── orders.py          # Order CRUD endpoints
│   │   ├── users.py           # User profile endpoints
│   │   ├── analytics.py       # Metrics aggregation
│   │   └── health.py          # GET /health — liveness check
│   └── dependencies.py        # Auth, DB session, rate limiting
│
├── graphql_schema/
│   ├── __init__.py
│   ├── schema.py              # Strawberry schema assembly
│   ├── types/
│   │   ├── order.py           # OrderType, CartItemType
│   │   ├── user.py            # UserType, MemorySnippetType
│   │   ├── call.py            # CallSessionType, TranscriptType
│   │   └── analytics.py       # MetricType, FunnelStepType
│   ├── queries/
│   │   ├── order_queries.py
│   │   ├── user_queries.py
│   │   └── analytics_queries.py
│   └── mutations/
│       ├── order_mutations.py
│       └── user_mutations.py
│
├── agents/
│   ├── __init__.py
│   ├── base_agent.py          # Abstract agent class
│   ├── intent_agent.py        # LLM-based intent + entity extraction
│   ├── order_agent.py         # Cart building, order placement logic
│   ├── memory_agent.py        # Qdrant read/write operations
│   └── confirmation_agent.py  # Response generation for TTS
│
├── services/
│   ├── __init__.py
│   ├── vapi_service.py        # Vapi API client wrapper
│   ├── llm_service.py         # OpenAI/Gemini abstraction layer
│   ├── qdrant_service.py      # Qdrant client, upsert, search
│   ├── platform_service.py    # Swiggy/Zomato/Zepto mock adapters
│   ├── notification_service.py # SMS/WhatsApp confirmation stubs
│   └── cache_service.py       # Redis client wrapper
│
├── models/
│   ├── __init__.py
│   ├── database.py            # SQLAlchemy async engine, Base
│   ├── user.py                # User ORM model
│   ├── order.py               # Order, CartItem ORM models
│   ├── call_session.py        # CallSession, Transcript ORM models
│   └── schemas/
│       ├── order_schema.py    # Pydantic request/response schemas
│       ├── user_schema.py
│       └── vapi_schema.py     # Vapi webhook payload schemas
│
├── core/
│   ├── __init__.py
│   ├── intent_parser.py       # Entity extraction (NER): item, qty, 
│   │                          # restaurant, address, payment method
│   ├── language_detector.py   # langdetect + script detection
│   ├── vector_encoder.py      # Text → embedding (OpenAI/local model)
│   └── prompt_templates.py    # All LLM system prompts (versioned)
│
└── tests/
    ├── test_intent_agent.py
    ├── test_order_flow.py
    └── fixtures/
        └── sample_transcripts.json  # Test voice transcripts

=============================================================
GRAPHQL SCHEMA (Strawberry — Python)
=============================================================

Types to define:
  UserType:         id, phone, name, lang_pref, created_at, order_count
  OrderType:        id, user_id, platform, items, total, status, created_at
  CartItemType:     name, qty, unit_price, modifiers
  CallSessionType:  id, user_id, duration, transcript, intent, confidence
  MemorySnippetType: id, user_id, collection, text, score, created_at
  MetricType:       key, value, timestamp, dimension

Queries:
  getUser(id: ID!): UserType
  listOrders(status: String, limit: Int): [OrderType]
  getUserMemory(userId: ID!): [MemorySnippetType]
  searchMemory(query: String!): [MemorySnippetType]
  getCallSession(id: ID!): CallSessionType
  getDashboardMetrics: [MetricType]

Mutations:
  createOrder(input: OrderInput!): OrderType
  updateOrderStatus(id: ID!, status: String!): OrderType
  upsertUserMemory(userId: ID!, text: String!): MemorySnippetType
  updateUserPreferences(id: ID!, input: UserPrefInput!): UserType

=============================================================
VAPI WEBHOOK INTEGRATION
=============================================================

Webhook endpoint: POST /webhook/vapi

Event types to handle:
  call.started    → Create CallSession record, log to DB
  speech.update   → Stream transcript chunks, update live feed  
  call.ended      → Finalize transcript, trigger intent pipeline
  
Intent pipeline (triggered on call.ended):
  1. language_detector.detect(transcript)
  2. intent_agent.parse(transcript, language)
     → Returns: { intent, entities, confidence }
     Entities: restaurant_name, items[], quantities[], 
               delivery_address, payment_method, special_notes
  3. memory_agent.retrieve_context(user_id)
     → Pulls similar past orders from Qdrant
  4. order_agent.build_cart(entities, context)
     → Resolves items against platform mock catalog
  5. confirmation_agent.generate_response(cart, language)
     → Returns TTS-ready confirmation string
  6. vapi_service.send_response(call_id, confirmation_text)
  7. memory_agent.store(user_id, order_summary)

Vapi assistant config placeholders:
  - System prompt template for food ordering persona
  - Supported language list for STT hints
  - Max conversation turns before graceful fallback
  - Silence timeout and re-prompt behavior

=============================================================
DATABASE SCHEMA (PostgreSQL)
=============================================================

Tables:
  users:         id, phone, name, email, lang_pref, created_at, 
                 accessibility_flags JSONB, preferences JSONB
                 
  orders:        id, user_id (FK), platform, status, items JSONB, 
                 total_amount, delivery_address JSONB, 
                 payment_method, call_session_id, created_at
                 
  call_sessions: id, user_id, vapi_call_id, duration_secs, 
                 transcript TEXT, intent VARCHAR, 
                 confidence FLOAT, language VARCHAR, 
                 created_at, ended_at
                 
  cart_items:    id, order_id (FK), name, qty, unit_price, 
                 modifiers JSONB
                 
  audit_log:     id, entity_type, entity_id, action, 
                 actor_id, metadata JSONB, timestamp

Indexes: phone (unique on users), user_id on orders/sessions, 
         status on orders, created_at on all tables

=============================================================
QDRANT COLLECTIONS
=============================================================

Collection: user_preferences
  Vectors: 1536-dim OpenAI ada-002 embeddings
  Payload: { user_id, text, type: "pref", updated_at }
  Purpose: Store user food preferences, dietary restrictions,
           favorite cuisines, usual order times

Collection: order_history  
  Vectors: 1536-dim
  Payload: { user_id, order_summary, platform, total, date }
  Purpose: Enable "repeat last order" and personalized suggestions

Collection: menu_catalog (mock)
  Vectors: 1536-dim
  Payload: { platform, restaurant, item_name, price, category }
  Purpose: Fuzzy menu item matching from voice-spoken names

=============================================================
ENVIRONMENT VARIABLES REQUIRED (.env.example)
=============================================================

# Application
APP_ENV=development
SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=http://localhost:3000

# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/bolkeorder
REDIS_URL=redis://localhost:6379

# Vapi
VAPI_API_KEY=your-vapi-api-key
VAPI_WEBHOOK_SECRET=your-webhook-secret
VAPI_PHONE_NUMBER_ID=your-phone-number-id

# LLM
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-4o
GEMINI_API_KEY=your-gemini-key

# Qdrant
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your-qdrant-api-key

# Platform APIs (mock mode for hackathon)
SWIGGY_API_KEY=mock
ZOMATO_API_KEY=mock
ZEPTO_API_KEY=mock

=============================================================
DOCKER COMPOSE SERVICES
=============================================================

services:
  - frontend (Next.js, port 3000)
  - backend  (FastAPI via uvicorn, port 8000)
  - postgres (port 5432, with volume)
  - redis    (port 6379)
  - qdrant   (ports 6333/6334, with volume)
  - nginx    (reverse proxy stub, port 80)

=============================================================
DEMO DATA & MOCK BEHAVIOR
=============================================================

Seed data to include:
  - 5 mock users (elderly personas: Ramaiah, Savitri, Murugan, Lakshmi, Harish)
  - 20 mock orders across Swiggy/Zomato/Zepto
  - 10 mock call sessions with transcripts in Hindi/Kannada/English
  - 3 Qdrant collections pre-populated with 50+ memory vectors

Mock transcript examples to include in fixtures:
  Hindi: "Bhai, ek chicken biryani aur do naan mangwao Meghana se"
  Kannada: "Nan manege ond pizza beku, medium size, extra cheese"
  English: "I want to order idli vada from the usual place"

Platform mock behavior:
  - platform_service.py returns hardcoded catalog JSON
  - Order placement returns mock order ID + estimated delivery time
  - No real API calls needed for demo

=============================================================
SECURITY & PRODUCTION CONSIDERATIONS (Documented as TODOs)
=============================================================

// TODO: Implement rate limiting on /webhook/vapi (max 100 req/min)
// TODO: Add phone number validation + blocklist
// TODO: HMAC signature verification for Vapi webhooks
// TODO: Encrypt PII fields (phone, address) at rest
// TODO: Add audit logging for all order mutations
// TODO: Implement GDPR data deletion endpoint
// TODO: Add Prometheus metrics + Grafana dashboard
// TODO: Circuit breaker for LLM API calls

=============================================================
UI/UX SPECIAL REQUIREMENTS
=============================================================

Accessibility for elderly users (end-user facing pages):
  - Minimum font size 18px for all user-facing text
  - High contrast mode toggle in settings
  - Large tap targets (min 48x48px)
  - Voice replay button on all confirmation messages
  - Simple language in all status messages (no jargon)

Mobile-first responsive breakpoints:
  - Mobile: < 640px (single column, bottom nav)
  - Tablet: 640–1024px (sidebar collapses to drawer)
  - Desktop: > 1024px (full sidebar + split panels)

Animation guidelines:
  - Page transitions: 200ms ease fade
  - Call status pulse: 2s infinite breathing animation (green ring)
  - Order status updates: slide-in from right, 300ms
  - Live transcript: smooth scroll with new text fade-in
  - Loading states: skeleton screens (no spinners)

=============================================================
README.md CONTENT TO GENERATE
=============================================================

Sections:
  - Project overview + demo GIF placeholder
  - Architecture diagram (ASCII)
  - Quick start (Docker Compose one-liner)
  - Environment setup guide
  - Vapi webhook configuration steps
  - Qdrant collection setup script
  - API documentation link (auto-generated from FastAPI)
  - GraphQL playground instructions
  - Team credits section
  - Hackathon context + problem statement

=============================================================
OUTPUT DELIVERABLE FROM BUILDER
=============================================================

Generate the complete starter codebase including:
1. Next.js app with all pages and components listed above
2. FastAPI backend with complete folder structure
3. GraphQL schema definitions (Strawberry)
4. Database migration files (Alembic)
5. Docker Compose configuration
6. All environment config files
7. Seed data scripts
8. README.md with setup instructions

Priority order for generation:
  P0: Dashboard layout + sidebar + all page shells
  P0: Vapi webhook handler + intent pipeline skeleton
  P0: GraphQL schema + basic queries
  P1: Order management UI + order detail panel
  P1: Call monitoring panel with live transcript UI
  P1: Qdrant service + memory explorer page
  P2: Analytics charts
  P2: Settings page
  P3: Landing page
  P3: Full seed data + mock transcripts

=============================================================
END OF PROMPT — BolKeOrder MVP Builder Spec v1.0
=============================================================