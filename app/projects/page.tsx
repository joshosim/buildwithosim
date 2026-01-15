'use client';

import { data } from '@/utils/project-data';
import { Search } from 'lucide-react';
import { useState } from 'react';

export default function Projects() {
  const [searchValue, setSearchValue] = useState("");

  const onSearch = (value: string) => {
    setSearchValue(value);
  };

  const filteredProjects = data?.filter((project: any) => {
    const search = searchValue.toLowerCase();
    const title = project?.title?.toLowerCase() || "";
    const tools = project?.tools?.map((tool: string) => tool.toLowerCase()) || [];
    return title.includes(search) || tools.some((tool: string | string[]) => tool.includes(search));
  });

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-[#fdbe21]">
            My Projects
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Showcasing {data.length} projects across web, mobile, and digital solutions
          </p>
        </div>

        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search Projects"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fdbe21] focus:border-transparent"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => window.open(project.link, '_blank')}
              className="flex flex-col h-full cursor-pointer bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
            >
              <img src={project.image} alt={project.title} className="w-full h-48 object-cover rounded-t-lg" />
              <div className="p-6 flex-grow flex flex-col">
                {project.role && (
                  <span className={`inline-block mb-2 px-3 py-1 text-xs font-semibold rounded-full w-fit ${project.role.includes('Team')
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                    {project.role}
                  </span>
                )}
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                  {project.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow line-clamp-3">
                  {project.desc}
                </p>
                <div className="flex gap-2 flex-wrap mt-auto">
                  {project.tools.map((item) => (
                    <span key={item} className="px-2 py-1 bg-[#fdbe21]/10 text-[#fdbe21] text-xs font-semibold rounded border border-[#fdbe21]/30">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
