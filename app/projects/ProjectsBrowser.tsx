'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Search } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'
import { resolveImage, type Project } from '@/lib/projects'

interface Props {
  projects: Project[]
  error: string | null
}

export default function ProjectsBrowser({ projects, error }: Props) {
  const [searchValue, setSearchValue] = useState('')

  // Re-scan on every keystroke: cards rendered by a new search would otherwise
  // never be observed and would stay at `opacity: 0` — invisible.
  useReveal([searchValue, projects])

  const filteredProjects = useMemo(() => {
    const search = searchValue.trim().toLowerCase()
    if (!search) return projects

    return projects.filter((project) => {
      const title = project.title.toLowerCase()
      const tools = Array.isArray(project.tools) ? project.tools : []
      return (
        title.includes(search) ||
        tools.some((tool) => tool.toLowerCase().includes(search))
      )
    })
  }, [projects, searchValue])

  const stats = [
    { value: projects.length, label: 'Total Projects' },
    { value: '3+', label: 'Years Experience' },
    { value: '15+', label: 'Tech Stacks' },
    { value: '100%', label: 'Client Satisfaction' },
  ]

  return (
    <div className="grid gap-12">
      {/* Stats */}
      <div className="reveal grid gap-6 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="surface-subtle rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-fg md:text-4xl">{stat.value}</div>
            <p className="mt-2 text-xs uppercase tracking-tighter text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative md:max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          size={18}
          aria-hidden
        />
        <input
          type="search"
          placeholder="Search projects…"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          aria-label="Search projects"
          className="w-full rounded-xl border border-subtle bg-surface py-3 pl-10 pr-4 text-fg placeholder:text-muted transition-all duration-300 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Grid */}
      {error ? (
        <p className="reveal py-24 text-center font-light text-muted">{error}</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                className="project-card surface-subtle reveal overflow-hidden rounded-2xl"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={resolveImage(project.image_url)}
                    alt={project.title}
                    width={400}
                    height={200}
                    className="h-full w-full object-cover opacity-90 transition-transform duration-500 hover:scale-105"
                  />
                  {project.role && (
                    <div className="absolute left-4 top-4">
                      {/* Stays white in both themes — it sits on a dark scrim. */}
                      <span className="w-fit rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-white backdrop-blur">
                        {project.role}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-grow flex-col p-8">
                  <h3 className="mb-3 font-instrument text-xl font-bold text-fg">
                    {project.title}
                  </h3>
                  <p className="mb-6 line-clamp-3 flex-grow text-sm font-light leading-relaxed text-muted">
                    {project.description}
                  </p>

                  <div className="mb-8 flex flex-wrap gap-2">
                    {project.tools.map((item) => (
                      <span
                        key={item}
                        className="rounded border border-subtle bg-surface px-2 py-1 text-[10px] uppercase tracking-wider text-muted"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  {(project.link || project.repo_url) && (
                    <div className="flex gap-6 border-t border-subtle pt-4">
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-accent transition-colors hover:text-accent-hover"
                        >
                          View Project
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                      {project.repo_url && (
                        <a
                          href={project.repo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted transition-colors hover:text-fg"
                        >
                          GitHub
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="reveal col-span-full py-24 text-center">
              <p className="text-lg font-light text-muted">
                {projects.length === 0
                  ? 'No projects published yet.'
                  : 'No projects found matching your search.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
