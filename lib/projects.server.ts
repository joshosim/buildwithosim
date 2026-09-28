/**
 * Server-only project helpers — uses the cookie-bound Supabase client.
 * Never import this from a 'use client' component.
 */
import { createClient } from './supabase/server'
import type { Project, ProjectInput } from './projects'

export type { Project, ProjectInput }

const COLUMNS =
  'id,title,description,link,repo_url,image_url,tools,role,type,featured,published,sort_order,created_at,updated_at'

function fail(action: string, message: string): never {
  throw new Error(`Failed to ${action}: ${message}`)
}

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
