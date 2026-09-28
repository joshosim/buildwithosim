/**
 * Shared types, utilities, and public (anon) project reads.
 * Safe to import from both Server and Client components.
 *
 * For admin writes and cookie-bound reads, use lib/projects.server.ts instead.
 */
import { publicClient } from './supabase/public'

export interface Project {
  id: string
  title: string
  description: string
  link: string | null
  repo_url: string | null
  image_url: string | null
  tools: string[]
  role: string | null
  type: string | null
  featured: boolean
  published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

/** Everything an admin can set. Ids and timestamps are managed by the database. */
export type ProjectInput = Omit<Project, 'id' | 'created_at' | 'updated_at'>

const COLUMNS =
  'id,title,description,link,repo_url,image_url,tools,role,type,featured,published,sort_order,created_at,updated_at'

/** Shown when a project has no image, so `next/image` never receives null. */
export const PLACEHOLDER_IMAGE = '/logo.png'

export function resolveImage(imageUrl: string | null | undefined) {
  return imageUrl?.trim() || PLACEHOLDER_IMAGE
}

function fail(action: string, message: string): never {
  throw new Error(`Failed to ${action}: ${message}`)
}

// ---------------------------------------------------------------------------
// Public reads — anon key, RLS limits these to published projects
// ---------------------------------------------------------------------------

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await publicClient()
    .from('projects')
    .select(COLUMNS)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) fail('load projects', error.message)
  return (data ?? []) as Project[]
}

/**
 * The homepage cards. Prefers projects flagged `featured`, but tops up with the
 * newest others so the grid is never short.
 */
export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  const projects = await getProjects()
  const featured = projects.filter((p) => p.featured)
  if (featured.length >= limit) return featured.slice(0, limit)
  const rest = projects.filter((p) => !p.featured)
  return [...featured, ...rest].slice(0, limit)
}
