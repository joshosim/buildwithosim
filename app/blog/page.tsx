'use client';

import { Calendar, Clock } from 'lucide-react';
import { useRouter } from "next/navigation";

const blogPosts = [
  {
    id: 1,
    title: "5 Skills to Learn Before 2026 That Will Make You Money",
    excerpt: "Discover the most valuable skills that can transform your career and income in the digital age.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
    category: "Personal Development",
    date: "2025-01-15",
    readTime: "5 min read"
  },
  {
    id: 2,
    title: "How to Start Coding with No Laptop",
    excerpt: "Learn programming even with limited resources. Practical tips for aspiring developers.",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800",
    category: "Tech",
    date: "2025-01-10",
    readTime: "7 min read"
  },
  {
    id: 3,
    title: "Simple Savings Challenge for Beginners",
    excerpt: "Start your financial journey with this easy-to-follow savings plan.",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800",
    category: "Finance",
    date: "2025-01-05",
    readTime: "4 min read"
  }
];

export default function Blog() {
  const router = useRouter();

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-[#fdbe21]">
            Blog & Resources
          </h2>
          <p className="text-gray-600 text-base md:text-xl max-w-2xl mx-auto">
            Insights on personal development, finance, tech, and creative living
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <div key={post.id} onClick={() => router.push(`/blog/${post.id}`)} className="cursor-pointer h-full flex flex-col bg-white rounded-lg shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
              <img src={post.image} alt={post.title} className="w-full h-48 object-cover rounded-t-lg" />
              <div className="p-6 flex-grow flex flex-col">
                <span className="inline-block mb-4 px-3 py-1 bg-[#fdbe21] text-white text-xs font-semibold rounded-full w-fit">
                  {post.category}
                </span>
                <h3 className="text-xl font-semibold mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow">
                  {post.excerpt}
                </p>
                <div className="flex gap-4 items-center text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {post.readTime}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-12 bg-[#fdbe21]/10 rounded-2xl text-center border-2 border-dashed border-[#fdbe21]/30">
          <h3 className="text-3xl font-bold mb-4 text-[#fdbe21]">
            Coming Soon
          </h3>
          <p className="text-gray-600">
            More articles on productivity, finance tips, coding tutorials, and creative inspiration.
          </p>
        </div>
      </div>
    </div>
  );
}
