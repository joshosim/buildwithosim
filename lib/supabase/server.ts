import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseEnv, trySupabaseEnv } from './env'

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 *
 * Must be created per request — never hoist this to a module-level singleton,
 * or sessions would leak between users.
 */
export async function createClient() {
  const cookieStore = await cookies()
  const { url, anonKey } = supabaseEnv()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Components cannot set cookies. This is harmless: middleware
          // refreshes the session on every request, so the write is redundant.
        }
      },
    },
  })
}

/**
 * The signed-in user, or null. Returns null rather than throwing when Supabase
 * is not configured yet, so the admin shell can still render a setup hint.
 */
export async function getCurrentUser() {
  if (!trySupabaseEnv()) return null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}
