'use client'

import { useEffect } from 'react'

/**
 * Adds `.active` to every `.reveal` element as it scrolls into view.
 *
 * Re-scans whenever `deps` change. That matters for filtered lists: cards
 * rendered *after* a search would otherwise never be observed, and because
 * `.reveal` starts at `opacity: 0` they would stay permanently invisible.
 *
 * Only un-activated elements are observed, so an element is never re-hidden by
 * a later scan.
 */
export function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>('.reveal:not(.active)')
    )
    if (elements.length === 0) return

    // Without IntersectionObserver, show everything rather than nothing.
    if (typeof IntersectionObserver === 'undefined') {
      elements.forEach((element) => element.classList.add('active'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('active')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
