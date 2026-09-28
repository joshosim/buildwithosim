import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { supabaseEnv } from './env'

let cached: ReturnType<typeof createSupabaseClient> | null = null

/**
 * Anonymous, cookie-less client for public reads.
 *
 * Deliberately separate from `lib/supabase/server.ts`: because it never touches
 * cookies, pages that read through it can stay statically rendered and cached,
 * with admin edits flowing in via `revalidatePath`. It carries no session, so a
 * module-level singleton is safe here (unlike the cookie-bound client).
 *
 * Row Level Security restricts this key to published projects, so it is safe to
 * use anywhere.
 */
export function publicClient() {
  if (!cached) {
    const { url, anonKey } = supabaseEnv()
    cached = createSupabaseClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return cached
}
