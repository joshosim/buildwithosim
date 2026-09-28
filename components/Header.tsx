'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

const NAV_LINKS = [
  { href: '#services', label: 'Services' },
  { href: '#projects', label: 'Projects' },
  { href: '#about', label: 'About' },
  { href: '#testimonials', label: 'Testimonials' },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const logoSrc = theme === 'dark' ? '/BUILDWITHOSIM_LOGO_DARK.svg' : '/BUILDWITHOSIM_LOGO_LIGHT.svg'

  const sendMessage = () => {
    const phoneNumber = '+2347066530998'
    const message = 'Hello Osim, I would like to work with you.'
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')?.focus()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="text-muted hover:text-fg md:hidden"
            onClick={() => setIsOpen((o) => !o)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link href="/">
            <Image
              src={logoSrc}
              alt="BuildWithOsim"
              width={140}
              height={36}
              className="h-45 w-auto object-contain -m-8 md:-m-10 lg:-m-12 "
              priority
            />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-semibold uppercase tracking-widest text-muted hover:text-fg transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="border border-line p-2 text-muted hover:text-fg hover:border-line-strong transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button
            onClick={sendMessage}
            className="btn-primary hidden md:block px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-sm"
          >
            Let's Talk
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="border-t border-line bg-bg md:hidden">
          <nav className="max-w-5xl mx-auto px-6 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="py-3 text-xs font-semibold uppercase tracking-widest text-muted hover:text-fg transition-colors border-b border-line last:border-b-0"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => { setIsOpen(false); sendMessage() }}
              className="btn-primary mt-4 py-3 text-xs font-bold uppercase tracking-widest rounded-sm"
            >
              Let's Talk
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
