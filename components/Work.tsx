import Image from 'next/image'
import { data } from '@/utils/project-data'

/** Projects with a real screenshot, shown large. Everything else goes in the index below. */
const FEATURED_IDS = [10, 8, 11, 2]

const featured = FEATURED_IDS.map((id) => data.find((p) => p.id === id)).filter(
  (p): p is (typeof data)[number] => Boolean(p),
)
const rest = data.filter((p) => !FEATURED_IDS.includes(p.id)).sort((a, b) => b.id - a.id)

const Arrow = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 17L17 7M9 7h8v8" />
  </svg>
)

export default function Work() {
  return (
    <div>
      <div className="grid md:grid-cols-2 gap-6">
        {featured.map((project) => {
          const body = (
            <>
              <div className="overflow-hidden rounded-xl border border-line bg-bg aspect-[16/10]">
                <Image
                  src={project.image}
                  alt={`${project.title} screenshot`}
                  width={1280}
                  height={800}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="pt-5 px-1 pb-1">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-semibold tracking-tight text-fg">{project.title}</h3>
                  {project.link && (
                    <span className="text-muted mt-1 shrink-0">
                      <Arrow />
                    </span>
                  )}
                </div>
                <p className="eyebrow mt-1">{project.type}</p>
                <p className="text-muted mt-3">{project.desc}</p>
                <p className="text-muted text-sm mt-4">{project.tools.slice(0, 4).join(' · ')}</p>
              </div>
            </>
          )
          return project.link ? (
            <a
              key={project.id}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-4 block"
            >
              {body}
            </a>
          ) : (
            <div key={project.id} className="card p-4">
              {body}
            </div>
          )
        })}
      </div>

      <h3 className="text-xl font-semibold tracking-tight text-fg mt-16 mb-4">More work</h3>
      <ul className="border-t border-line">
        {rest.map((project) => {
          const row = (
            <>
              <span className="font-medium text-fg sm:w-64 shrink-0">{project.title}</span>
              <span className="text-muted text-sm flex-1">{project.type}</span>
              <span className="text-muted text-sm sm:text-right sm:w-64">{project.role}</span>
              <span className="text-muted w-4 hidden sm:block">{project.link ? <Arrow /> : null}</span>
            </>
          )
          return (
            <li key={project.id} className="border-b border-line">
              {project.link ? (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 py-4 hover:bg-accent-soft transition-colors px-2 -mx-2 rounded-lg"
                >
                  {row}
                </a>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 py-4 px-2 -mx-2">{row}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
