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
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="mt-16 flex flex-col">
        <div className="flex flex-col-reverse md:flex-row items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <p className="font-normal text-sm text-gray-600 dark:text-gray-300">Experience</p>
            <p className="font-semibold text-[#fdbe21] text-3xl">2+ Years</p>
          </div>
          <div className="h-96 w-80">
            <Side />
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="font-normal text-sm text-gray-600 dark:text-gray-300">Projects</p>
            <p className="font-semibold text-[#fdbe21] text-3xl">5+</p>
          </div>
        </div>

        <h2 className="text-4xl md:text-6xl font-bold text-center text-[#fdbe21] mt-8">
          About Me
        </h2>
        <p className="px-4 font-light text-base md:text-xl mx-0 md:mx-[20%] py-2 text-center leading-relaxed text-gray-700 dark:text-gray-300">
          I’m a software developer who helps businesses and creators build modern websites and apps that attract customers and grow their brand online.

          I started my journey in tech with Java and quickly developed a strong passion for building digital solutions and solving real-world problems.

          I build responsive websites and mobile apps that are fast, user-friendly, and designed to convert visitors into customers.

          Over the past 2+ years, I’ve worked on projects including e-commerce platforms, booking systems, and mobile applications, helping businesses improve their online presence and user experience.

          I also create digital tools and resources that help individuals and businesses improve productivity and grow.

          If you’re looking for a developer to build a clean, modern website or app for your business, I’d love to work with you.

          Let’s create something that delivers real results. </p>


        <h2 className="text-4xl md:text-5xl font-bold mt-20 mb-8 text-center text-[#fdbe21]">
          My Tech Stack
        </h2>
        <div className="flex flex-wrap px-4 mx-0 md:mx-[20%] justify-center items-center mb-20">
          {techStack.map((tech, index) => (
            <motion.div key={tech} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1, duration: 1, type: 'spring', stiffness: 100 }}>
              <span className="m-2 px-4 md:px-6 py-2 md:py-3 text-sm md:text-lg font-semibold cursor-pointer bg-white dark:bg-gray-800 border-2 border-[#fdbe21]/20 text-[#fdbe21] rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:bg-[#fdbe21] hover:text-white hover:border-transparent inline-block">
                {tech}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
