'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Avatar from '../public/avatar.png'
import { data } from '../utils/project-data'

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('active')),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const services = [
    {
      icon: (
        <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      title: "Web Development",
      desc: "I create modern websites that help businesses attract and convert customers.",
      ul: ["React & Next.js", "Node.js/Expressjs Backend", "E-commerce Solutions"],
    },
    {
      icon: (
        <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: "Mobile Apps",
      desc: "Native and cross-platform mobile applications that deliver exceptional user experiences.",
      ul: ["React Native", "Android Development", "IOS Development"],
    },
    {
      icon: (
        <svg className="w-7 h-7 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      ),
      title: "Landing Page for Creators",
      desc: "High-converting landing pages designed to turn visitors into customers.",
      ul: ["Conversion Optimized Design", "Creator Economy", "Analytics Integration"],
    },
    {
      icon: (
        <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      title: "Digital Tools",
      desc: "I create useful digital products that improve productivity and workflow.",
      ul: ["Internal Tools", "Productivity Apps", "Custom Software Solutions"],
    },
  ]

  const testimonials = [
    {
      quote: "Osim delivered our e-commerce platform ahead of schedule. The attention to detail and performance optimization exceeded our expectations. Sales increased 40% in the first month!",
      name: "Sarah Johnson", role: "CEO, StyleHub", initials: "SJ", gradient: "from-indigo-400 to-purple-400",
    },
    {
      quote: "Working with Osim was a game-changer for our startup. He built our MVP in record time and the code quality was exceptional. Highly recommend!",
      name: "Michael Chen", role: "Founder, TechStart", initials: "MC", gradient: "from-pink-400 to-orange-400",
    },
    {
      quote: "Osim's landing page design increased our conversion rate by 60%. He understood our brand perfectly and delivered beyond what we imagined.",
      name: "Emily Rodriguez", role: "Marketing Director, GrowthCo", initials: "ER", gradient: "from-cyan-400 to-blue-400",
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative px-6 pt-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="reveal">
            <p className="text-indigo-400 font-medium mb-4 tracking-wider text-sm uppercase">
              Full Stack Developer & Digital Craftsman
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              Building Digital<br />
              <span className="gradient-text">Experiences</span> That Matter
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              I craft high-performance websites, mobile applications, and digital tools that help businesses grow and creators shine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#projects" className="btn-primary px-8 py-4 rounded-full font-medium text-lg inline-flex items-center justify-center gap-2">
                View My Work
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a href="#contact" className="btn-outline px-8 py-4 rounded-full font-medium text-lg inline-flex items-center justify-center gap-2">
                Start a Project
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 reveal">
            {[
              { value: "50", label: "Projects Delivered" },
              { value: "25", label: "Happy Clients" },
              { value: "3", label: "Years Experience" },
              { value: "100", label: "% Satisfaction" },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-6">
                <div className="stat-number text-3xl md:text-4xl font-bold gradient-text" data-target={stat.value}>0</div>
                <p className="text-gray-400 text-sm mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What I <span className="gradient-text">Create</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">End-to-end digital solutions tailored to your unique needs and goals.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div key={index} className="service-card glass rounded-2xl p-8 reveal">
                <div className="service-icon w-14 h-14 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{service.desc}</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-500">
                  {service.ul.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section id="projects" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 reveal">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Featured <span className="gradient-text">Projects</span></h2>
              <p className="text-gray-400 max-w-xl">A selection of my recent work showcasing different technologies and solutions.</p>
            </div>
            <a href="/projects" className="mt-4 md:mt-0 text-indigo-400 hover:text-indigo-300 flex items-center gap-2 transition-colors">
              View All Projects
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.slice(0, 3).map((project) => (
              <div key={project.id} className="project-card glass rounded-2xl overflow-hidden reveal">
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600">
                  <div className="h-48 overflow-hidden">
                    <Image src={project.image} alt={project.title} width={400} height={200} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-medium">E-commerce</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{project.desc}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tools.slice(0, 3).map((tool) => (
                      <span key={tool} className="tech-tag px-3 py-1 rounded-full text-xs">{tool}</span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <a href="#" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      Live Demo
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <a href="#" className="text-sm text-gray-500 hover:text-gray-300 flex items-center gap-1">
                      GitHub
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="reveal">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl opacity-20 blur-2xl" />
                <div className="glass-strong rounded-3xl p-8 relative">
                  <div className="w-full h-80 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <Image src={Avatar} alt="Osim Uka" className="w-full h-80 object-cover rounded-xl border-4 border-white shadow-lg" />
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Behind the <span className="gradient-text">Code</span></h2>
              <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                I'm Osim Uka, a passionate full-stack developer with a love for creating digital experiences that make a difference. With 3+ years of experience, I've helped businesses transform their ideas into reality.
              </p>
              <p className="text-gray-400 mb-8 leading-relaxed">
                My approach combines technical expertise with creative problem-solving. I don't just write code—I craft solutions that drive results, whether that's increasing conversions, streamlining operations, or creating delightful user experiences.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {["Problem Solver", "Detail Oriented", "Fast Learner", "Team Player"].map((trait) => (
                  <div key={trait} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm">{trait}</span>
                  </div>
                ))}
              </div>

              <a href="#contact" className="btn-primary px-8 py-3 rounded-full font-medium inline-flex items-center gap-2">
                Let's Work Together
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Client <span className="gradient-text">Stories</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Don't just take my word for it—here's what clients say about working with me.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="testimonial-card glass rounded-2xl p-8 reveal">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center font-bold`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Tech <span className="gradient-text">Stack</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Modern tools and technologies I use to build exceptional digital experiences.</p>
          </div>

          <div className="glass rounded-3xl p-8 md:p-12 reveal">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-8">
              {["React", "Next.js", "Node.js", "TypeScript", "PostgreSQL", "AWS"].map((tech) => (
                <div key={tech} className="flex flex-col items-center gap-3 group">
                  <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                    <svg className="w-8 h-8 text-gray-400 group-hover:text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-400">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


    </div>
  )
}
