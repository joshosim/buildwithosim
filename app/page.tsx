import Image from 'next/image'
import Avatar from '../public/CEO.jpg'
import heroShot from '../public/brilliance-integrated.png'
import kiloShot from '../public/kilobyted.png'
import styleShot from '../public/her-way-to-style.png'
import type { StaticImageData } from 'next/image'
import { ArrowRight, MessageCircle } from 'lucide-react'
import Chat from '@/components/Chat'
import Reveal from '@/components/Reveal'
import Work from '@/components/Work'
import { data as projects } from '@/utils/project-data'

const WHATSAPP_URL =
  'https://wa.me/2347066530998?text=' + encodeURIComponent('Hello Osim, I would like to work with you.')
const EMAIL = 'joshuauka0@gmail.com'

const services = [
  {
    title: 'Landing pages & business websites',
    desc: 'Fast, mobile-first sites for small businesses and creators, built so every visit has a clear next step: call, book or message you on WhatsApp.',
  },
  {
    title: 'WhatsApp lead tracking & follow-up',
    desc: 'See which enquiries came from where, who has replied and who needs a nudge. I built Recall, a customer follow-up CRM, on this idea.',
  },
  {
    title: 'AI automations',
    desc: 'Workflows in n8n and Make that classify feedback, answer routine messages and move data between your tools without manual work.',
  },
  {
    title: 'Mobile & web apps',
    desc: 'Custom apps in React Native and Next.js. One of mine, Resume & CV Builder, is live on Google Play.',
  },
]

// Replace or extend with more real, named clients as they agree to be quoted.
const testimonial = {
  quote:
    "From start to finish, you handled everything with so much excellence and care. I am genuinely impressed with the result and the professionalism you showed. I'll definitely recommend you to anyone!",
  name: 'Oluwatobi Timothy',
  role: 'Professional Graphics Designer',
}

function ShotFrame({
  src,
  alt,
  label,
  priority,
  pos = 'top',
  className = '',
}: {
  src: StaticImageData
  alt: string
  label?: string
  priority?: boolean
  pos?: string
  className?: string
}) {
  return (
    <div className={className}>
      <div className="frame-shadow rounded-2xl bg-surface p-1.5">
        <div className="flex items-center gap-1.5 px-2.5 py-2" aria-hidden>
          <span className="w-2 h-2 rounded-full bg-line-strong" />
          <span className="w-2 h-2 rounded-full bg-line-strong" />
          <span className="w-2 h-2 rounded-full bg-line-strong" />
        </div>
        <Image
          src={src}
          alt={alt}
          priority={priority}
          sizes="(min-width: 1024px) 40vw, 90vw"
          style={{ objectPosition: pos }}
          className="w-full rounded-lg border border-line aspect-[16/10] object-cover"
        />
      </div>
      {label && (
        <span className="absolute -bottom-3 left-5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-fg shadow-sm">
          {label}
        </span>
      )}
    </div>
  )
}

export default function Home() {
  return (
    <div>
      <Reveal />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pt-14 md:pt-24 pb-16 md:pb-24">
        <div className="hero-dots absolute inset-0" aria-hidden />
        <div className="hero-glow absolute -right-24 top-10 w-[640px] h-[640px] rounded-full" aria-hidden />

        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.08fr_1fr] gap-16 lg:gap-12 items-center">
          <div>
            <p className="fade-up d1 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm text-muted mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" aria-hidden />
              Yenagoa, Nigeria · Working remotely
            </p>
            <h1 className="fade-up d2 text-[2.6rem] sm:text-6xl lg:text-[4.6rem] font-semibold leading-[1.02] tracking-[-0.035em] text-fg mb-7">
              Websites that turn visitors into <span className="text-accent">WhatsApp enquiries.</span>
            </h1>
            <p className="fade-up d3 text-muted text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
              I build fast websites and lead tracking for small businesses in Nigeria, plus the apps and
              automations behind them.
            </p>
            <div className="fade-up d4 flex flex-wrap items-center gap-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2.5 pl-5 pr-6 py-4 rounded-full text-base shadow-[0_10px_30px_-10px_var(--accent)]"
              >
                <MessageCircle size={20} aria-hidden />
                Message me on WhatsApp
              </a>
              <a
                href="#projects"
                className="btn-outline inline-flex items-center gap-2 px-6 py-4 rounded-full text-base font-medium"
              >
                See the work
                <ArrowRight size={18} aria-hidden />
              </a>
            </div>
          </div>

          {/* Layered project screenshots */}
          <div className="fade-up d3 relative mx-auto w-full max-w-[580px] sm:aspect-[1/1]">
            <ShotFrame
              src={kiloShot}
              alt="Kilobyte Studios website"
              pos="center 78%"
              className="hidden sm:block absolute -right-[3%] top-0 w-[58%] z-10 rotate-[3deg] float-b"
            />
            <ShotFrame
              src={styleShot}
              alt="Her Way to Style website"
              className="hidden sm:block absolute right-0 bottom-[1%] w-[54%] z-20 -rotate-[2deg] float-b"
            />
            <ShotFrame
              src={heroShot}
              alt="Brilliance Integrated website"
              label="Brilliance Integrated"
              priority
              className="relative sm:absolute left-0 sm:top-[19%] w-full sm:w-[72%] z-30 float-a"
            />
          </div>
        </div>

        <div className="relative max-w-6xl mx-auto mt-16 md:mt-24 pt-7 border-t border-line fade-up d4 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted">
          <span className="text-fg font-medium">Built with</span>
          {['Next.js', 'React Native', 'Node.js', 'Supabase', 'n8n', 'OpenAI'].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="py-24 px-6 border-t border-line">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 reveal max-w-2xl">
            <p className="eyebrow mb-3">Services</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-fg">
              What I can build for your business
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 reveal">
            {services.map((service) => (
              <div key={service.title} className="card p-8">
                <h3 className="text-xl font-semibold tracking-tight text-fg mb-3">{service.title}</h3>
                <p className="text-muted">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Work ── */}
      <section id="projects" className="py-24 px-6 border-t border-line">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 reveal max-w-2xl">
            <p className="eyebrow mb-3">Selected work</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-fg">
              Things I have built and shipped
            </h2>
          </div>
          <Work />
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-24 px-6 border-t border-line">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[280px_1fr] gap-12 items-start">
          <div className="reveal">
            <Image
              src={Avatar}
              alt="Osim Uka"
              sizes="280px"
              className="w-full max-w-[280px] rounded-2xl border border-line object-cover aspect-[4/5]"
            />
          </div>
          <div className="reveal max-w-2xl">
            <p className="eyebrow mb-3">About</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-fg mb-6">
              I&apos;m Osim, a self-taught developer with an engineering degree
            </h2>
            <p className="text-muted mb-5">
              I studied mechanical engineering at the Federal University of Technology, Owerri, and taught
              myself to build software. I still work like an engineer: find the real cause of the problem,
              build the simplest thing that fixes it, then test that it holds up.
            </p>
            <p className="text-muted mb-8">
              I&apos;m based in Yenagoa, Bayelsa State, and work with small businesses and creators who need a
              website, an app or an automation that does one specific job well.
            </p>
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm border-t border-line pt-6">
              <div>
                <dt className="text-muted">Based in</dt>
                <dd className="text-fg font-medium">Yenagoa, Nigeria (remote)</dd>
              </div>
              <div>
                <dt className="text-muted">Education</dt>
                <dd className="text-fg font-medium">B.Eng. Mechanical Engineering, FUTO</dd>
              </div>
              <div>
                <dt className="text-muted">Stack</dt>
                <dd className="text-fg font-medium">Next.js, React Native, Node.js, Supabase</dd>
              </div>
              <div>
                <dt className="text-muted">Automation</dt>
                <dd className="text-fg font-medium">n8n, Make.com, OpenAI</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section id="testimonials" className="py-24 px-6 border-t border-line">
        <div className="max-w-3xl mx-auto reveal">
          <p className="eyebrow mb-6">What clients say</p>
          <blockquote className="text-2xl md:text-3xl font-medium leading-snug tracking-tight text-fg">
            &ldquo;{testimonial.quote}&rdquo;
          </blockquote>
          <p className="text-muted mt-6">
            <span className="text-fg font-medium">{testimonial.name}</span>, {testimonial.role}
          </p>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-24 px-6 border-t border-line">
        <div className="max-w-3xl mx-auto reveal">
          <p className="eyebrow mb-3">Contact</p>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-fg mb-5">
            Tell me what you need.
          </h2>
          <p className="text-muted text-lg mb-8">
            The fastest way to reach me is WhatsApp. Send a few lines about your business and what you want
            to build, and I&apos;ll reply with what&apos;s realistic.
          </p>
          <div className="flex flex-wrap gap-3 mb-12">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-6 py-3.5 rounded-full text-base"
            >
              Message me on WhatsApp
            </a>
            <a href={`mailto:${EMAIL}`} className="btn-outline px-6 py-3.5 rounded-full text-base font-medium">
              {EMAIL}
            </a>
          </div>

          <details className="card group">
            <summary className="cursor-pointer list-none px-6 py-4 font-medium text-fg flex items-center justify-between">
              Or ask my assistant a quick question
              <span className="text-muted transition-transform group-open:rotate-45 text-xl leading-none">+</span>
            </summary>
            <div className="px-4 pb-4">
              <Chat />
            </div>
          </details>
        </div>
      </section>
    </div>
  )
}
