import type { Metadata } from 'next'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/supabase/server'
import { signOutAction } from './actions'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="font-bold tracking-tight">BUILDWITHOSIM</span>
            <span className="rounded-full border border-accent/40 px-2 py-0.5 text-[10px] uppercase tracking-widest text-accent">
              Admin
            </span>
          </Link>

          <div className="flex items-center gap-5 text-sm">
            <Link href="/" className="text-muted transition-colors hover:text-fg">
              View site
            </Link>
            {user && (
              <form action={signOutAction}>
                <button type="submit" className="text-muted transition-colors hover:text-fg">
                  Sign out
                </button>
              </form>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">{children}</main>
    </div>
  )
}
