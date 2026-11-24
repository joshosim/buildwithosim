import Image from 'next/image'
import Avatar from '../public/CEO.jpg'
import heroShot from '../public/brilliance-integrated.png'
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

export default function Home() {
  return (
    <div>
      <Reveal />

      {/* ── Hero ── */}
      <section className="px-6 pt-20 md:pt-28 pb-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_1fr] gap-14 items-center">
          <div className="reveal">
            <p className="eyebrow mb-5">BuildWithOsim · Yenagoa, Nigeria</p>
            <h1 className="text-4xl md:text-6xl font-semibold leading-[1.08] tracking-tight text-fg mb-6">
              Websites that turn visitors into{' '}
              <span className="text-accent">WhatsApp enquiries.</span>
            </h1>
            <p className="text-muted text-lg md:text-xl max-w-xl mb-9">
              I build fast websites and lead tracking for small businesses in Nigeria, plus the apps and
              automations behind them.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-6 py-3.5 rounded-full text-base"
              >
                Message me on WhatsApp
              </a>
              <a href="#projects" className="btn-outline px-6 py-3.5 rounded-full text-base font-medium">
                See the work
              </a>
            </div>
            <p className="text-muted text-sm">
              {projects.length} projects built · 1 app on Google Play · Working remotely
            </p>
          </div>

          <div className="reveal">
            <div className="rounded-2xl border border-line bg-surface p-2 shadow-[var(--shadow)]">
              <div className="flex items-center gap-1.5 px-3 py-2" aria-hidden>
                <span className="w-2.5 h-2.5 rounded-full bg-line-strong" />
                <span className="w-2.5 h-2.5 rounded-full bg-line-strong" />
                <span className="w-2.5 h-2.5 rounded-full bg-line-strong" />
              </div>
              <Image
                src={heroShot}
                alt="Brilliance Integrated website"
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="w-full rounded-lg border border-line"
              />
            </div>
            <p className="text-muted text-sm mt-3">Brilliance Integrated: business website, Lagos</p>
          </div>
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
