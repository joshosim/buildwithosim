'use client'

import { useState } from 'react'
import BlogEditor from '@/components/BlogEditor'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import AdminAuth from '@/components/AdminAuth'
import Link from 'next/link'

export default function AdminPage() {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    slug: '',
    content: '',
    specific_info: '',
    specific_info_title: 'Key Takeaways',
    specific_info_author: 'Osim Uka',
    specific_info_role: 'Software Engineer',
    conclusion_content: '',
    cover_image: '',
    meta_description: '',
    seo_keywords: '',
    published: false
  })

  const [loading, setLoading] = useState(false)

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const keywords = formData.seo_keywords.split(',').map(k => k.trim()).filter(k => k)
      
      const { error } = await supabase
        .from('posts')
        .insert({
          ...formData,
          seo_keywords: keywords,
          published_date: new Date().toISOString().split('T')[0],
          reading_time: Math.ceil(formData.content.split(' ').length / 200)
        })

      if (error) throw error

      toast.success('Blog post created successfully!')
      setFormData({
        title: '',
        subtitle: '',
        slug: '',
        content: '',
        specific_info: '',
        specific_info_title: 'Key Takeaways',
        specific_info_author: 'Osim Uka',
        specific_info_role: 'Software Engineer',
        conclusion_content: '',
        cover_image: '',
        meta_description: '',
        seo_keywords: '',
        published: false
      })
    } catch (error) {
      toast.error('Failed to create blog post')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminAuth>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create New Blog Post
            </h1>
            <Link
              href="/admin/manage"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Manage Posts
            </Link>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Subtitle
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Cover Image URL
              </label>
              <input
                type="url"
                value={formData.cover_image}
                onChange={(e) => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Main Content</h2>
            <BlogEditor
              initialContent={formData.content}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
            />
          </div>

          {/* Additional Sections */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Additional Sections</h2>
            
            <div className="space-y-6">
              {/* Key Takeaways Section */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Key Takeaways Section</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={formData.specific_info_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, specific_info_title: e.target.value }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="Key Takeaways"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Author Name
                    </label>
                    <input
                      type="text"
                      value={formData.specific_info_author}
                      onChange={(e) => setFormData(prev => ({ ...prev, specific_info_author: e.target.value }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="Osim Uka"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Author Role
                    </label>
                    <input
                      type="text"
                      value={formData.specific_info_role}
                      onChange={(e) => setFormData(prev => ({ ...prev, specific_info_role: e.target.value }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="Software Engineer"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Content
                  </label>
                  <BlogEditor
                    initialContent={formData.specific_info}
                    onChange={(content) => setFormData(prev => ({ ...prev, specific_info: content }))}
                  />
                </div>
              </div>

              {/* Conclusion Section */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Conclusion
                </label>
                <BlogEditor
                  initialContent={formData.conclusion_content}
                  onChange={(content) => setFormData(prev => ({ ...prev, conclusion_content: content }))}
                />
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">SEO Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Meta Description
                </label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  rows={3}
                  maxLength={160}
                  placeholder="Brief description for search engines (max 160 characters)"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.meta_description.length}/160 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  SEO Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.seo_keywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo_keywords: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="react, javascript, web development, tutorial"
                />
              </div>
            </div>
          </div>

          {/* Publish Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                className="w-4 h-4 text-[#fdbe21] border-gray-300 rounded focus:ring-[#fdbe21]"
              />
              <label htmlFor="published" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Publish immediately
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#fdbe21] hover:bg-[#ff9a00] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Blog Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </AdminAuth>
  )
}