'use client'

import Image from 'next/image'
import AvatarImage from '../public/logo.png'

export default function Footer() {

  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 px-6 border-t border-gray-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <Image
          src={AvatarImage}
          alt="Osim Uka"
          width={175}
          height={175}
          className="rounded-lg object-cover"
        />
        <p className="text-gray-500 text-sm">© {currentYear} Osim Uka. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">Privacy</a>
          <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">Terms</a>
        </div>
      </div>
    </footer>
  )
}