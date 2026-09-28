'use client'

import Image from 'next/image'
import AvatarImage from '../public/logo.png'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-line py-10 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <Image src={AvatarImage} alt="Osim Uka" width={28} height={28} className="rounded-full border border-line" />
          <span className="font-black text-sm tracking-tight text-fg uppercase">BuildWithOsim</span>
        </div>

        <p className="text-muted text-xs font-medium tracking-wide">
          © {year} Osim Uka. All rights reserved.
        </p>

        <div className="flex gap-6">
          <a href="https://github.com/joshosim" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-fg transition-colors text-xs font-semibold uppercase tracking-widest">GitHub</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-fg transition-colors text-xs font-semibold uppercase tracking-widest">LinkedIn</a>
          <a href="#contact" className="text-muted hover:text-fg transition-colors text-xs font-semibold uppercase tracking-widest">Contact</a>
        </div>
      </div>
    </footer>
  )
}
