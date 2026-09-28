import { notFound } from 'next/navigation'
import ProjectForm from '@/components/admin/ProjectForm'
import { getProject, type Project } from '@/lib/projects'

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let project: Project | null = null
  let error: string | null = null

  try {
    project = await getProject(id)
  } catch (cause) {
    error = cause instanceof Error ? cause.message : 'Could not load the project.'
  }

  if (error) {
    return (
      <div className="surface-subtle mx-auto max-w-3xl rounded-2xl p-8">
        <h1 className="mb-3 font-bold text-fg">Could not load this project</h1>
        <p className="text-sm font-light text-muted">{error}</p>
      </div>
    )
  }

  if (!project) notFound()

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10">
        <h1 className="font-instrument text-4xl font-bold text-fg">
          Edit <span className="italic text-accent">{project.title}</span>
        </h1>
      </div>

      <ProjectForm project={project} />
    </div>
  )
}
