import LoginForm from './LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const params = await searchParams
  const next = typeof params.next === 'string' ? params.next : '/admin'

  return (
    <div className="mx-auto max-w-md py-12">
      <div className="mb-10 text-center">
        <h1 className="font-instrument text-4xl font-bold text-fg">
          Admin <span className="italic text-accent">Sign in</span>
        </h1>
        <p className="mt-3 text-sm font-light text-muted">
          Restricted area — authorised access only.
        </p>
      </div>

      <LoginForm next={next} />
    </div>
  )
}
