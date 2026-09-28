'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  createProject,
  deleteProject,
  setPublished,
  updateProject,
  type ProjectInput,
} from '@/lib/projects.server'

export type ActionResult = { ok: true } | { ok: false; error: string }

/** Public pages are statically rendered, so writes must invalidate them. */
function revalidatePublicPages() {
  revalidatePath('/')
  revalidatePath('/projects')
  revalidatePath('/admin')
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function signInAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { ok: false, error: 'Email and password are both required.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Deliberately vague — don't reveal whether the account exists.
    return { ok: false, error: 'Invalid email or password.' }
  }

  // Only ever bounce back to an in-app path, never an attacker-supplied origin.
  const next = String(formData.get('next') ?? '')
  const destination = next.startsWith('/admin') ? next : '/admin'

  // Outside the try/catch above: redirect() works by throwing.
  redirect(destination)
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export async function saveProjectAction(
  input: ProjectInput & { id?: string }
): Promise<ActionResult> {
  const { id, ...values } = input
  let error: string | null = null

  try {
    if (id) {
      await updateProject(id, values)
    } else {
      await createProject(values)
    }
  } catch (cause) {
    error = cause instanceof Error ? cause.message : 'Could not save the project.'
  }

  if (error) return { ok: false, error }

  revalidatePublicPages()
  redirect('/admin')
}

export async function deleteProjectAction(id: string): Promise<ActionResult> {
  try {
    await deleteProject(id)
  } catch (cause) {
    return {
      ok: false,
      error: cause instanceof Error ? cause.message : 'Could not delete the project.',
    }
  }

  revalidatePublicPages()
  return { ok: true }
}

export async function togglePublishedAction(
  id: string,
  published: boolean
): Promise<ActionResult> {
  try {
    await setPublished(id, published)
  } catch (cause) {
    return {
      ok: false,
      error: cause instanceof Error ? cause.message : 'Could not update the project.',
    }
  }

  revalidatePublicPages()
  return { ok: true }
}
