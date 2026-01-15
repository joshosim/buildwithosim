'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Search, DollarSign, Plus, Moon, Sun } from 'lucide-react'
import AvatarImage from '../public/avatar.png'
import { useTheme } from '@/contexts/ThemeContext'

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

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xs border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center gap-3 border-r border-gray-200 dark:border-gray-700 pr-4 mr-4 md:border-r-2">
            <button
              className="md:hidden cursor-pointer text-gray-700 dark:text-gray-300"
              onClick={toggleMenu}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Image
              src={AvatarImage}
              alt="Osim Uka"
              width={20}
              height={20}
              className="rounded-full"
            />

            <Link href="/" className="cursor-pointer font-bold text-[#fdbe21]">
              <span className="block md:hidden">BWO</span>
              <span className="hidden md:block">BUILDWITHOSIM</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-[#fdbe21] font-medium transition-colors">
              Home
            </Link>
            <Link href="/projects" className="text-gray-700 dark:text-gray-300 hover:text-[#fdbe21] font-medium transition-colors">
              Projects
            </Link>
            <Link href="/blog" className="text-gray-700 dark:text-gray-300 hover:text-[#fdbe21] font-medium transition-colors">
              Blog
            </Link>
            <Link href="/shop" className="text-gray-700 dark:text-gray-300 hover:text-[#fdbe21] font-medium transition-colors">
              Shop
            </Link>
            <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-[#fdbe21] font-medium transition-colors">
              About
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Search className="hidden md:block text-gray-600 dark:text-gray-400" size={20} />

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={20} className="text-gray-600 dark:text-gray-400" />
            ) : (
              <Moon size={20} className="text-gray-600 dark:text-gray-400" />
            )}
          </button>

          <button
            onClick={sendMessage}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="hidden md:block text-gray-700 dark:text-gray-300">Support</span>
            <DollarSign className="md:hidden text-gray-600 dark:text-gray-400" size={20} />
          </button>

          <Link
            href="/contact"
            className="bg-[#fdbe21] hover:bg-[#ff9a00] text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            Follow
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-50 dark:bg-gray-800 mt-4 rounded-lg">
          <nav className="flex flex-col">
            <Link
              href="/"
              className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/projects"
              className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Projects
            </Link>
            <Link
              href="/blog"
              className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Blog
            </Link>
            <Link
              href="/shop"
              className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Shop
            </Link>
            <Link
              href="/about"
              className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="py-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}