'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

/**
 * Renders the public site chrome around every page except the admin area.
 *
 * A route group with its own layout would be the tidier way to do this, but
 * that requires moving the existing page files. Keeping the decision in one
 * place is a large improvement on what was here before, where `Header` carried
 * four separate `/admin` pathname checks scattered through its nav.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname.startsWith('/admin')) return <>{children}</>

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}
