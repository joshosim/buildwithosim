'use client'

import { useState } from 'react'
import { Bold, Italic, Link2, Image, List, Code, Quote } from 'lucide-react'

interface BlogEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
}

export default function BlogEditor({ initialContent = '', onChange }: BlogEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [preview, setPreview] = useState(false)

  const handleContentChange = (value: string) => {
    setContent(value)
    onChange?.(value)
  }

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    const newContent = 
      content.substring(0, start) + 
      before + selectedText + after + 
      content.substring(end)
    
    handleContentChange(newContent)
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  const toolbarButtons = [
    { icon: Bold, label: 'Bold', action: () => insertMarkdown('**', '**') },
    { icon: Italic, label: 'Italic', action: () => insertMarkdown('*', '*') },
    { icon: Link2, label: 'Link', action: () => insertMarkdown('[', '](https://example.com)') },
    { icon: Image, label: 'Image', action: () => insertMarkdown('![Alt text](', ')') },
    { icon: List, label: 'List', action: () => insertMarkdown('- ') },
    { icon: Code, label: 'Code', action: () => insertMarkdown('`', '`') },
    { icon: Quote, label: 'Quote', action: () => insertMarkdown('> ') },
  ]

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 p-2 flex items-center gap-1">
        {toolbarButtons.map((button, index) => (
          <button
            key={index}
            onClick={button.action}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title={button.label}
          >
            <button.icon size={16} />
          </button>
        ))}
        
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setPreview(false)}
            className={`px-3 py-1 text-sm rounded ${!preview ? 'bg-[#fdbe21] text-white' : 'text-gray-600 dark:text-gray-400'}`}
          >
            Edit
          </button>
          <button
            onClick={() => setPreview(true)}
            className={`px-3 py-1 text-sm rounded ${preview ? 'bg-[#fdbe21] text-white' : 'text-gray-600 dark:text-gray-400'}`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {!preview ? (
          <textarea
            id="content-editor"
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full h-[400px] p-4 border-none outline-none resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            placeholder="Write your blog post in Markdown..."
          />
        ) : (
          <div className="p-4 prose max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }} />
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-600 p-3 text-xs text-gray-600 dark:text-gray-400">
        <strong>Markdown Tips:</strong> 
        **bold** | *italic* | [link](url) | ![image](url) | `code` | &gt; quote | - list item | ## heading
      </div>
    </div>
  )
}