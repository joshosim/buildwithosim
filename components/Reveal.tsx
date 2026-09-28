'use client'

import { useReveal } from '@/hooks/useReveal'

/**
 * Drives the scroll reveal animation for a server-rendered page.
 *
 * Renders nothing — it exists so pages whose content comes from the server can
 * stay Server Components while the animation stays client-side.
 */
export default function Reveal() {
  useReveal()
  return null
}
