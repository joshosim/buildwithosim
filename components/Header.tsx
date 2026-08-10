'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Search, DollarSign, Plus, Moon, Sun } from 'lucide-react'
import AvatarImage from '../public/logo.png'
import { useTheme } from '@/contexts/ThemeContext'
import { usePathname } from 'next/navigation'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const sendMessage = () => {
    const phoneNumber = "+2347066530998"
    const message = "Hello Osim Uka, I would like to support you. Please Send your Account Details."
    const urlEncodedMessage = encodeURIComponent(message)
    const finalUrl = "https://wa.me/" + phoneNumber + "?text=" + urlEncodedMessage
    window.open(finalUrl, '_blank')?.focus()
  }

  const pathname = usePathname();

  useEffect(() => {

  }, []);

  return (
    <header className="bg-gray-900/80 backdrop-blur-xs border-b border-gray-800 sticky top-0 z-50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden cursor-pointer text-gray-300"
              onClick={toggleMenu}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Image
              src={AvatarImage}
              alt="Osim Uka"
              width={50}
              height={50}
              className="rounded-full"
            />

            <Link href="/" className="cursor-pointer font-bold">
              <span className="block md:hidden">BWO</span>
              <span className="hidden md:block">BUILDWITHOSIM</span>
            </Link>
          </div>
        </div>
        <div className='flex items-center gap-6'>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/projects"
              className={`${!pathname.startsWith("/projects") ? "text-gray-300" : "text-blue-500"}
               hover:text-blue-500 font-medium transition-colors`}>
              Projects
            </Link>
            <Link href="/blog"
              className={`${!pathname.startsWith("/blog") ? "text-gray-300" : "text-blue-500"}
             hover:text-blue-500 font-medium transition-colors`}>
              Blog
            </Link>
            {pathname.startsWith("/blog") || pathname.startsWith("/projects") || pathname.startsWith("/admin") ? <></> :
              <Link href="#about" className="text-gray-300 hover:text-blue-500 font-medium transition-colors">
                About
              </Link>}
            {pathname.startsWith("/blog") || pathname.startsWith("/projects") || pathname.startsWith("/admin") ? <></> :
              <a href="#contact" className="btn-primary px-6 py-2 rounded-full text-sm font-medium">Let's Talk</a>}
          </nav>

        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-800 mt-4 rounded-lg">
          <nav className="flex flex-col">
            <Link
              href="/"
              className={`${!pathname.startsWith("/") ? "text-gray-300" : "text-blue-500"}
                py-3 px-4 border-b border-gray-700 hover:bg-gray-700 transition-colors`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/projects"
              className={`${!pathname.startsWith("/projects") ? "text-gray-300" : "text-blue-500"}
                py-3 px-4 border-b border-gray-700 hover:bg-gray-700 transition-colors`}
              onClick={() => setIsOpen(false)}
            >
              Projects
            </Link>
            <Link
              href="/blog"
              className={`${!pathname.startsWith("/blog") ? "text-gray-300" : "text-blue-500"}
                py-3 px-4 border-b border-gray-700 hover:bg-gray-700 transition-colors`}
              onClick={() => setIsOpen(false)}
            >
              Blog
            </Link>
            {pathname.startsWith("/blog") || pathname.startsWith("/projects") || pathname.startsWith("/admin") ? <></> :
              <Link
                href="#about"
                className="py-3 px-4 border-b border-gray-700 hover:bg-gray-700 text-gray-300 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>}
            {pathname.startsWith("/blog") || pathname.startsWith("/projects") || pathname.startsWith("/admin") ? <></> :
              <a href="#contact" className="btn-primary flex px-6 py-2 m-2 justify-center items-center rounded-full text-sm font-medium">Let's Talk</a>
            }
          </nav>
        </div>
      )}
    </header>
  )
}