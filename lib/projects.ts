import { publicClient } from './supabase/public'
import { createClient } from './supabase/server'

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
  const featured = projects.filter((project) => project.featured)
  if (featured.length >= limit) return featured.slice(0, limit)

  const rest = projects.filter((project) => !project.featured)
  return [...featured, ...rest].slice(0, limit)
}

// ---------------------------------------------------------------------------
// Admin access — cookie-bound client, so RLS lets the signed-in admin see
// unpublished rows too
// ---------------------------------------------------------------------------

/** Throws unless there is a signed-in user. RLS enforces this too; this just
 *  turns a silent no-op write into a clear error. */
async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) fail('save changes', 'you are not signed in')
  return supabase
}

export async function getAdminProjects(): Promise<Project[]> {
  const supabase = await requireUser()
  const { data, error } = await supabase
    .from('projects')
    .select(COLUMNS)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) fail('load projects', error.message)
  return (data ?? []) as Project[]
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = await requireUser()
  const { data, error } = await supabase
    .from('projects')
    .select(COLUMNS)
    .eq('id', id)
    .maybeSingle()

  if (error) fail('load project', error.message)
  return (data as Project | null) ?? null
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const supabase = await requireUser()
  const { data, error } = await supabase
    .from('projects')
    .insert(input)
    .select(COLUMNS)
    .single()

  if (error) fail('create project', error.message)
  return data as Project
}

export async function updateProject(id: string, input: ProjectInput): Promise<Project> {
  const supabase = await requireUser()
  const { data, error } = await supabase
    .from('projects')
    .update(input)
    .eq('id', id)
    .select(COLUMNS)
    .single()

  if (error) fail('update project', error.message)
  return data as Project
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = await requireUser()
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) fail('delete project', error.message)
}

export async function setPublished(id: string, published: boolean): Promise<void> {
  const supabase = await requireUser()
  const { error } = await supabase.from('projects').update({ published }).eq('id', id)
  if (error) fail('update project', error.message)
}
