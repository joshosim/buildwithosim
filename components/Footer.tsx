'use client'

import Image from 'next/image'
import AvatarImage from '../public/CEO.jpg'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-line py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <Image src={AvatarImage} alt="Osim Uka" width={28} height={28} className="object-contain rounded-full border border-line" />
          <span className="font-semibold text-sm tracking-tight text-fg">BuildWithOsim</span>
        </div>

        <p className="text-muted text-sm">
          © {year} Osim Uka. All rights reserved.
        </p>

        <div className="flex gap-6">
          <a href="https://github.com/joshosim" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-fg transition-colors text-sm font-medium">GitHub</a>
          <a href="https://www.linkedin.com/in/uka-osim-9761601a0/" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-fg transition-colors text-sm font-medium">LinkedIn</a>
          <a href="#contact" className="text-muted hover:text-fg transition-colors text-sm font-medium">Contact</a>
        </div>
      </div>
    </footer>
  )
}
