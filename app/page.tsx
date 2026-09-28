import Image from 'next/image'
import Avatar from '../public/avatar.png'
import Chat from '@/components/Chat'
import Reveal from '@/components/Reveal'
import ProjectsTimeline from '@/components/ProjectsTimeline'

const services = [
  {
    title: "Web Development",
    desc: "Modern, fast websites built with React & Next.js that help businesses attract and convert customers.",
    tags: ["React & Next.js", "Node.js Backend", "E-commerce"],
  },
  {
    title: "Mobile Apps",
    desc: "Cross-platform mobile applications that deliver smooth, native-feeling user experiences.",
    tags: ["React Native", "Android", "iOS"],
  },
  {
    title: "Landing Pages",
    desc: "High-converting landing pages designed for creators and businesses to turn visitors into customers.",
    tags: ["Conversion Design", "Creator Economy", "Analytics"],
  },
  {
    title: "Digital Tools",
    desc: "Custom software and internal tools that improve productivity and streamline workflows.",
    tags: ["Internal Tools", "Productivity Apps", "Custom Software"],
  },
]

const testimonials = [
  {
    quote: "Osim is a reliable Software Engineer who consistently delivers clean and responsive user interfaces. He works well with design teams and pays attention to detail. He's proactive, easy to work with, and always willing to improve!",
    name: "Engr Uka Osim (Snr)",
    role: "CEO, 4onStudiosLTD",
    initials: "UO",
  },
  {
    quote: "From start to finish, you handled everything with so much excellence and care. I am genuinely impressed with the result and the professionalism you showed. I'll definitely recommend you to anyone!",
    name: "Oluwatobi Timothy",
    role: "Professional Graphics Designer",
    initials: "OT",
  },
  {
    quote: "Osim's landing page design increased our conversion rate by 60%. He understood our brand perfectly and delivered beyond what we imagined.",
    name: "Emily Rodriguez",
    role: "Marketing Director, GrowthCo",
    initials: "ER",
  },
]

export default function Home() {
  return (
    <div>
      <Reveal />

      {/* ── Hero ── */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
        <div className="max-w-5xl mx-auto w-full">
          <div className="reveal">
            <p className="text-muted text-xs font-semibold uppercase tracking-[0.2em] mb-6">
              Full Stack Developer & Digital Craftsman
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tight text-fg mb-8">
              Building Digital<br />
              Experiences<br />
              <span className="text-muted font-light">That Matter.</span>
            </h1>
            <p className="text-muted text-lg max-w-xl mb-10 leading-relaxed font-light">
              I craft high-performance websites, mobile apps, and digital tools that help businesses grow and creators shine.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#projects" className="btn-primary px-7 py-3 rounded-sm text-sm font-semibold tracking-wide">
                View My Work
              </a>
              <a href="#contact" className="btn-outline px-7 py-3 rounded-sm text-sm font-semibold tracking-wide">
                Start a Project
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px mt-20 border border-line reveal">
            {[
              { value: "10+", label: "Projects Delivered" },
              { value: "5+", label: "Happy Clients" },
              { value: "3+", label: "Years Experience" },
              { value: "100%", label: "Satisfaction" },
            ].map((stat) => (
              <div key={stat.label} className="p-8 border-r border-line last:border-r-0 text-center">
                <div className="text-3xl font-black text-fg">{stat.value}</div>
                <p className="text-muted text-xs mt-1 uppercase tracking-wider font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="py-24 px-6 border-t border-line">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 reveal">
            <p className="text-muted text-xs font-semibold uppercase tracking-[0.2em] mb-3">What I Do</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-fg">Services</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-px border border-line reveal">
            {services.map((service, i) => (
              <div key={i} className="p-10 border-b border-r border-line last:border-b-0 [&:nth-child(even)]:border-r-0 md:[&:nth-child(n+3)]:border-b-0">
                <div className="text-xs font-bold text-muted uppercase tracking-widest mb-4">0{i + 1}</div>
                <h3 className="text-xl font-bold text-fg mb-3">{service.title}</h3>
                <p className="text-muted text-sm leading-relaxed mb-6 font-light">{service.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-semibold uppercase tracking-widest text-muted border border-line px-2 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Projects Timeline ── */}
      <section id="projects" className="py-24 px-6 border-t border-line">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 reveal">
            <p className="text-muted text-xs font-semibold uppercase tracking-[0.2em] mb-3">Selected Work</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-fg">Projects</h2>
          </div>
          <ProjectsTimeline />
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-24 px-6 border-t border-line">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="reveal">
              <div className="border border-line overflow-hidden">
                <Image
                  src={Avatar}
                  alt="Osim Uka"
                  className="w-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </div>

            <div className="reveal">
              <p className="text-muted text-xs font-semibold uppercase tracking-[0.2em] mb-3">About Me</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-fg mb-8">Behind the Code</h2>
              <p className="text-muted text-base mb-5 leading-relaxed font-light">
                I'm Osim Uka, a full-stack developer with a passion for creating digital experiences that make a real difference. With 3+ years of experience, I've helped businesses transform their ideas into reality.
              </p>
              <p className="text-muted text-base mb-10 leading-relaxed font-light">
                My approach combines technical expertise with creative problem-solving. I don't just write code — I craft solutions that drive results, whether that's increasing conversions, streamlining operations, or creating delightful user experiences.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-10">
                {["Problem Solver", "Detail Oriented", "Fast Learner", "Team Player"].map((trait) => (
                  <div key={trait} className="flex items-center gap-3">
                    <div className="w-1 h-1 rounded-full bg-fg flex-shrink-0" />
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted">{trait}</span>
                  </div>
                ))}
              </div>

              <a href="#contact" className="btn-primary px-7 py-3 rounded-sm text-sm font-semibold tracking-wide inline-block">
                Let's Work Together
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-24 px-6 border-t border-line">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 reveal">
            <p className="text-muted text-xs font-semibold uppercase tracking-[0.2em] mb-3">Social Proof</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-fg">Client Stories</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px border border-line reveal">
            {testimonials.map((t, i) => (
              <div key={i} className="p-8 border-r border-line last:border-r-0">
                <p className="text-muted text-sm leading-relaxed mb-8 font-light">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 border border-line flex items-center justify-center text-xs font-bold text-fg flex-shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-fg">{t.name}</p>
                    <p className="text-[10px] text-muted uppercase tracking-widest font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact / Chat ── */}
      <section id="contact" className="py-24 px-6 border-t border-line">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 reveal">
            <p className="text-muted text-xs font-semibold uppercase tracking-[0.2em] mb-3">Get In Touch</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-fg">Let's Talk</h2>
          </div>
          <Chat />
        </div>
      </section>
    </div>
  )
}
