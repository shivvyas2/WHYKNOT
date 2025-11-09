import { z } from 'zod'

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Knot API
  NEXT_PUBLIC_KNOT_CLIENT_ID: z.string().optional(), // Knot Client ID (used as API Key)
  KNOT_API_SECRET: z.string().optional(), // Knot API Secret
  KNOT_WEBHOOK_SECRET: z.string().optional(),
  KNOT_ENVIRONMENT: z.enum(['development', 'production']).default('development'),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  
  // Restaurant Stats Backend API
  RESTAURANT_STATS_API_URL: z.string().url().default('http://localhost:8000'),
  
  // MongoDB
  MONGO_URI: z.string().optional(),
  
  // AI/ML APIs
  NOVA_ACT_API_KEY: z.string().optional(),
  DEDALUS_LABS_KEY: z.string().optional(),
  CLAUDE_API_KEY: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

function getEnv(): Env {
  // Preprocess environment variables to trim whitespace/newlines
  // Vercel environment variables sometimes have trailing newlines
  const processedEnv = { ...process.env }
  
  // Trim all string environment variables to remove newlines/whitespace
  Object.keys(processedEnv).forEach((key) => {
    if (typeof processedEnv[key] === 'string') {
      processedEnv[key] = processedEnv[key].trim()
    }
  })
  
  // Always use partial parsing to allow missing optional env vars
  // This prevents module load failures in production
  try {
    return envSchema.partial().parse(processedEnv) as Env
  } catch (error) {
    // Even if validation fails, return a safe default object
    // This prevents the entire app from crashing due to env validation
    console.error('Environment variable validation error:', error)
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((e) => e.path.join('.')).join(', ')
      console.error(`Invalid environment variables: ${missingVars}`)
    }
    // Return defaults to prevent app crash
    return {
      KNOT_ENVIRONMENT: 'development',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      RESTAURANT_STATS_API_URL: 'http://localhost:8000',
    } as Env
  }
}

export const env = getEnv()

