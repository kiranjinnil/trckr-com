# ZiroPlans — AI-Powered Travel Planner

A full-stack travel planning application that uses AI to generate optimized day-by-day itineraries with budget breakdowns and route optimization.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js (App Router), Tailwind CSS, Shadcn UI, React Hook Form, Zod |
| **Backend** | Cloudflare Workers (Edge) |
| **Auth** | Clerk (JWT + OAuth) |
| **Database** | MongoDB Atlas (Data API) |
| **AI** | OpenAI GPT-4o (JSON structured output) |
| **Maps** | Google Places, Directions, Distance Matrix APIs |
| **Hosting** | Cloudflare Pages (frontend) + Workers (backend) |

## Project Structure

```
travel-planner/
├── src/                        # Next.js Frontend
│   ├── app/
│   │   ├── globals.css         # Design system (Shadcn variables)
│   │   ├── layout.tsx          # Root layout with Clerk provider
│   │   ├── page.tsx            # PAGE 1: Input form
│   │   └── itinerary/
│   │       └── [tripId]/
│   │           └── page.tsx    # PAGE 2: Output/itinerary display
│   ├── components/
│   │   ├── ui/                 # Shadcn-style UI primitives
│   │   ├── trip-form.tsx       # Main input form component
│   │   ├── places-autocomplete.tsx
│   │   ├── loading-state.tsx
│   │   ├── error-display.tsx
│   │   ├── trip-summary.tsx
│   │   ├── day-itinerary.tsx
│   │   ├── budget-breakdown.tsx
│   │   └── route-optimization.tsx
│   ├── lib/
│   │   ├── utils.ts            # Utility functions
│   │   ├── types.ts            # TypeScript types
│   │   ├── validation.ts       # Zod schemas
│   │   ├── api-client.ts       # API client
│   │   └── constants.ts        # App configuration
│   └── middleware.ts           # Clerk auth middleware
├── worker/                     # Cloudflare Worker Backend
│   ├── src/
│   │   ├── index.ts            # Main Worker (router)
│   │   ├── types.ts            # Backend types
│   │   ├── auth.ts             # Clerk JWT verification
│   │   ├── openai.ts           # OpenAI integration
│   │   ├── google-maps.ts      # Google Maps APIs
│   │   └── mongodb.ts          # MongoDB Atlas Data API
│   ├── wrangler.toml
│   └── package.json
├── .env.example
└── .env.local
```

## Getting Started

### Prerequisites
- Node.js 18+
- Wrangler CLI (`npm install -g wrangler`)
- Accounts: Clerk, OpenAI, Google Cloud, MongoDB Atlas, Cloudflare

### 1. Install Dependencies

```bash
# Frontend
npm install

# Worker
cd worker && npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and fill in your API keys.

Set Worker secrets:
```bash
cd worker
wrangler secret put OPENAI_API_KEY
wrangler secret put MONGODB_URI
wrangler secret put CLERK_SECRET_KEY
wrangler secret put CLERK_PUBLISHABLE_KEY
wrangler secret put GOOGLE_MAPS_API_KEY
```

### 3. Run Locally

```bash
# Terminal 1: Frontend (http://localhost:3000)
npm run dev

# Terminal 2: Worker (http://localhost:8787)
cd worker && npx wrangler dev
```

### 4. Deploy

```bash
# Deploy Worker
cd worker && npx wrangler deploy

# Deploy Frontend — connect repo to Cloudflare Pages
# Build command: npm run build
# Output directory: .next
```

## Architecture

### Page 1: Input Form
- Zod + React Hook Form validation
- Google Places autocomplete
- Animated multi-step loading overlay
- Categorized error handling with retry

### Page 2: Output Page
- **Trip Summary Card** — destination, dates, budget, style
- **Day-wise Itinerary** — timeline with time slots, costs, Google Maps links
- **Budget Breakdown** — visual chart + itemized list
- **Route Optimization** — clustering, Distance Matrix, visit order logic

### API Flow
```
Next.js → Clerk JWT → Worker → Validate → OpenAI (GPT-4o JSON) → Google Maps → MongoDB → Response
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check |
| GET | `/api/places/autocomplete?query=` | No | Place suggestions |
| POST | `/api/trips/generate` | Yes | Generate new trip |
| GET | `/api/trips/:id` | Yes | Get trip by ID |
| GET | `/api/trips` | Yes | Get user's trips |
