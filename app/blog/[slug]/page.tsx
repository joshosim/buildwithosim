
import { Calendar, Clock, LightbulbIcon, Quote, QuoteIcon, TextQuote } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Comments from '@/components/Comments';

interface Post {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  images?: string[]; // additional images array
  specific_info?: string; // key points/tips section
  conclusion_content?: string; // conclusion section
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
    month: 'short',
    day: 'numeric',
  });
}

async function getComments(slug: string) {
  // Get all comments for this post
  const { data: allComments } = await supabase
    .from('comments')
    .select('*')
    .eq('post_slug', slug)
    .eq('approved', true)
    .order('created_at', { ascending: false });

  if (!allComments) return [];

  // Get likes count for each comment
  const commentIds = allComments.map(c => c.id);
  const { data: likes } = await supabase
    .from('comment_likes')
    .select('comment_id')
    .in('comment_id', commentIds);

  // Count likes per comment
  const likesCount: Record<string, number> = {};
  likes?.forEach(like => {
    likesCount[like.comment_id] = (likesCount[like.comment_id] || 0) + 1;
  });

  // Organize comments into parent-child structure
  const commentsMap: Record<string, any> = {};
  const rootComments: any[] = [];

  allComments.forEach(comment => {
    const commentWithLikes = {
      ...comment,
      likes_count: likesCount[comment.id] || 0,
      user_has_liked: false, // Will be updated on client side
      replies: []
    };
    commentsMap[comment.id] = commentWithLikes;
  });

  allComments.forEach(comment => {
    if (comment.parent_id) {
      // This is a reply
      if (commentsMap[comment.parent_id]) {
        commentsMap[comment.parent_id].replies.push(commentsMap[comment.id]);
      }
    } else {
      // This is a root comment
      rootComments.push(commentsMap[comment.id]);
    }
  });

  return rootComments;
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

  const comments = await getComments((await params).slug);

  return (
    <div>
      <div className="bg-gray-50 py-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center mt-12 mb-6">
            <span className="text-sm">Published {formattedDate}</span>
          </div>

          <h1 className="text-3xl flex items-center justify-center md:text-5xl font-bold mb-6">
            {post.title}
          </h1>

          <div className="flex justify-center items-center mb-6 text-base md:text-lg leading-relaxed whitespace-pre-line">
            {post.subtitle}
          </div>

          <div className="flex justify-center items-center">
            <span className="inline-block mb-6 px-4 py-2 bg-[#fdbe21] text-white font-semibold rounded-full">
              {category}
            </span>
          </div>
          <div className="flex gap-6 mb-8 text-gray-600">
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
          <div className='max-w-3xl mx-auto'>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-6">
                Introduction
              </h1>

              <div className="prose lg:prose-xl max-w-none mb-8">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>
            </div>

            {/* Specific Info Section */}
            {post.specific_info && (
              <div className="mt-8  p-6 md:p-10 border-l-4 border-[#fdbe21]">
                <ReactMarkdown>
                  {/* <span className='text-base font-bold md:text-2xl leading-relaxed whitespace-pre-line'> */}
                  {post.specific_info}
                  {/* </span> */}
                </ReactMarkdown>

                <div className='flex items-center gap-4 mt-4'>
                  <div className='h-12 w-12 rounded-full bg-amber-400' />
                  <div>
                    <h2 className="text-base font-bold">Osim Uka</h2>
                    <h2 className="text-base italic">Software Engineer</h2>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Images Gallery */}
            {post.images && post.images.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Gallery</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {post.images.map((image, index) => (
                    <div key={index} className="rounded-xl overflow-hidden shadow-lg">
                      <img
                        src={image}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conclusion Section */}
            {post.conclusion_content && (
              <div className="mt-8 bg-green-50 p-6 md:p-10 rounded-xl border-l-4">
                <div className="flex items-center gap-2 mb-4">
                  <LightbulbIcon />
                  <h2 className='text-2xl font-bold text-gray-900'>Conclusion</h2>
                </div>
                <div className="text-base md:text-lg leading-relaxed whitespace-pre-line text-gray-700">
                  {post.conclusion_content}
                </div>
              </div>
            )}

            <Comments postSlug={(await params).slug} initialComments={comments} />
          </div>
        </div>
      </div>
    </div>
  );
}
