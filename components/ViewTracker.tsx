'use client'

import { useEffect } from 'react'

interface ViewTrackerProps {
  postSlug: string
}

export default function ViewTracker({ postSlug }: ViewTrackerProps) {
  useEffect(() => {
    const trackView = async () => {
      try {
        await fetch('/api/track-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ slug: postSlug }),
        })
      } catch (error) {
        console.error('Failed to track view:', error)
      }
    }

    // Delay tracking to ensure user actually reads
    const timer = setTimeout(trackView, 5000) // 5 second delay
    
    return () => clearTimeout(timer)
  }, [postSlug])

  return null
}