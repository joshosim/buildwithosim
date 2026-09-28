import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { trySupabaseEnv } from './env'

export const ADMIN_LOGIN_PATH = '/admin/login'

/**
 * Refreshes the Supabase auth session on every request and guards `/admin`.
 *
 * Two things here are easy to get wrong and worth preserving:
 *  - `getUser()` (not `getSession()`) revalidates the token against Supabase.
 *    `getSession()` only reads the cookie, which a client could forge.
 *  - Cookies refreshed during this call must be copied onto any redirect we
 *    return, otherwise the new session is dropped.
 */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoginPage = pathname === ADMIN_LOGIN_PATH
  const isAdminRoute = pathname.startsWith('/admin')

  const env = trySupabaseEnv()

  // Supabase not configured yet: keep the public site up, and fail closed on
  // admin by sending the visitor to the login page.
  if (!env) {
    if (isAdminRoute && !isLoginPage) return redirectTo(request, ADMIN_LOGIN_PATH)
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        // Keep the request in sync so anything downstream sees the new cookies…
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        // …then rebuild the response so they are also sent to the browser.
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Supabase unreachable. Treat as signed out rather than 500-ing every page;
    // the admin guard below is fail-closed.
    user = null
  }

  if (isAdminRoute && !isLoginPage && !user) {
    const redirect = redirectTo(request, ADMIN_LOGIN_PATH, { next: pathname })
    carryCookies(response, redirect)
    return redirect
  }

  // Already signed in — no reason to show the login form again.
  if (isLoginPage && user) {
    const redirect = redirectTo(request, '/admin')
    carryCookies(response, redirect)
    return redirect
  }

  return response
}

function redirectTo(
  request: NextRequest,
  pathname: string,
  params?: Record<string, string>
) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  url.search = ''
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
  }
  return NextResponse.redirect(url)
}

/** Copies cookies refreshed by Supabase onto a redirect response. */
function carryCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => to.cookies.set(cookie))
}
