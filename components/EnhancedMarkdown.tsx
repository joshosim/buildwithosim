import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink, Quote } from 'lucide-react'

interface EnhancedMarkdownProps {
  content: string
}

export default function EnhancedMarkdown({ content }: EnhancedMarkdownProps) {
  return (
    <div className="prose prose-sm sm:prose md:prose-lg lg:prose-xl max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 dark:prose-strong:text-white prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-ol:text-gray-700 dark:prose-ol:text-gray-300 prose-li:marker:text-blue-500 prose-blockquote:border-l-[#fdbe21] prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800/50 prose-blockquote:p-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic">
      <ReactMarkdown
        components={{
          // Enhanced code blocks
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <div className="relative">
                <div className="absolute top-2 right-2 text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                  {match[1]}
                </div>
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-lg"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            )
          },

          // Enhanced links
          a({ href, children }: any) {
            const isInternal = href?.startsWith('/')
            const isEmail = href?.startsWith('mailto:')
            
            if (isInternal) {
              return (
                <Link href={href} className="text-blue-500 hover:underline font-medium">
                  {children}
                </Link>
              )
            }
            
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline font-medium inline-flex items-center gap-1"
              >
                {children}
                {!isEmail && <ExternalLink size={14} className="opacity-70" />}
              </a>
            )
          },

          // Enhanced images with captions
          img({ src, alt }: any) {
            return (
              <div className="my-6 md:my-8">
                <div className="relative rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={src}
                    alt={alt || 'Blog image'}
                    className="w-full object-cover"
                    loading="lazy"
                  />
                </div>
                {alt && (
                  <span className="block text-center text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-3 italic">
                    {alt}
                  </span>
                )}
              </div>
            )
          },

          // Enhanced headings with anchor links
          h1({ children }: any) {
            const id = String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
            return (
              <h1 id={id} className="text-2xl md:text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-white scroll-mt-20">
                {children}
              </h1>
            )
          },
          h2({ children }: any) {
            const id = String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
            return (
              <h2 id={id} className="text-xl md:text-2xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white scroll-mt-20">
                {children}
              </h2>
            )
          },
          h3({ children }: any) {
            const id = String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
            return (
              <h3 id={id} className="text-lg md:text-xl font-semibold mt-5 mb-2 text-gray-900 dark:text-white scroll-mt-20">
                {children}
              </h3>
            )
          },

          // Enhanced lists
          ul({ children }: any) {
            return (
              <ul className="space-y-2 my-4">
                {children}
              </ul>
            )
          },
          ol({ children }: any) {
            return (
              <ol className="space-y-2 my-4">
                {children}
              </ol>
            )
          },
          li({ children }: any) {
            return (
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1.5 text-xs">•</span>
                <span className="flex-1">{children}</span>
              </li>
            )
          },

          // Enhanced blockquotes
          blockquote({ children }: any) {
            return (
              <blockquote className="border-l-4 border-blue-500 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 md:p-6 my-6 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <Quote className="text-blue-500 mt-1 flex-shrink-0" size={20} />
                  <div className="text-gray-700 dark:text-gray-300 italic">
                    {children}
                  </div>
                </div>
              </blockquote>
            )
          },

          // Enhanced tables
          table({ children }: any) {
            return (
              <div className="overflow-x-auto my-6">
                <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  {children}
                </table>
              </div>
            )
          },
          th({ children }: any) {
            return (
              <th className="bg-gray-100 dark:bg-gray-800 px-4 py-3 text-left font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                {children}
              </th>
            )
          },
          td({ children }: any) {
            return (
              <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                {children}
              </td>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}