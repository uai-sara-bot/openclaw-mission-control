import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Lazy singleton - doesn't throw at build time if env vars missing
let _client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey)
  }
  return _client
}

// Named export for convenience (used in client components)
export const supabase = getSupabaseClient()

export function getServiceClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY || supabaseAnonKey
  return createClient(supabaseUrl, serviceKey)
}

export { getServiceClient as createServiceClient }
