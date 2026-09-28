'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Loader2, Plus, Upload, X } from 'lucide-react'
import { saveProjectAction } from '@/app/admin/actions'
import { createClient } from '@/lib/supabase/client'
import { resolveImage, type Project, type ProjectInput } from '@/lib/projects'

const EMPTY: ProjectInput = {
  title: '',
  description: '',
  link: null,
  repo_url: null,
  image_url: null,
  tools: [],
  role: null,
  type: null,
  featured: false,
  published: true,
  sort_order: 0,
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const inputClass =
  'w-full bg-surface border border-line text-fg rounded-lg px-4 py-3 text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors'

const labelClass = 'block text-xs uppercase tracking-widest text-muted mb-2'

/** Form controls hand back empty strings; the database wants nulls. */
function orNull(value: string) {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export default function ProjectForm({ project }: { project?: Project }) {
  const [values, setValues] = useState<ProjectInput>(project ?? EMPTY)
  const [tags, setTags] = useState<string[]>(project?.tools ?? [])
  const [tagDraft, setTagDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) =>
    setValues((previous) => ({ ...previous, [key]: value }))

  const addTag = () => {
    const tag = tagDraft.trim()
    if (!tag || tags.includes(tag)) {
      setTagDraft('')
      return
    }
    setTags([...tags, tag])
    setTagDraft('')
  }

  async function handleUpload(file: File) {
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Image must be 5 MB or smaller.')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const extension = file.name.split('.').pop()?.toLowerCase() ?? 'png'
      // Random name so two uploads of "screenshot.png" never collide.
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('project-images').getPublicUrl(path)
      set('image_url', data.publicUrl)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Upload failed.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (!values.title.trim() || !values.description.trim()) {
      setError('Title and description are required.')
      return
    }

    setSaving(true)
    // A successful save redirects server-side, so we only land here on failure.
    const result = await saveProjectAction({ ...values, tools: tags, id: project?.id })
    if (result && !result.ok) setError(result.error)
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="title">
            Title
          </label>
          <input
            id="title"
            className={inputClass}
            value={values.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Project name"
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            className={`${inputClass} resize-none`}
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="What the project does and who it's for"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="link">
            Live URL
          </label>
          <input
            id="link"
            className={inputClass}
            value={values.link ?? ''}
            onChange={(e) => set('link', orNull(e.target.value))}
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="repo_url">
            Repository URL
          </label>
          <input
            id="repo_url"
            className={inputClass}
            value={values.repo_url ?? ''}
            onChange={(e) => set('repo_url', orNull(e.target.value))}
            placeholder="https://github.com/…"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="role">
            Role
          </label>
          <input
            id="role"
            className={inputClass}
            value={values.role ?? ''}
            onChange={(e) => set('role', orNull(e.target.value))}
            placeholder="Solo Project (06/2026)"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="type">
            Type
          </label>
          <input
            id="type"
            className={inputClass}
            value={values.type ?? ''}
            onChange={(e) => set('type', orNull(e.target.value))}
            placeholder="Business"
          />
        </div>
      </div>

      {/* Tools */}
      <div>
        <span className={labelClass}>Tools</span>
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-line text-xs text-muted"
            >
              {tag}
              <button
                type="button"
                onClick={() => setTags(tags.filter((t) => t !== tag))}
                className="hover:text-fg transition-colors"
                aria-label={`Remove ${tag}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
          {tags.length === 0 && <span className="text-xs text-muted">No tools added yet.</span>}
        </div>
        <div className="flex gap-3">
          <input
            className={inputClass}
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault()
                addTag()
              }
            }}
            placeholder="Type a tool and press Enter"
          />
          <button
            type="button"
            onClick={addTag}
            className="flex-shrink-0 px-4 rounded-lg border border-line text-muted hover:text-fg hover:border-accent transition-colors"
            aria-label="Add tool"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Image */}
      <div>
        <label className={labelClass} htmlFor="image_url">
          Image
        </label>
        <div className="grid md:grid-cols-[1fr_auto] gap-4 items-start">
          <div className="space-y-3">
            <input
              id="image_url"
              className={inputClass}
              value={values.image_url ?? ''}
              onChange={(e) => set('image_url', orNull(e.target.value))}
              placeholder="Paste an image URL, or upload one →"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-line text-xs uppercase tracking-widest text-muted hover:text-fg hover:border-accent transition-colors disabled:opacity-50"
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploading ? 'Uploading…' : 'Upload image'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handleUpload(file)
                }}
              />
              {values.image_url && (
                <button
                  type="button"
                  onClick={() => set('image_url', null)}
                  className="text-xs uppercase tracking-widest text-muted hover:text-fg transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="relative w-full md:w-48 h-28 rounded-lg overflow-hidden border border-line bg-surface">
            <Image
              src={resolveImage(values.image_url)}
              alt=""
              fill
              sizes="192px"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Flags */}
      <div className="grid md:grid-cols-3 gap-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={values.featured}
            onChange={(e) => set('featured', e.target.checked)}
            className="w-4 h-4 accent-[var(--accent)]"
          />
          <span className="text-sm text-muted">Featured on homepage</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={values.published}
            onChange={(e) => set('published', e.target.checked)}
            className="w-4 h-4 accent-[var(--accent)]"
          />
          <span className="text-sm text-muted">Published</span>
        </label>

        <div>
          <label className={labelClass} htmlFor="sort_order">
            Sort order
          </label>
          <input
            id="sort_order"
            type="number"
            className={inputClass}
            value={values.sort_order}
            onChange={(e) => set('sort_order', Number(e.target.value) || 0)}
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4 pt-4 border-t border-line">
        <button
          type="submit"
          disabled={saving || uploading}
          className="btn-primary px-6 py-3 rounded-full text-xs uppercase tracking-widest disabled:opacity-60 inline-flex items-center gap-2"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? 'Saving…' : project ? 'Save changes' : 'Create project'}
        </button>
        <a
          href="/admin"
          className="text-xs uppercase tracking-widest text-muted hover:text-fg transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
