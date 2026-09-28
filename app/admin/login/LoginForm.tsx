'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import { signInAction, type ActionResult } from '../actions'

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    signInAction,
    null
  )

  return (
    <form action={formAction} className="surface-subtle rounded-2xl p-8 space-y-6">
      <input type="hidden" name="next" value={next} />

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-xs uppercase tracking-widest text-muted"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-sm text-fg placeholder:text-muted transition-colors focus:border-accent focus:outline-none"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-xs uppercase tracking-widest text-muted"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-sm text-fg placeholder:text-muted transition-colors focus:border-accent focus:outline-none"
          placeholder="••••••••"
        />
      </div>

      {state && !state.ok && (
        <p role="alert" className="text-sm text-red-500">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full py-3 text-xs uppercase tracking-widest disabled:opacity-60"
      >
        {isPending && <Loader2 size={14} className="animate-spin" />}
        {isPending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
