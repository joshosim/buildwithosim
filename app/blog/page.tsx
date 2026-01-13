import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import BlogCard from '@/components/BlogCard';

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

async function getPosts(): Promise<Post[]> {
  const { data: posts, error } = await supabase
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
    .eq('published', true)
    .order('published_date', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  return posts || [];
}

export default async function Blog() {
  const posts = await getPosts();

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-[#fdbe21]">
            Blog & Resources
          </h2>
          <p className="text-gray-600 text-base md:text-xl max-w-2xl mx-auto">
            Insights on personal development, finance, tech, and creative living
          </p>
        </div>

        {/* Posts Grid or Empty State */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              No posts yet. Check back soon!
            </p>
            <Link
              href="/admin"
              className="inline-block bg-[#fdbe21] text-white px-6 py-3 rounded-lg hover:bg-[#e5ab1e] transition"
            >
              Create Your First Post
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const revalidate = 60; // Revalidate every 60 seconds