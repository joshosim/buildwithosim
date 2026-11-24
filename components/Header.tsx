'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

const NAV_LINKS = [
  { href: '#projects', label: 'Work' },
  { href: '#services', label: 'Services' },
  { href: '#about', label: 'About' },
  { href: '/music', label: 'Music' },
  { href: '#contact', label: 'Contact' },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const sectionHref = (href: string) =>
    href.startsWith('#') && pathname !== '/' ? `/${href}` : href


  const sendMessage = () => {
    const phoneNumber = '+2347066530998'
    const message = 'Hello Osim, I would like to work with you.'
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')?.focus()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-md px-6">
      <div className="max-w-6xl mx-auto h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="text-muted hover:text-fg md:hidden"
            onClick={() => setIsOpen((o) => !o)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link href="/" className="text-lg font-semibold tracking-tight text-fg">
            BuildWithOsim
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const href = sectionHref(link.href)
            const isMusicPage = link.href === '/music' && pathname === '/music'

            return (
              <Link
                key={link.href}
                href={href}
                aria-current={isMusicPage ? 'page' : undefined}
                className={`text-sm font-medium transition-colors ${
                  isMusicPage ? 'text-fg' : 'text-muted hover:text-fg'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="border border-line rounded-full p-2 text-muted hover:text-fg hover:border-line-strong transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button
            onClick={sendMessage}
            className="btn-primary hidden md:block px-5 py-2 text-sm rounded-full"
          >
            Let&apos;s Talk
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="border-t border-line bg-bg md:hidden">
          <nav className="max-w-6xl mx-auto py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const href = sectionHref(link.href)
              const isMusicPage = link.href === '/music' && pathname === '/music'

              return (
                <Link
                  key={link.href}
                  href={href}
                  aria-current={isMusicPage ? 'page' : undefined}
                  className={`py-3 text-base font-medium transition-colors border-b border-line last:border-b-0 ${
                    isMusicPage ? 'text-fg' : 'text-muted hover:text-fg'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              )
            })}
            <button
              onClick={() => { setIsOpen(false); sendMessage() }}
              className="btn-primary mt-4 py-3 text-base rounded-full"
            >
              Let&apos;s Talk
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
