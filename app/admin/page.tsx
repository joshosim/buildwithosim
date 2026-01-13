'use client';

import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  published_date: string;
}

export default function AdminPage() {
  const [title, setTitle] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [specificInfo, setSpecificInfo] = useState<string>('');
  const [conclusionContent, setConclusionContent] = useState<string>('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [images, setImages] = useState<string>('');
  const [publishedDate, setPublishedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, []);

  const fetchCategories = async (): Promise<void> => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (data) setCategories(data);
  };

  const fetchPosts = async (): Promise<void> => {
    const { data } = await supabase
      .from('posts')
      .select('id, title, slug, published, published_date')
      .order('published_date', { ascending: false })
      .limit(10);

    if (data) setPosts(data);
  };

  const handleCategoryToggle = (categoryId: string): void => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    // Parse images JSON
    let imagesArray: string[] = [];
    if (images.trim()) {
      try {
        imagesArray = JSON.parse(images);
      } catch (err) {
        alert('Invalid images JSON format');
        setLoading(false);
        return;
      }
    }

    // Insert post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert([
        {
          title,
          subtitle,
          slug,
          content,
          specific_info: specificInfo,
          conclusion_content: conclusionContent,
          cover_image: coverImage,
          images: imagesArray,
          published_date: publishedDate,
          published: true,
        },
      ])
      .select()
      .single();

    if (postError) {
      alert('Error creating post: ' + postError.message);
      setLoading(false);
      return;
    }

    // Insert post-category relationships
    if (selectedCategories.length > 0 && post) {
      const postCategories = selectedCategories.map((catId) => ({
        post_id: post.id,
        category_id: catId,
      }));

      const { error: catError } = await supabase
        .from('post_categories')
        .insert(postCategories);

      if (catError) {
        alert('Error adding categories: ' + catError.message);
      }
    }

    alert('Post created successfully!');

    // Reset form
    setTitle('');
    setSubtitle('');
    setSlug('');
    setContent('');
    setSpecificInfo('');
    setConclusionContent('');
    setCoverImage('');
    setImages('');
    setSelectedCategories([]);
    setPublishedDate(new Date().toISOString().split('T')[0]);

    // Refresh posts list
    fetchPosts();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-400">Create and manage blog posts</p>
          <Link
            href="/blog"
            className="inline-block mt-4 text-[#fdbe21] hover:text-[#e5ab1e] font-semibold"
          >
            ← View Blog
          </Link>
        </div>

        {/* Recent Posts Section */}
        {posts.length > 0 && (
          <div className="mb-12 bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">Recent Posts</h2>
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
                >
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{post.title}</h3>
                    <p className="text-slate-400 text-sm">
                      /{post.slug} • {new Date(post.published_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${post.published
                          ? 'bg-green-900 text-green-200'
                          : 'bg-yellow-900 text-yellow-200'
                        }`}
                    >
                      {post.published ? '✓ Published' : 'Draft'}
                    </span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="px-3 py-1 rounded-lg bg-[#fdbe21] text-slate-900 text-xs font-semibold hover:bg-[#e5ab1e] transition"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Post Form */}
        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Create New Post</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-slate-200 mb-2">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#fdbe21] transition"
                placeholder="Enter post title"
                required
              />
            </div>

            {/* Subtitle */}
            <div>
              <label htmlFor="subtitle" className="block text-sm font-semibold text-slate-200 mb-2">
                Subtitle
              </label>
              <input
                id="subtitle"
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#fdbe21] transition"
                placeholder="Optional subtitle"
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-semibold text-slate-200 mb-2">
                Slug (URL) <span className="text-red-400">*</span>
              </label>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#fdbe21] transition"
                placeholder="my-first-post"
                required
              />
              <p className="text-xs text-slate-400 mt-1">URL: /blog/{slug || 'slug-here'}</p>
            </div>

            {/* Published Date */}
            <div>
              <label htmlFor="publishedDate" className="block text-sm font-semibold text-slate-200 mb-2">
                Published Date <span className="text-red-400">*</span>
              </label>
              <input
                id="publishedDate"
                type="date"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-[#fdbe21] transition"
                required
              />
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">
                Categories
              </label>
              <div className="flex flex-wrap gap-3">
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => handleCategoryToggle(cat.id)}
                      className="w-4 h-4 accent-[#fdbe21] cursor-pointer"
                    />
                    <span className="text-sm text-slate-200">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <label htmlFor="coverImage" className="block text-sm font-semibold text-slate-200 mb-2">
                Cover Image URL
              </label>
              <input
                id="coverImage"
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#fdbe21] transition"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Additional Images */}
            <div>
              <label htmlFor="images" className="block text-sm font-semibold text-slate-200 mb-2">
                Additional Images (JSON array)
              </label>
              <input
                id="images"
                type="text"
                value={images}
                onChange={(e) => setImages(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#fdbe21] transition font-mono text-sm"
                placeholder='["https://image1.jpg", "https://image2.jpg"]'
              />
              <p className="text-xs text-slate-400 mt-1">
                Format: ["url1", "url2", ...]
              </p>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-semibold text-slate-200 mb-2">
                Content (Markdown) <span className="text-red-400">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#fdbe21] transition font-mono text-sm h-64"
                placeholder="Write your main content here using Markdown..."
                required
              />
            </div>

            {/* Specific Info */}
            <div>
              <label htmlFor="specificInfo" className="block text-sm font-semibold text-slate-200 mb-2">
                Specific Info (Markdown)
              </label>
              <textarea
                id="specificInfo"
                value={specificInfo}
                onChange={(e) => setSpecificInfo(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#fdbe21] transition font-mono text-sm h-32"
                placeholder="Key points, tips, or important information..."
              />
            </div>

            {/* Conclusion */}
            <div>
              <label htmlFor="conclusion" className="block text-sm font-semibold text-slate-200 mb-2">
                Conclusion (Markdown)
              </label>
              <textarea
                id="conclusion"
                value={conclusionContent}
                onChange={(e) => setConclusionContent(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#fdbe21] transition font-mono text-sm h-32"
                placeholder="Wrap up your post..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#fdbe21] to-[#e5ab1e] text-slate-900 px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-[#fdbe21]/50 disabled:opacity-50 font-bold transition duration-300"
            >
              {loading ? 'Creating Post...' : 'Create Post'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}