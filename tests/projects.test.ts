import { beforeEach, describe, expect, it, vi } from 'vitest'
import { project, stubClient, type QueryResult } from './helpers'

const mocks = vi.hoisted(() => ({
  publicClient: vi.fn(),
  createClient: vi.fn(),
}))

vi.mock('@/lib/supabase/public', () => ({ publicClient: mocks.publicClient }))
vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.createClient }))

const {
  PLACEHOLDER_IMAGE,
  resolveImage,
  getProjects,
  getFeaturedProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  setPublished,
} = await import('@/lib/projects')

const SIGNED_IN = { id: 'user-1', email: 'osim@example.com' }

/** Points the public (anonymous) client at `result`. */
function publicReturns(result: QueryResult) {
  const client = stubClient(result)
  mocks.publicClient.mockReturnValue(client)
  return client
}

/** Points the cookie-bound admin client at `result` for `user`. */
function adminReturns(result: QueryResult, user: unknown = SIGNED_IN) {
  const client = stubClient(result, user)
  mocks.createClient.mockResolvedValue(client)
  return client
}

beforeEach(() => {
  mocks.publicClient.mockReset()
  mocks.createClient.mockReset()
})

describe('resolveImage', () => {
  it('falls back to the placeholder for null, undefined and blank values', () => {
    expect(resolveImage(null)).toBe(PLACEHOLDER_IMAGE)
    expect(resolveImage(undefined)).toBe(PLACEHOLDER_IMAGE)
    expect(resolveImage('')).toBe(PLACEHOLDER_IMAGE)
    expect(resolveImage('   ')).toBe(PLACEHOLDER_IMAGE)
  })

  it('passes real paths through, trimming stray whitespace', () => {
    expect(resolveImage('/kilobyted.png')).toBe('/kilobyted.png')
    expect(resolveImage('  https://cdn.example.com/a.png  ')).toBe(
      'https://cdn.example.com/a.png'
    )
  })
})

describe('getProjects', () => {
  it('returns the rows the database sent', async () => {
    const rows = [project({ id: 'a' }), project({ id: 'b' })]
    publicReturns({ data: rows, error: null })

    await expect(getProjects()).resolves.toEqual(rows)
  })

  it('returns an empty array when data is null', async () => {
    publicReturns({ data: null, error: null })

    await expect(getProjects()).resolves.toEqual([])
  })

  it('throws with the underlying message when the query fails', async () => {
    publicReturns({ data: null, error: { message: 'permission denied' } })

    await expect(getProjects()).rejects.toThrow('Failed to load projects: permission denied')
  })
})

describe('getFeaturedProjects', () => {
  it('returns only featured projects when there are enough of them', async () => {
    publicReturns({
      data: [
        project({ id: 'f1', featured: true }),
        project({ id: 'f2', featured: true }),
        project({ id: 'f3', featured: true }),
        project({ id: 'f4', featured: true }),
        project({ id: 'other' }),
      ],
      error: null,
    })

    const result = await getFeaturedProjects(3)

    expect(result.map((p) => p.id)).toEqual(['f1', 'f2', 'f3'])
  })

  it('tops up with the next newest projects so the grid is never short', async () => {
    publicReturns({
      data: [
        project({ id: 'f1', featured: true }),
        project({ id: 'n1' }),
        project({ id: 'n2' }),
        project({ id: 'n3' }),
      ],
      error: null,
    })

    const result = await getFeaturedProjects(3)

    expect(result.map((p) => p.id)).toEqual(['f1', 'n1', 'n2'])
  })

  it('falls back to the newest projects when nothing is featured', async () => {
    publicReturns({
      data: [project({ id: 'n1' }), project({ id: 'n2' }), project({ id: 'n3' })],
      error: null,
    })

    await expect(getFeaturedProjects(3)).resolves.toHaveLength(3)
  })

  it('returns everything it has when the table holds fewer rows than the limit', async () => {
    publicReturns({ data: [project({ id: 'only' })], error: null })

    const result = await getFeaturedProjects(3)

    expect(result.map((p) => p.id)).toEqual(['only'])
  })
})

describe('admin access', () => {
  const adminFunctions: Array<[string, () => Promise<unknown>]> = [
    ['getProject', () => getProject('p1')],
    ['createProject', () => createProject(project())],
    ['updateProject', () => updateProject('p1', project())],
    ['deleteProject', () => deleteProject('p1')],
    ['setPublished', () => setPublished('p1', false)],
  ]

  it.each(adminFunctions)('%s refuses to run when nobody is signed in', async (_name, call) => {
    adminReturns({ data: null, error: null }, null)

    await expect(call()).rejects.toThrow('Failed to save changes: you are not signed in')
  })

  it('createProject sends the input and returns the created row', async () => {
    const { id: _id, created_at: _created, updated_at: _updated, ...input } = project({
      title: 'Fresh',
    })
    const created = project({ id: 'new-1', title: 'Fresh' })
    const client = adminReturns({ data: created, error: null })

    await expect(createProject(input)).resolves.toEqual(created)
    expect(client.chain.insert).toHaveBeenCalledWith(input)
  })

  it('updateProject scopes the write to the given id', async () => {
    const input = project({ title: 'Renamed' })
    const client = adminReturns({ data: project({ id: 'p9', title: 'Renamed' }), error: null })

    await updateProject('p9', input)

    expect(client.chain.update).toHaveBeenCalledWith(input)
    expect(client.chain.eq).toHaveBeenCalledWith('id', 'p9')
  })

  it('setPublished only writes the published flag', async () => {
    const client = adminReturns({ data: null, error: null })

    await setPublished('p9', false)

    expect(client.chain.update).toHaveBeenCalledWith({ published: false })
    expect(client.chain.eq).toHaveBeenCalledWith('id', 'p9')
  })

  it('deleteProject scopes the delete to the given id', async () => {
    const client = adminReturns({ data: null, error: null })

    await deleteProject('p9')

    expect(client.chain.delete).toHaveBeenCalled()
    expect(client.chain.eq).toHaveBeenCalledWith('id', 'p9')
  })

  it('getProject returns null rather than throwing for a missing row', async () => {
    adminReturns({ data: null, error: null })

    await expect(getProject('missing')).resolves.toBeNull()
  })

  it('surfaces the database error when a write is rejected', async () => {
    adminReturns({ data: null, error: { message: 'new row violates row-level security' } })

    await expect(deleteProject('p1')).rejects.toThrow(
      'Failed to delete project: new row violates row-level security'
    )
  })
})
