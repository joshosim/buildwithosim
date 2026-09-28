import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  getUser: vi.fn(),
}))

vi.mock('@supabase/ssr', () => ({ createServerClient: mocks.createServerClient }))

const { updateSession, ADMIN_LOGIN_PATH } = await import('@/lib/supabase/middleware')

const URL_KEY = 'NEXT_PUBLIC_SUPABASE_URL'
const KEY_KEY = 'NEXT_PUBLIC_SUPABASE_ANON_KEY'

const SIGNED_IN = { id: 'user-1', email: 'osim@example.com' }

function request(path: string) {
  return new NextRequest(new URL(path, 'http://localhost'))
}

/** Location header of a redirect response, as a parsed URL. */
function locationOf(response: Response) {
  const location = response.headers.get('location')
  expect(location).toBeTruthy()
  return new URL(location!)
}

/** The shape `updateSession` passes to `createServerClient`. */
interface CookieToSet {
  name: string
  value: string
  options?: Record<string, unknown>
}
interface ServerClientOptions {
  cookies: { setAll(cookies: CookieToSet[]): void }
}

function configureSupabase(user: unknown, { throws = false } = {}) {
  process.env[URL_KEY] = 'https://example.supabase.co'
  process.env[KEY_KEY] = 'anon-key'

  mocks.getUser.mockImplementation(async () => {
    if (throws) throw new Error('supabase unreachable')
    return { data: { user } }
  })
  mocks.createServerClient.mockReturnValue({ auth: { getUser: mocks.getUser } })
}

/** Simulates Supabase rotating the session cookies during a refresh. */
function refreshCookies(cookies: CookieToSet[]) {
  mocks.createServerClient.mockImplementation(
    (_url: string, _key: string, options: ServerClientOptions) => {
      options.cookies.setAll(cookies)
      return { auth: { getUser: mocks.getUser } }
    }
  )
}

beforeEach(() => {
  mocks.createServerClient.mockReset()
  mocks.getUser.mockReset()
  delete process.env[URL_KEY]
  delete process.env[KEY_KEY]
})

afterEach(() => {
  delete process.env[URL_KEY]
  delete process.env[KEY_KEY]
})

describe('updateSession without Supabase configured', () => {
  it('leaves public pages alone rather than 500-ing the site', async () => {
    const response = await updateSession(request('/projects'))

    expect(response.headers.get('location')).toBeNull()
    expect(response.status).toBe(200)
  })

  it('fails closed on /admin, redirecting to the login page', async () => {
    const response = await updateSession(request('/admin'))

    expect(response.status).toBe(307)
    expect(locationOf(response).pathname).toBe(ADMIN_LOGIN_PATH)
  })

  it('does not redirect the login page to itself', async () => {
    const response = await updateSession(request(ADMIN_LOGIN_PATH))

    expect(response.headers.get('location')).toBeNull()
  })
})

describe('updateSession guarding /admin', () => {
  beforeEach(() => {
    configureSupabase(null)
  })

  it('redirects a signed-out visitor to the login page', async () => {
    const response = await updateSession(request('/admin'))

    expect(response.status).toBe(307)
    expect(locationOf(response).pathname).toBe(ADMIN_LOGIN_PATH)
  })

  it('remembers where the visitor was heading', async () => {
    const response = await updateSession(request('/admin/projects/new'))

    expect(locationOf(response).searchParams.get('next')).toBe('/admin/projects/new')
  })

  it('guards nested admin routes, not just /admin itself', async () => {
    const response = await updateSession(request('/admin/projects/abc/edit'))

    expect(locationOf(response).pathname).toBe(ADMIN_LOGIN_PATH)
  })

  it('leaves public pages reachable', async () => {
    const response = await updateSession(request('/projects'))

    expect(response.headers.get('location')).toBeNull()
  })

  it('stays fail-closed when Supabase is unreachable', async () => {
    configureSupabase(null, { throws: true })

    const response = await updateSession(request('/admin'))

    expect(response.status).toBe(307)
    expect(locationOf(response).pathname).toBe(ADMIN_LOGIN_PATH)
  })

  it('still serves public pages when Supabase is unreachable', async () => {
    configureSupabase(null, { throws: true })

    const response = await updateSession(request('/'))

    expect(response.headers.get('location')).toBeNull()
  })
})

describe('updateSession for a signed-in admin', () => {
  beforeEach(() => {
    configureSupabase(SIGNED_IN)
  })

  it('lets the admin through', async () => {
    const response = await updateSession(request('/admin'))

    expect(response.headers.get('location')).toBeNull()
    expect(response.status).toBe(200)
  })

  it('sends a signed-in visitor away from the login page', async () => {
    const response = await updateSession(request(ADMIN_LOGIN_PATH))

    expect(response.status).toBe(307)
    expect(locationOf(response).pathname).toBe('/admin')
  })
})

describe('updateSession session refresh', () => {
  it('copies refreshed cookies onto a redirect instead of dropping the new session', async () => {
    configureSupabase(null)
    refreshCookies([{ name: 'sb-refresh-token', value: 'rotated', options: { path: '/' } }])

    const response = await updateSession(request('/admin'))

    expect(response.cookies.get('sb-refresh-token')?.value).toBe('rotated')
  })

  it('carries refreshed cookies on a normal pass-through too', async () => {
    configureSupabase(SIGNED_IN)
    refreshCookies([{ name: 'sb-access-token', value: 'fresh', options: { path: '/' } }])

    const response = await updateSession(request('/projects'))

    expect(response.cookies.get('sb-access-token')?.value).toBe('fresh')
  })
})
