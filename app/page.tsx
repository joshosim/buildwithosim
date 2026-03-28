'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Code, Palette, TrendingUp, Download } from 'lucide-react'
import Avatar from '../public/avatar.png'
import { data } from '../utils/project-data'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // const handleDownload = () => {
  //   const link = document.createElement("a")
  //   link.href = "/MyResume.pdf"
  //   link.download = "osim.uka.resume.pdf"
  //   document.body.appendChild(link)
  //   link.click()
  //   document.body.removeChild(link)
  // }

  const stats = [
    { label: "Years Experience", value: "2+" },
    { label: "Projects Completed", value: "5+" },
    { label: "Real Clients", value: "3+" },
  ]

  const services = [
    {
      icon: Code,
      title: "Web Development",
      desc: "I create modern websites that help businesses attract and convert customers.",
      color: "text-[#fdbe21]"
    },
    {
      icon: Code,
      title: "Mobile Apps",
      desc: "I build user-friendly mobile apps that deliver seamless experiences.",
      color: "text-[#ff9a00]"
    },
    {
      icon: Palette,
      title: "Landing Page for Creators",
      desc: "I design high-converting landing pages for creators and brands.",
      color: "text-[#fdbe21]"
    },
    {
      icon: TrendingUp,
      title: "Digital Tools",
      desc: "I create useful digital products that improve productivity and workflow.",
      color: "text-[#ff9a00]"
    },
  ]

  if (!mounted) return null

  return (
    <div>
      {/* Hero Section */}
      <section className="gradient-bg pt-16 pb-20 md:pt-24 md:pb-32">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight text-gray-900 dark:text-white">
                Hi, I'm <span className="text-[#fdbe21]">Osim Uka</span>
              </h1>
              <h1 className="text-base md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Software Developer for Businesses & Creators
              </h1>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                I build websites and apps that help businesses attract customers and grow online.

                I work with brands, creators, and businesses to turn ideas into clean, high-converting digital products.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/projects"
                  className="bg-[#fdbe21] hover:bg-[#ff9a00] text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  View My Work
                  <ArrowRight size={20} />
                </Link>

                <button
                  onClick={() => { }}
                  className="border-2 border-[#fdbe21] text-[#fdbe21] hover:bg-[#fdbe21] hover:text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  <Download size={20} />
                  Get a website
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="relative">
                <div className="w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden border-8 border-[#fdbe21] shadow-2xl animate-pulse-custom">
                  <Image
                    src={Avatar}
                    alt="Osim Uka"
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-lg">
                <h3 className="text-3xl font-bold text-[#fdbe21] mb-2">
                  {stat.value}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              What I Do
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300">
              Specialized services to bring your ideas to life
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center cursor-pointer hover:-translate-y-2 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
              >
                <div className="w-20 h-20 bg-[#fdbe21]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <service.icon size={40} className={service.color} />
                </div>

                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  {service.title}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Featured Projects
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300">
              Some of my recent work
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.slice(0, 3).map((project, index) => (
              <div
                key={project.id}
                className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="h-48 overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-6">
                  {project.role && (
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${project.role.includes('Team')
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                      }`}>
                      {project.role}
                    </span>
                  )}

                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                    {project.title}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {project.desc}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {project.tools.slice(0, 3).map((tool) => (
                      <span
                        key={tool}
                        className="px-2 py-1 bg-[#fdbe21]/10 text-[#fdbe21] text-xs font-semibold rounded border border-[#fdbe21]/30"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/projects"
              className="border-2 border-[#fdbe21] text-[#fdbe21] hover:bg-[#fdbe21] hover:text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors"
            >
              View All Projects
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#fdbe21] py-16 md:py-24 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Let's Work Together
          </h2>

          <p className="text-base md:text-xl mb-8 opacity-90">
            Have a business idea or need a website?

            Let’s build something that brings you customers and grows your brand. </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-[#fdbe21] hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Start a Project
            </Link>

          </div>
        </div>
      </section>

    </div>
  )
}