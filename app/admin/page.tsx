import Link from 'next/link'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { getAdminProjects, type Project } from '@/lib/projects.server'
import { resolveImage } from '@/lib/projects'
import ProjectRowActions from '@/components/admin/ProjectRowActions'

// Admin data must never be cached.
export const dynamic = 'force-dynamic'

const thClass = 'text-left text-[10px] uppercase tracking-widest text-muted font-medium px-4 py-3'

export default async function AdminPage() {
  let projects: Project[] = []
  let error: string | null = null

  try {
    projects = await getAdminProjects()
  } catch (cause) {
    error = cause instanceof Error ? cause.message : 'Could not load projects.'
  }

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-instrument text-4xl font-bold text-fg">
            Your <span className="italic text-accent">Projects</span>
          </h1>
          <p className="mt-2 text-sm font-light text-muted">
            {projects.length} project{projects.length === 1 ? '' : 's'} · changes appear on the
            public site immediately
          </p>
        </div>

        <Link
          href="/admin/projects/new"
          className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs uppercase tracking-widest"
        >
          <Plus size={14} />
          New project
        </Link>
      </div>

      {error ? (
        <div className="surface-subtle rounded-2xl p-8">
          <h2 className="mb-3 font-bold text-fg">Could not load projects</h2>
          <p className="text-sm font-light text-muted">{error}</p>
          <p className="mt-4 text-sm font-light text-muted">
            If this mentions missing environment variables, copy{' '}
            <code className="rounded bg-surface px-1.5 py-0.5">.env.example</code> to{' '}
            <code className="rounded bg-surface px-1.5 py-0.5">.env.local</code>, fill in your
            Supabase keys, then run{' '}
            <code className="rounded bg-surface px-1.5 py-0.5">supabase/schema.sql</code> in the
            Supabase SQL editor.
          </p>
        </div>
      ) : projects.length === 0 ? (
        <div className="surface-subtle rounded-2xl p-12 text-center">
          <p className="font-light text-muted">
            No projects yet. Create your first one, or run{' '}
            <code className="rounded bg-surface px-1.5 py-0.5">supabase/schema.sql</code> to seed the
            eight that were previously hardcoded.
          </p>
        </div>
      ) : (
        <div className="surface-subtle overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line">
                  <th className={thClass}>Project</th>
                  <th className={`${thClass} hidden md:table-cell`}>Type</th>
                  <th className={`${thClass} hidden sm:table-cell`}>Order</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-line last:border-0 transition-colors hover:bg-surface"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-11 w-16 flex-shrink-0 overflow-hidden rounded-md border border-line bg-surface">
                          <Image
                            src={resolveImage(project.image_url)}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-fg">{project.title}</p>
                          {project.featured && (
                            <span className="text-[10px] uppercase tracking-widest text-accent">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className={`${thClass} hidden md:table-cell normal-case tracking-normal`}>
                      <span className="text-sm text-muted">{project.type ?? '—'}</span>
                    </td>

                    <td className={`${thClass} hidden sm:table-cell normal-case tracking-normal`}>
                      <span className="text-sm text-muted">{project.sort_order}</span>
                    </td>

                    <td className={thClass}>
                      <span
                        className={`inline-block rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-widest ${
                          project.published
                            ? 'border-accent/40 text-accent'
                            : 'border-line text-muted'
                        }`}
                      >
                        {project.published ? 'Live' : 'Draft'}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <ProjectRowActions
                        id={project.id}
                        title={project.title}
                        published={project.published}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
