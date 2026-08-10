import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  cover_image?: string;
  published_date: string;
  content: string;
  post_categories?: {
    categories: {
      name: string;
      slug: string;
    };
  }[];
}

// Helper function to calculate read time
function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

// Helper function to format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function BlogCard({ post }: { post: Post }) {
  const readTime = calculateReadTime(post.content);
  const formattedDate = formatDate(post.published_date);
  const category = post.post_categories?.[0]?.categories?.name || 'Blog';

  return (
    <Link
      key={post.id}
      href={`/blog/${post.slug}`}
      className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 overflow-hidden"
    >
      <img
        src={
          post.cover_image ||
          'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800'
        }
        alt={post.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-6 flex-grow flex flex-col">
        <span className="inline-block mb-4 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full w-fit">
          {category}
        </span>

        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white flex-grow">
          {post.title}
        </h3>

        <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 text-sm mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{readTime}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
