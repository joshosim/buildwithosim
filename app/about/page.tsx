'use client';

import Side from '@/components/Side';
import { motion } from 'framer-motion';

export default function About() {
  const techStack = [
    'JavaScript', 'TypeScript', 'React', 'React Native',
    'Tailwind CSS', 'MUI', 'Web Development',
    'Mobile Development', 'Graphic Design', 'Video Editing'
  ];

  return (
    <div>
      <div className="mt-16 flex flex-col">
        <div className="flex flex-col-reverse md:flex-row items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <p className="font-normal text-sm">Experience</p>
            <p className="font-semibold text-[#fdbe21] text-3xl">2+ Years</p>
          </div>
          <div className="h-96 w-80">
            <Side />
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="font-normal text-sm">Projects</p>
            <p className="font-semibold text-[#fdbe21] text-3xl">5+</p>
          </div>
        </div>

        <h2 className="text-4xl md:text-6xl font-bold text-center text-[#fdbe21] mt-8">
          About Me
        </h2>
        <p className="px-4 font-light text-base md:text-xl mx-0 md:mx-[20%] py-2 text-center leading-relaxed">
          I'm a self-taught software developer from Nigeria with a passion for creating digital solutions that make a difference.
          My journey into tech began with Java, which sparked my love for programming and problem-solving.
        </p>
        <p className="px-4 font-light text-base md:text-xl mx-0 md:mx-[20%] py-2 text-center leading-relaxed">
          I specialize in building modern web and mobile applications using React, TypeScript, and React Native.
          With over 2 years of hands-on experience, I've developed projects ranging from school management systems
          to e-commerce platforms and mobile apps.
        </p>
        <p className="px-4 font-light text-base md:text-xl mx-0 md:mx-[20%] py-2 text-center leading-relaxed">
          Beyond coding, I'm a creative designer, content creator, and digital entrepreneur. I create digital products,
          share insights on personal development and finance, and help others build better lives through practical resources.
        </p>
        <p className="px-4 font-light text-base md:text-xl mx-0 md:mx-[20%] py-2 text-center leading-relaxed">
          I believe in continuous learning and staying ahead in the ever-evolving tech landscape.
          Whether it's building scalable applications, designing intuitive interfaces, or creating valuable digital content,
          I'm committed to delivering quality work that exceeds expectations.
        </p>
        <p className="px-4 font-light text-base md:text-xl mx-0 md:mx-[20%] py-2 text-center leading-relaxed">
          Let's collaborate on your next project or connect to discuss opportunities in software development,
          design, or digital product creation.
        </p>

        <h2 className="text-4xl md:text-5xl font-bold mt-20 mb-8 text-center text-[#fdbe21]">
          My Tech Stack
        </h2>
        <div className="flex flex-wrap px-4 mx-0 md:mx-[20%] justify-center items-center mb-20">
          {techStack.map((tech, index) => (
            <motion.div key={tech} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1, duration: 1, type: 'spring', stiffness: 100 }}>
              <span className="m-2 px-4 md:px-6 py-2 md:py-3 text-sm md:text-lg font-semibold cursor-pointer bg-white border-2 border-[#fdbe21]/20 text-[#fdbe21] rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:bg-[#fdbe21] hover:text-white hover:border-transparent inline-block">
                {tech}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
