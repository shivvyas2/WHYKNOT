import { z } from 'zod'

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Knot API
  NEXT_PUBLIC_KNOT_API_KEY: z.string().optional(),
  KNOT_API_SECRET: z.string().optional(),
  KNOT_WEBHOOK_SECRET: z.string().optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
})

export type Env = z.infer<typeof envSchema>

function getEnv(): Env {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Only throw in production, allow missing vars in development/CI
      if (process.env.NODE_ENV === 'production' && !process.env.CI) {
        const missingVars = error.errors.map((e) => e.path.join('.')).join(', ')
        throw new Error(`Missing or invalid environment variables: ${missingVars}`)
      }
      // In development/CI, return partial env with defaults
      return envSchema.partial().parse(process.env) as Env
    }
    throw error
  }
}

export const env = getEnv()

