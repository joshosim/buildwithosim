import ProjectForm from '@/components/admin/ProjectForm'

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10">
        <h1 className="font-instrument text-4xl font-bold text-fg">
          New <span className="italic text-accent">project</span>
        </h1>
        <p className="mt-2 text-sm font-light text-muted">
          Saves straight to the database and shows up on the public site right away.
        </p>
      </div>

      <ProjectForm />
    </div>
  )
}
