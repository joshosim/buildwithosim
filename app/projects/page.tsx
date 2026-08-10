'use client';

import { data } from '@/utils/project-data';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Projects() {
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target as HTMLElement;
          element.classList.add('active');
          element.style.opacity = '1';
          element.style.transform = 'translateY(0) translateZ(0)';
        }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((element) => {
      const revealElement = element as HTMLElement;
      revealElement.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
      observer.observe(revealElement);
    });

    return () => observer.disconnect();
  }, []);

  const onSearch = (value: string) => {
    setSearchValue(value);
  };

  const filteredProjects = Array.isArray(data) ? data.filter((project: any) => {
    const search = searchValue.toLowerCase();
    const title = (project?.title || "").toLowerCase();
    const tools = Array.isArray(project?.tools) ? project.tools : [];
    return title.includes(search) || tools.some((tool: string) => tool.toLowerCase().includes(search));
  }) : [];

  const stats = [
    { value: data?.length || 0, label: "Total Projects" },
    { value: "3+", label: "Years Experience" },
    { value: "15+", label: "Tech Stacks" },
    { value: "100%", label: "Client Satisfaction" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 reveal">
          <div>
            <p className="text-indigo-400 font-medium mb-4 tracking-wider text-sm uppercase">
              My Work Portfolio
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-instrument">
              Projects <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Showcase</span>
            </h2>
            <p className="text-gray-400 max-w-xl">
              Exploring my collection of web, mobile, and digital solutions
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search Projects..."
                value={searchValue}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-transparent bg-gray-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-white placeholder-gray-400 backdrop-blur transition-all duration-300"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Stats Section - Similar to home page */}
          <div className="grid md:grid-cols-4 gap-6 reveal">
            {stats.map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-6 text-center">
                <div className="stat-number text-3xl md:text-4xl font-bold gradient-text" data-target={stat.value}>
                  {stat.value}
                </div>
                <p className="text-gray-400 text-sm mt-2">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.length > 0 ? filteredProjects.map((project, index) => (
              <div 
                key={project.id} 
                className="project-card glass rounded-2xl overflow-hidden reveal"
                style={{ transitionDelay: `${index * 0.05}s` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  <Image
                    src={project.image}
                    alt={project.title}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                  {project.role && (
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full w-fit ${project.role.includes('Team') ? 'bg-blue-900/50 dark:text-blue-200' : 'bg-gray-700/50 dark:text-gray-200'} backdrop-blur`}>
                        {project.role}
                      </span>
                    </div>
                  )}
                </div>
                <div className="bg-black/40 backdrop-blur p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold mb-2 text-white font-instrument">
                    {project.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">
                    {project.desc}
                  </p>
                  <div className="flex gap-2 flex-wrap mt-4">
                    {project.tools.map((item) => (
                      <span key={item} className="px-3 py-1 rounded-full text-xs bg-gray-800/50 text-gray-300 border border-gray-600/50 backdrop-blur">
                        {item}
                      </span>
                    ))}
                  </div>
                  {project.link && (
                    <div className="mt-6 pt-4 border-t border-gray-700/50">
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 transition-colors font-medium"
                      >
                        View Project
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-12 reveal">
                <p className="text-gray-400 text-lg">No projects found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}