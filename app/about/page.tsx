'use client';

import Side from '@/components/Side';
import { motion } from 'framer-motion';

export default function About() {
  const techStack = [
    'JavaScript', 'TypeScript', 'React', 'React Native',
    'Tailwind CSS', 'MUI', 'Web Development',
    'Mobile Development'
  ];

  return (
    <div className="bg-bg min-h-screen text-fg">
      <div className="mt-24 flex flex-col">
        <div className="flex flex-col-reverse md:flex-row items-center justify-center gap-12">
          <div className="flex flex-col items-center justify-center">
            <p className="font-medium text-xs text-muted uppercase tracking-widest mb-2">Experience</p>
            <p className="font-bold text-accent text-4xl">3+ Years</p>
          </div>
          <div className="h-96 w-80 relative">
            <div className="absolute inset-0 bg-accent/10 blur-3xl rounded-full"></div>
            <Side />
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="font-medium text-xs text-muted uppercase tracking-widest mb-2">Projects</p>
            <p className="font-bold text-accent text-4xl">10+</p>
          </div>
        </div>

        <h2 className="text-4xl md:text-6xl font-instrument font-bold text-center text-fg mt-16 mb-8">
          About Me
        </h2>
        <p className="px-6 font-light text-base md:text-xl max-w-3xl mx-auto py-4 text-center leading-relaxed text-muted">
          I’m a software developer who helps businesses and creators build modern websites and apps that attract customers and grow their brand online.
        </p>
        <p className="px-6 font-light text-base md:text-xl max-w-3xl mx-auto py-4 text-center leading-relaxed text-muted">
          I started my journey in tech with Java and quickly developed a strong passion for building digital solutions and solving real-world problems.
        </p>
        <p className="px-6 font-light text-base md:text-xl max-w-3xl mx-auto py-4 text-center leading-relaxed text-muted">
          I build responsive websites and mobile apps that are fast, user-friendly, and designed to convert visitors into customers.
        </p>
        <p className="px-6 font-light text-base md:text-xl max-w-3xl mx-auto py-4 text-center leading-relaxed text-muted">
          Over the past 3+ years, I’ve worked on projects including e-commerce platforms, booking systems, and mobile applications, helping businesses improve their online presence and user experience.
        </p>
        <p className="px-6 font-light text-base md:text-xl max-w-3xl mx-auto py-4 text-center leading-relaxed text-muted">
          I also create digital tools and resources that help individuals and businesses improve productivity and grow.
        </p>
        <p className="px-6 font-light text-base md:text-xl max-w-3xl mx-auto py-4 text-center leading-relaxed text-fg font-medium italic font-instrument">
          Let’s create something that delivers real results.
        </p>

        <h2 className="text-4xl md:text-5xl font-bold mt-24 mb-12 text-center text-fg font-instrument">
          My Tech Stack
        </h2>
        <div className="flex flex-wrap px-6 max-w-4xl mx-auto justify-center items-center mb-24 gap-4">
          {techStack.map((tech, index) => (
            <motion.div key={tech} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1, duration: 1, type: 'spring', stiffness: 100 }}>
              <span className="m-1 px-5 py-2 text-sm font-medium cursor-pointer surface-subtle text-muted rounded-full transition-all duration-300 hover:text-accent hover:border-accent inline-block">
                {tech}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
