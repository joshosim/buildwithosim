const MISSING_ENV_MESSAGE =
  'Missing Supabase environment variables. Copy .env.example to .env.local ' +
  'and set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'

/**
 * Fails loudly and usefully when Supabase env vars are missing, rather than
 * letting `undefined` reach the client constructor and surface as an opaque
 * "Invalid URL" error at request time.
 */
export function supabaseEnv() {
  const env = trySupabaseEnv()
  if (!env) throw new Error(MISSING_ENV_MESSAGE)
  return env
}

/**
 * Non-throwing variant for middleware, which runs on every matched route — a
 * missing .env should leave the public site working rather than 500 it.
 */
export function trySupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null
  return { url, anonKey }
}
