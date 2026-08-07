# WhyKnot

Restaurants pick new locations on instinct and a rented demographics report. The
data that would actually answer *"where are people already ordering food we don't
sell yet?"* sits inside consumers' merchant accounts — and it's theirs to give.

WhyKnot is a two-sided app built on [Knot](https://knotapi.com)'s Transaction Link.
Diners connect DoorDash and Uber Eats, get paid for it, and restaurant owners see
aggregate demand on a map instead of guessing.

## Demo

**Live:** https://whyknot.vercel.app

<!-- DEMO VIDEO: replace the line below with the uploaded walkthrough -->
_Walkthrough video: coming — records the connect → sync → heatmap flow end to end._

The hosted demo runs without Supabase, so it uses a demo identity and skips
sign-in. Everything that talks to Knot is real — see [Known gaps](#known-gaps) for
what isn't.

## How it works

**Consumer side** (`/user`) — connect a merchant account through Knot Link, see
transactions come back, collect a reward for opting in.

**Business side** (`/business`) — a demand heatmap over aggregated order data, with
location scouting and per-area analytics.

The pitch is the exchange: the consumer gets $20 and better deals, the operator
gets ground truth, and the transaction data never has to be scraped or bought.

## Knot integration

Everything Knot-facing goes through `lib/knot/`:

| Path | What it does |
|---|---|
| `lib/knot/sdk.ts` | Client-side Knot Link (`knotapi-js`), `transaction_link` product, lazily imported so it never touches SSR |
| `lib/knot/server.ts` | Server-side API client — Basic auth, environment-aware base URL, typed errors |
| `app/api/knot/session/route.ts` | `POST /session/create` — mints the session Link opens with |
| `app/api/knot/transactions/sync/route.ts` | `POST /transactions/sync` — pulls a single merchant, caches to Supabase |
| `app/api/knot/transactions/route.ts` | Fans sync out across every merchant the user connected, since sync is per-merchant |
| `app/api/knot/webhooks/route.ts` | Receives `transaction.created`, `transaction.updated`, `connection.updated` |

Merchants are addressed by Knot's numeric ids (`lib/constants.ts`): DoorDash `19`,
Uber Eats `36`.

Two details worth calling out, because both cost real debugging time:

- **`external_user_id` must be stable.** Knot pins sync cursors to it. An id
  derived per-request restarts the sync every call and never paginates.
- **`merchant_ids` is development-only** on `/session/create`; production rejects it.

## Tech stack

Next.js 14 (App Router) · TypeScript · Supabase (Postgres + Auth) · Tailwind ·
Leaflet · Vercel

## Running locally

```bash
git clone https://github.com/shivvyas2/WHYKNOT.git
cd WHYKNOT
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

### Environment

```env
# Supabase — omit entirely to run in demo mode
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Knot
NEXT_PUBLIC_KNOT_CLIENT_ID=
KNOT_API_SECRET=
KNOT_WEBHOOK_SECRET=
KNOT_ENVIRONMENT=development

# Optional: restaurant-stats backend powering the demand heatmap
RESTAURANT_STATS_API_URL=http://localhost:8000
```

### Database

```sql
-- Users (Supabase Auth uuid as primary key)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('business', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_opt_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  merchant TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  knot_connection_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transaction_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  merchant TEXT NOT NULL,
  transaction_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  promo_code TEXT UNIQUE NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  merchant TEXT NOT NULL,
  discount_percentage NUMERIC,
  discount_amount NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_opt_ins_user_id ON user_opt_ins(user_id);
CREATE INDEX idx_transaction_cache_user_id ON transaction_cache(user_id);
CREATE INDEX idx_rewards_user_id ON rewards(user_id);
CREATE INDEX idx_deals_user_id ON deals(user_id);
```

## Layout

```
app/
  (auth)/        sign-in, sign-up
  (user)/        opt-in, transactions, rewards, deals
  (business)/    map, locations, analytics
  api/knot/      session, transactions, sync, webhooks
  api/business/  orders, locations, analytics
components/      business/, user/, shared/
lib/
  knot/          sdk (client) + server (API client)
  analytics/     order parsing, store aggregation, area selection
  auth/          request-user resolution
  supabase/      browser + server clients
```

## Scripts

```bash
npm run dev         # dev server
npm run build       # production build
npm run lint        # eslint
npm run type-check  # tsc --noEmit
```

## Known gaps

Built in about two days for a hackathon; these are the honest edges.

- **Webhook signatures aren't verified.** `app/api/knot/webhooks/route.ts` reads
  `x-knot-signature` but doesn't validate it, so the endpoint trusts its caller.
  Left unimplemented rather than guessed at — it needs Knot's actual signing
  scheme, and a wrong HMAC is worse than an obvious gap.
- **Demo mode bypasses auth.** With Supabase unconfigured the app serves a fixed
  demo identity. It's opt-in or inferred from missing config — never entered
  because a real auth check failed.
- **The demand heatmap needs a separate backend.** `RESTAURANT_STATS_API_URL`
  points at a service that isn't deployed with the demo, so the map renders empty
  and says so.
- **Reward issuance isn't wired.** The `rewards` schema and UI exist; nothing
  writes to the table yet.

## License

MIT
