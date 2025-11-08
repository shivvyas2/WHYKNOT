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
})

export type Env = z.infer<typeof envSchema>

function getEnv(): Env {
  // In CI or development, allow missing optional env vars
  if (process.env.CI || process.env.NODE_ENV !== 'production') {
    return envSchema.partial().parse(process.env) as Env
  }
  
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((e) => e.path.join('.')).join(', ')
      throw new Error(`Missing or invalid environment variables: ${missingVars}`)
    }
    throw error
  }
}

export const env = getEnv()

