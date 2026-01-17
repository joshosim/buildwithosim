'use client'

import { useEffect } from 'react'

interface ViewTrackerProps {
  postSlug: string
}

export default function ViewTracker({ postSlug }: ViewTrackerProps) {
  useEffect(() => {
    const trackView = async () => {
      const viewKey = `viewed_${postSlug}`
      const hasViewed = sessionStorage.getItem(viewKey)
      
      if (!hasViewed) {
        try {
          await fetch('/api/track-view', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ slug: postSlug }),
          })
          
          sessionStorage.setItem(viewKey, 'true')
        } catch (error) {
          console.error('Failed to track view:', error)
        }
      }
    }

    trackView()
  }, [postSlug])

  return null
}