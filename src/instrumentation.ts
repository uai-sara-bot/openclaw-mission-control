export async function register() {
  // Only run on server, not during build
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
      console.log('[MC] Supabase not configured, skipping auto-seed')
      return
    }
    try {
      const { seedRealData } = await import('./lib/db-seed')
      await seedRealData()
      console.log('[MC] Database seeded successfully')
    } catch (err) {
      console.error('[MC] Seed error:', err)
    }
  }
}
