'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, Pencil, Trash2 } from 'lucide-react'
import { deleteProjectAction, togglePublishedAction } from '@/app/admin/actions'

interface Props {
  id: string
  title: string
  published: boolean
}

export default function ProjectRowActions({ id, title, published }: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleToggle() {
    setError(null)
    startTransition(async () => {
      const result = await togglePublishedAction(id, !published)
      if (!result.ok) setError(result.error)
    })
  }

  function handleDelete() {
    // Destructive and not undoable — confirm first.
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return

    setError(null)
    startTransition(async () => {
      const result = await deleteProjectAction(id)
      if (!result.ok) setError(result.error)
    })
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {error && <span className="text-xs text-red-500 mr-2">{error}</span>}

      <button
        type="button"
        onClick={handleToggle}
        disabled={pending}
        title={published ? 'Unpublish' : 'Publish'}
        className="p-2 rounded-lg border border-line text-muted hover:text-fg hover:border-accent transition-colors disabled:opacity-50"
      >
        {published ? <Eye size={14} /> : <EyeOff size={14} />}
      </button>

      <Link
        href={`/admin/projects/${id}/edit`}
        title="Edit"
        className="p-2 rounded-lg border border-line text-muted hover:text-fg hover:border-accent transition-colors"
      >
        <Pencil size={14} />
      </Link>

      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        title="Delete"
        className="p-2 rounded-lg border border-line text-muted hover:text-red-500 hover:border-red-500 transition-colors disabled:opacity-50"
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
      </button>
    </div>
  )
}
