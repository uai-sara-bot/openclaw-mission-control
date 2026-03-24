import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Returns a Supabase client - always created fresh to use runtime env vars
// Works in browser (window exists) and on server
export function getSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if (!url || !key) {
    // Return a no-op client during build when vars aren't available
    return {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
        upsert: () => Promise.resolve({ data: null, error: null }),
      }),
      channel: () => ({
        on: () => ({ subscribe: () => ({}) }),
      }),
      removeChannel: () => {},
    } as unknown as SupabaseClient
  }
  
  return createClient(url, key)
}

// Named export - created fresh each time to pick up runtime env vars
export const supabase = getSupabaseClient()

export function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_KEY || ''
  if (!url || !key) return getSupabaseClient()
  return createClient(url, key)
}

export { getServiceClient as createServiceClient }
