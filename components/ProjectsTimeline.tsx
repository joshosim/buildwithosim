'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { data } from '@/utils/project-data'

const sorted = [...data].sort((a, b) => b.id - a.id)

function TimelineItem({ project, index }: { project: (typeof sorted)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px 0px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative group"
    >
      {/* Animated dot */}
      <motion.div
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{ duration: 0.35, delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
        className="absolute -left-[27px] top-9 z-10"
      >
        <span className="block w-3 h-3 rounded-full bg-fg border-2 border-bg" />
        {/* ripple */}
        {inView && (
          <motion.span
            initial={{ scale: 1, opacity: 0.4 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="absolute inset-0 rounded-full bg-fg"
          />
        )}
      </motion.div>

      <div className={`py-10 border-b border-line ${index === sorted.length - 1 ? 'border-b-0' : ''}`}>
        <div className="flex flex-col md:flex-row md:items-start gap-6">

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="w-full md:w-52 h-36 flex-shrink-0 overflow-hidden border border-line"
          >
            <Image
              src={project.image}
              alt={project.title}
              width={208}
              height={144}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            />
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted border border-line px-2 py-0.5">
                {project.type}
              </span>
              <span className="text-[10px] text-muted font-medium">{project.role}</span>
            </div>

            <h3 className="text-xl font-bold text-fg mb-2">{project.title}</h3>
            <p className="text-muted text-sm leading-relaxed mb-4 font-light">{project.desc}</p>

            <div className="flex flex-wrap gap-2 mb-5">
              {project.tools.map((tool) => (
                <span key={tool} className="text-[10px] font-semibold uppercase tracking-widest text-muted border border-line px-2 py-0.5">
                  {tool}
                </span>
              ))}
            </div>

            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-fg hover:text-muted transition-colors group/link"
              >
                View Project
                <motion.svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  whileHover={{ x: 2, y: -2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </motion.svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function AnimatedLine() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.2'] })
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <div ref={ref} className="absolute left-0 top-0 bottom-0 w-px overflow-hidden">
      {/* static track */}
      <div className="absolute inset-0 bg-line" />
      {/* animated fill */}
      <motion.div
        style={{ scaleY, transformOrigin: 'top' }}
        className="absolute inset-0 bg-fg"
      />
    </div>
  )
}

export default function ProjectsTimeline() {
  return (
    <div className="relative pl-8">
      <AnimatedLine />
      <div>
        {sorted.map((project, i) => (
          <TimelineItem key={project.id} project={project} index={i} />
        ))}
      </div>
    </div>
  )
}
