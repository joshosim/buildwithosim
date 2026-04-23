import { Clock, LightbulbIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Comments from '@/components/Comments';
import NewsletterSignup from '@/components/blog/NewsletterSignup';
import Link from 'next/link';
import ViewTracker from '@/components/ViewTracker';
import EnhancedMarkdown from '@/components/EnhancedMarkdown';

interface Post {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  images?: string[];
  specific_info?: string;
  specific_info_title?: string;
  specific_info_author?: string;
  specific_info_role?: string;
  conclusion_content?: string;
  published_date: string;
  created_at: string;
  views?: number;
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

  if (error || !post) return null;

  return post;
}

async function getRelatedPosts(postId: string) {
  const { data } = await supabase
    .from('posts')
    .select('id, title, slug, cover_image, published_date')
    .neq('id', postId)
    .eq('published', true)
    .limit(3)
    .order('published_date', { ascending: false });

  return data || [];
}

async function getRecentPosts() {
  const { data } = await supabase
    .from('posts')
    .select('id, title, slug, cover_image, published_date')
    .eq('published', true)
    .limit(5)
    .order('published_date', { ascending: false });

  return data || [];
}

function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

async function getComments(slug: string) {
  const { data: allComments } = await supabase
    .from('comments')
    .select('*')
    .eq('post_slug', slug)
    .eq('approved', true)
    .order('created_at', { ascending: false });

  if (!allComments) return [];

  const commentIds = allComments.map(c => c.id);
  const { data: likes } = await supabase
    .from('comment_likes')
    .select('comment_id')
    .in('comment_id', commentIds);

  const likesCount: Record<string, number> = {};
  likes?.forEach(like => {
    likesCount[like.comment_id] = (likesCount[like.comment_id] || 0) + 1;
  });

  const commentsMap: Record<string, any> = {};
  const rootComments: any[] = [];

  allComments.forEach(comment => {
    const commentWithLikes = {
      ...comment,
      likes_count: likesCount[comment.id] || 0,
      user_has_liked: false,
      replies: []
    };
    commentsMap[comment.id] = commentWithLikes;
  });

  allComments.forEach(comment => {
    if (comment.parent_id) {
      if (commentsMap[comment.parent_id]) {
        commentsMap[comment.parent_id].replies.push(commentsMap[comment.id]);
      }
    } else {
      rootComments.push(commentsMap[comment.id]);
    }
  });

  return rootComments;
}

export default async function BlogDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const category = post.post_categories?.[0]?.categories?.name || 'General';
  const readTime = calculateReadTime(post.content);
  const formattedDate = formatDate(post.published_date);
  const comments = await getComments(slug);
  const relatedPosts = await getRelatedPosts(post.id);
  const recentPosts = await getRecentPosts();

  return (
    <div className="bg-black min-h-screen">
      <ViewTracker postSlug={slug} />
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/" className="hover:text-[#fdbe21]">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[#fdbe21]">Blog</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white truncate">{post.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* Main Content */}
          <article className="lg:col-span-8">
            {/* Header Section - No Container */}
            <div className="mb-6 md:mb-8">
              <div className="flex items-center justify-center mb-4 md:mb-6">
                <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Published {formattedDate}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-center text-gray-900 dark:text-white leading-tight">
                {post.title}
              </h1>

              {post.subtitle && (
                <div className="flex justify-center items-center mb-4 md:mb-6 text-sm sm:text-base md:text-lg leading-relaxed text-center text-gray-700 dark:text-gray-300 px-4">
                  {post.subtitle}
                </div>
              )}

              <div className="flex justify-center items-center mb-4 md:mb-6">
                <span className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-[#fdbe21] text-white font-semibold rounded-full text-sm md:text-base">
                  {category}
                </span>
              </div>

              <div className="flex justify-center gap-4 md:gap-6 mb-6 md:mb-8 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="md:w-[18px] md:h-[18px]" />
                  <span className="text-xs md:text-sm">{readTime}</span>
                </div>
                {post.views && (
                  <>
                    <span className="text-xs md:text-sm">•</span>
                    <span className="text-xs md:text-sm">{post.views} views</span>
                  </>
                )}
              </div>

              {post.cover_image && (
                <div className="mb-6 md:mb-8 rounded-lg md:rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Content - No Container */}
            <div className="mb-6 md:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-900 dark:text-white">
                Introduction
              </h2>

              <EnhancedMarkdown content={post.content} />
            </div>

            {/* Specific Info Section */}
            {post.specific_info && (
              <div className="mt-6 md:mt-8 p-4 md:p-6 lg:p-8 border-l-4 border-[#fdbe21] bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg md:rounded-xl">
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-lg md:text-xl">💡</span>
                  {post.specific_info_title || 'Key Takeaways'}
                </h3>
                <div className="prose prose-sm md:prose dark:prose-invert mb-4 md:mb-6">
                  <EnhancedMarkdown content={post.specific_info} />
                </div>
                <div className='flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg'>
                  <div className='h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-r from-[#fdbe21] to-[#ff9a00] flex items-center justify-center text-white font-bold text-sm md:text-base flex-shrink-0'>
                    {(post.specific_info_author || 'OU').split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm md:text-base font-bold text-gray-900 dark:text-white">
                      {post.specific_info_author || 'Osim Uka'}
                    </h4>
                    <p className="text-xs md:text-sm italic text-gray-600 dark:text-gray-300">
                      {post.specific_info_role || 'Software Engineer'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Images Gallery
            {post.images && post.images.length > 0 && (
              <div className="mt-6 md:mt-8">
                <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-900 dark:text-white">Gallery</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {post.images.map((image, index) => (
                    <div key={index} className="rounded-lg md:rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <img
                        src={image}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full h-48 md:h-64 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )} */}

            {/* Conclusion Section */}
            {post.conclusion_content && (
              <div className="mt-6 md:mt-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 md:p-6 lg:p-8 rounded-lg md:rounded-xl border-l-4 border-green-500">
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                  <LightbulbIcon className="text-green-600 dark:text-green-400 flex-shrink-0" size={20} />
                  <h3 className='text-lg md:text-2xl font-bold text-gray-900 dark:text-white'>Conclusion</h3>
                </div>
                <div className="prose prose-sm md:prose dark:prose-invert leading-relaxed text-gray-700 dark:text-gray-300">
                  <EnhancedMarkdown content={post.conclusion_content} />
                </div>
              </div>
            )}

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-900 dark:text-white">Related Posts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {relatedPosts.map((related: any) => (
                    <Link
                      key={related.id}
                      href={`/blog/${related.slug}`}
                      className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      {related.cover_image && (
                        <img
                          src={related.cover_image}
                          alt={related.title}
                          className="w-full h-32 md:h-40 object-cover group-hover:opacity-90 transition-opacity"
                        />
                      )}
                      <div className="p-3 md:p-4">
                        <h4 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white group-hover:text-[#fdbe21] line-clamp-2">
                          {related.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {/* Comments */}
            <div className="mt-6 md:mt-8">
              <Comments postSlug={slug} initialComments={comments} />
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-8 space-y-6">

              {/* Newsletter Signup */}
              <NewsletterSignup />

              {/* Recent Posts */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Recent Posts</h3>
                <div className="space-y-4">
                  {recentPosts.map((recent: any) => (
                    <Link
                      key={recent.id}
                      href={`/blog/${recent.slug}`}
                      className="flex gap-3 group"
                    >
                      {recent.cover_image && (
                        <img
                          src={recent.cover_image}
                          alt={recent.title}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#fdbe21] line-clamp-2">
                          {recent.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(recent.published_date).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Categories</h3>
                <div className="space-y-2">
                  {['Technology', 'Tutorial', 'AI', 'Development'].map(cat => (
                    <Link
                      key={cat}
                      href={`/blog/`}
                      // href={`/blog/category/${cat.toLowerCase()}`}
                      className="block px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
