'use client'

import Image from 'next/image'
import { Facebook, Github, Instagram, Linkedin, Twitter } from 'lucide-react'
import AvatarImage from '../public/logo.png'

export default function Footer() {
  return (
    <footer className="text-center py-12 px-6 border-t border-gray-800">
      <Image
        src={AvatarImage}
        alt="Osim Uka"
        width={175}
        height={175}
        className="mx-auto rounded-lg object-cover"
      />

      <div className="flex items-center justify-center gap-6 mb-6">
        <Facebook
          size={30}
          className="text-gray-500 dark:text-gray-400 cursor-pointer hover:text-[#fdbe21] transition-colors"
          onClick={() => window.open("https://www.facebook.com/uka.osim.56", "_blank")}
        />
        <Linkedin
          size={30}
          className="text-gray-500 dark:text-gray-400 cursor-pointer hover:text-[#fdbe21] transition-colors"
          onClick={() => window.open("https://www.linkedin.com/in/uka-osim-9761601a0/", "_blank")}
        />
        <Instagram
          size={30}
          className="text-gray-500 dark:text-gray-400 cursor-pointer hover:text-[#fdbe21] transition-colors"
          onClick={() => window.open("https://www.instagram.com/ukaosim/", "_blank")}
        />
        <Twitter
          size={30}
          className="text-gray-500 dark:text-gray-400 cursor-pointer hover:text-[#fdbe21] transition-colors"
          onClick={() => window.open("https://x.com/teamjojo_code", "_blank")}
        />
        <Github
          size={30}
          className="text-gray-500 dark:text-gray-400 cursor-pointer hover:text-[#fdbe21] transition-colors"
          onClick={() => window.open("https://github.com/joshosim", "_blank")}
        />
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} BUILDWITHOSIM. All rights reserved.
      </p>
    </footer>
  )
}