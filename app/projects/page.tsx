import type { Metadata } from 'next'
import ProjectsBrowser from './ProjectsBrowser'
import { getProjects, type Project } from '@/lib/projects'

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Web, mobile and digital product work by Osim Uka — built with React, Next.js, TypeScript and React Native.',
}

export default async function Projects() {
  let projects: Project[] = []
  let error: string | null = null

  try {
    projects = await getProjects()
  } catch {
    error = 'Projects could not be loaded right now. Please try again shortly.'
  }

  return (
    <div className="min-h-screen bg-bg text-fg">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="reveal mb-16 max-w-xl">
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted">
            My Work Portfolio
          </p>
          <h1 className="mb-4 font-instrument text-4xl font-bold text-fg md:text-5xl">
            Projects <span className="italic text-accent">Showcase</span>
          </h1>
          <p className="font-light text-muted">
            Exploring my collection of web, mobile, and digital solutions
          </p>
        </div>

        <ProjectsBrowser projects={projects} error={error} />
      </div>
    </div>
  )
}
