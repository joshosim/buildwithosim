import { Clock, LightbulbIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Comments from '@/components/Comments';
import NewsletterSignup from '@/components/blog/NewsletterSignup';
import Link from 'next/link';

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

  // Increment view count
  await supabase
    .from('posts')
    .update({ views: (post.views || 0) + 1 })
    .eq('id', post.id);

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
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/" className="hover:text-[#fdbe21]">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[#fdbe21]">Blog</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white">{post.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content */}
          <article className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
              
              <div className="flex items-center justify-center mb-6">
                <span className="text-sm text-gray-600 dark:text-gray-300">Published {formattedDate}</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold mb-6 text-center text-gray-900 dark:text-white">
                {post.title}
              </h1>

              {post.subtitle && (
                <div className="flex justify-center items-center mb-6 text-base md:text-lg leading-relaxed text-center text-gray-700 dark:text-gray-300">
                  {post.subtitle}
                </div>
              )}

              <div className="flex justify-center items-center mb-6">
                <span className="inline-block px-4 py-2 bg-[#fdbe21] text-white font-semibold rounded-full">
                  {category}
                </span>
              </div>
              
              <div className="flex justify-center gap-6 mb-8 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  <span className="text-sm">{readTime}</span>
                </div>
                {post.views && (
                  <>
                    <span>•</span>
                    <span className="text-sm">{post.views} views</span>
                  </>
                )}
              </div>

              {post.cover_image && (
                <div className="mb-8 rounded-xl overflow-hidden">
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-96 object-cover"
                  />
                </div>
              )}

              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                  Introduction
                </h2>

                <div className="prose lg:prose-xl text-[12px] text-justify md:text-[15px] leading-loose max-w-none mb-8 dark:prose-invert">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                      a({ href, children }: any) {
                        const isInternal = href?.startsWith('/');
                        return isInternal ? (
                          <Link href={href} className="text-[#fdbe21] hover:underline">
                            {children}
                          </Link>
                        ) : (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#fdbe21] hover:underline"
                          >
                            {children}
                          </a>
                        );
                      },
                      img({ src, alt }: any) {
                        return (
                          <figure className="my-8">
                            <img
                              src={src}
                              alt={alt}
                              className="w-full rounded-lg shadow-md"
                            />
                            {alt && (
                              <figcaption className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                                {alt}
                              </figcaption>
                            )}
                          </figure>
                        );
                      },
                    }}
                  >
                    {post.content}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Specific Info Section */}
              {post.specific_info && (
                <div className="mt-8 p-6 md:p-10 border-l-4 border-[#fdbe21] bg-gray-50 dark:bg-gray-700">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">💡 Key Takeaways</h3>
                  <div className="prose dark:prose-invert text-[12px] text-justify md:text-[15px] leading-loose">
                    <ReactMarkdown>{post.specific_info}</ReactMarkdown>
                  </div>

                  <div className='flex items-center gap-4 mt-4'>
                    <div className='h-12 w-12 rounded-full bg-amber-400' />
                    <div>
                      <h2 className="text-base font-bold text-gray-900 dark:text-white">Osim Uka</h2>
                      <h2 className="text-base italic text-gray-600 dark:text-gray-300">Software Engineer</h2>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Images Gallery */}
              {post.images && post.images.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Gallery</h2>
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
                <div className="mt-8 bg-green-50 dark:bg-green-900/20 p-6 md:p-10 rounded-xl border-l-4 border-green-500">
                  <div className="flex items-center gap-2 mb-4">
                    <LightbulbIcon className="text-green-600 dark:text-green-400" />
                    <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Conclusion</h2>
                  </div>
                  <div className="leading-loose text-[12px] text-justify md:text-[15px] whitespace-pre-line text-gray-700 dark:text-gray-300">
                    {post.conclusion_content}
                  </div>
                </div>
              )}

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Related Posts</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {relatedPosts.map((related: any) => (
                      <Link
                        key={related.id}
                        href={`/blog/${related.slug}`}
                        className="group"
                      >
                        {related.cover_image && (
                          <img
                            src={related.cover_image}
                            alt={related.title}
                            className="w-full h-40 object-cover rounded-lg mb-3 group-hover:opacity-90"
                          />
                        )}
                        <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#fdbe21]">
                          {related.title}
                        </h4>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mt-8">
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
                      href={`/blog/category/${cat.toLowerCase()}`}
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
