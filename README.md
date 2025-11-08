# WhyKnot

WhyKnot is a Next.js application that connects restaurant owners with location insights through transaction data. The platform allows users to opt-in to share their transaction data from services like DoorDash and Uber Eats in exchange for rewards and exclusive deals.

## Features

### Business Side (`/business`)
- Location scouting based on transaction data
- Analytics dashboard
- Insights into customer ordering patterns

### User Side (`/user`)
- Opt-in to share transaction data from DoorDash and Uber Eats
- Receive $20 promo code upon opt-in
- Get exclusive deals based on transaction history
- View rewards and manage data sharing preferences

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account (for database and authentication)
- Knot API credentials (when available)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd WHYKNOT
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Fill in your environment variables in `.env.local`:

```env
# Supabase (Database & Authentication)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Knot API (when available)
NEXT_PUBLIC_KNOT_API_KEY=your_knot_api_key
KNOT_API_SECRET=your_knot_api_secret
KNOT_WEBHOOK_SECRET=your_knot_webhook_secret

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Set up Supabase database:

Run the following SQL in your Supabase SQL editor to create the necessary tables:

-- Users table (uses Supabase Auth UUID as primary key)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('business', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business profiles table
CREATE TABLE business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User opt-ins table
CREATE TABLE user_opt_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  merchant TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  knot_connection_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction cache table
CREATE TABLE transaction_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  merchant TEXT NOT NULL,
  transaction_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rewards table
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  promo_code TEXT UNIQUE NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deals table
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  merchant TEXT NOT NULL,
  discount_percentage NUMERIC,
  discount_amount NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_user_opt_ins_user_id ON user_opt_ins(user_id);
CREATE INDEX idx_transaction_cache_user_id ON transaction_cache(user_id);
CREATE INDEX idx_rewards_user_id ON rewards(user_id);
CREATE INDEX idx_deals_user_id ON deals(user_id);
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
whyknot/
├── app/                    # Next.js App Router pages
│   ├── (business)/        # Business route group
│   ├── (user)/            # User route group
│   ├── (auth)/            # Auth pages
│   └── api/               # API routes
├── components/            # React components
│   ├── business/          # Business-specific components
│   ├── user/              # User-specific components
│   └── shared/            # Shared components
├── lib/                   # Utility libraries
│   ├── knot/              # Knot SDK integration
│   ├── supabase/          # Supabase client
│   └── clerk/             # Clerk utilities
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── config/                 # Configuration files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## CI/CD

The project includes a GitHub Actions workflow that runs on push and pull requests:
- Type checking
- Linting
- Build verification

## Knot SDK Integration

The Knot SDK integration is currently set up with placeholder implementations. Once the Knot SDK documentation is available, update the following files:

- `lib/knot/client.ts` - Knot SDK client wrapper
- `lib/knot/types.ts` - Knot API types
- `lib/knot/hooks.ts` - React hooks for Knot
- `app/api/knot/` - Knot API routes

## Deployment

The application is configured for deployment on Vercel. Make sure to:

1. Set all environment variables in Vercel dashboard
2. Configure Clerk for production URLs
3. Set up Supabase production database
4. Configure Knot API credentials

## License

[Add your license here]

