/**
 * Next.js instrumentation hook - runs once on server startup
 * Attempts to create Supabase tables and seed real data
 * 
 * For table creation to work, set DATABASE_URL in Railway env vars:
 * postgresql://postgres.advxcrconarkrhfzstlf:[DB_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
 * Get DB_PASSWORD from: Supabase Dashboard → Project Settings → Database
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { seedRealData } = await import('./lib/db-seed')
    await seedRealData()
  }
}
