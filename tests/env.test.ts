import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { supabaseEnv, trySupabaseEnv } from '@/lib/supabase/env'

const URL_KEY = 'NEXT_PUBLIC_SUPABASE_URL'
const KEY_KEY = 'NEXT_PUBLIC_SUPABASE_ANON_KEY'

beforeEach(() => {
  delete process.env[URL_KEY]
  delete process.env[KEY_KEY]
})

afterEach(() => {
  delete process.env[URL_KEY]
  delete process.env[KEY_KEY]
})

describe('trySupabaseEnv', () => {
  it('returns null when neither variable is set', () => {
    expect(trySupabaseEnv()).toBeNull()
  })

  it('returns null when only the url is set', () => {
    process.env[URL_KEY] = 'https://example.supabase.co'
    expect(trySupabaseEnv()).toBeNull()
  })

  it('returns null when only the anon key is set', () => {
    process.env[KEY_KEY] = 'anon-key'
    expect(trySupabaseEnv()).toBeNull()
  })

  it('returns null for an empty-string value, not a half-configured client', () => {
    process.env[URL_KEY] = ''
    process.env[KEY_KEY] = 'anon-key'
    expect(trySupabaseEnv()).toBeNull()
  })

  it('returns both values once configured', () => {
    process.env[URL_KEY] = 'https://example.supabase.co'
    process.env[KEY_KEY] = 'anon-key'

    expect(trySupabaseEnv()).toEqual({
      url: 'https://example.supabase.co',
      anonKey: 'anon-key',
    })
  })
})

describe('supabaseEnv', () => {
  it('passes through the configured values', () => {
    process.env[URL_KEY] = 'https://example.supabase.co'
    process.env[KEY_KEY] = 'anon-key'

    expect(supabaseEnv()).toEqual({
      url: 'https://example.supabase.co',
      anonKey: 'anon-key',
    })
  })

  it('throws a message naming the variables to set', () => {
    expect(() => supabaseEnv()).toThrow(/NEXT_PUBLIC_SUPABASE_URL/)
    expect(() => supabaseEnv()).toThrow(/NEXT_PUBLIC_SUPABASE_ANON_KEY/)
  })
})
