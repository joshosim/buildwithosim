
import { Calendar, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

interface Post {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  published_date: string;
  created_at: string;
  post_categories?: {
    categories: {
      name: string;
      slug: string;
    };
  }[];
}

async function getPost(slug: string): Promise<Post | null> {
  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      *,
      post_categories (
        category_id,
        categories (
          name,
          slug
        )
      )
    `)
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error || !post) {
    return null;
  }

  return post;
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
    month: 'long',
    day: 'numeric',
  });
}

export default async function BlogDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const category = post.post_categories?.[0]?.categories?.name || 'General';
  const readTime = calculateReadTime(post.content);
  const formattedDate = formatDate(post.published_date);

  return (
    <div>
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <span className="inline-block mb-6 px-4 py-2 bg-[#fdbe21] text-white font-semibold rounded-full">
            {category}
          </span>

          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            {post.title}
          </h1>
          <div className="flex gap-6 mb-8 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span className="text-sm">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span className="text-sm">{readTime}</span>
            </div>
          </div>
          <div className="mb-8 rounded-xl overflow-hidden">
            <img
              src={post.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800'}
              alt={post.title}
              className="w-full h-96 object-cover"
            />
          </div>
          <div className="bg-white p-6 md:p-10 rounded-xl shadow-lg">
            <div className="text-base md:text-lg leading-relaxed whitespace-pre-line">
              {post.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
