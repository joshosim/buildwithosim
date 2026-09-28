import { vi } from 'vitest'
import type { Project } from '@/lib/projects'

export interface QueryResult {
  data: unknown
  error: unknown
}

/**
 * Stand-in for a Supabase PostgREST builder. Every filter method returns the
 * same object, and the object is thenable, so both `await …select().order()` and
 * `await …select().single()` resolve to the same `{ data, error }`.
 */
export function queryChain(result: QueryResult) {
  const chain: Record<string, unknown> = {}

  for (const method of ['select', 'order', 'eq', 'insert', 'update', 'delete', 'limit']) {
    chain[method] = vi.fn(() => chain)
  }

  chain.single = vi.fn(() => Promise.resolve(result))
  chain.maybeSingle = vi.fn(() => Promise.resolve(result))
  chain.then = (onFulfilled: unknown, onRejected: unknown) =>
    Promise.resolve(result).then(
      onFulfilled as (value: QueryResult) => unknown,
      onRejected as (reason: unknown) => unknown
    )

  return chain
}

/** A Supabase client whose every table query resolves to `result`. */
export function stubClient(result: QueryResult, user: unknown = null) {
  const chain = queryChain(result)
  return {
    chain,
    from: vi.fn(() => chain),
    auth: { getUser: vi.fn(async () => ({ data: { user } })) },
  }
}

/** Builds a project row with sensible defaults; override only what a test needs. */
export function project(overrides: Partial<Project> = {}): Project {
  return {
    id: 'p1',
    title: 'Title',
    description: 'Description',
    link: null,
    repo_url: null,
    image_url: null,
    tools: [],
    role: null,
    type: null,
    featured: false,
    published: true,
    sort_order: 0,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

/** A `Request` carrying `body` as JSON, for exercising route handlers directly. */
export function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}
