'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email, subscribed_at: new Date().toISOString() }])

      if (error) {
        if (error.code === '23505') {
          toast.error('You are already subscribed!')
        } else {
          toast.error('Failed to subscribe. Please try again.')
        }
      } else {
        toast.success('Successfully subscribed! 🎉')
        setEmail('')
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-[#fdbe21] to-[#ff9a00] text-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-2">📧 Join BuildWithOsim</h3>
      <p className="text-sm mb-4 text-white/90">
        Get updates on BuildWithOsim.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded mb-3 text-gray-900"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-blue-500 font-semibold py-3 rounded hover:bg-gray-100 disabled:opacity-50"
        >
          {loading ? 'Subscribing...' : 'Subscribe Free'}
        </button>
      </form>
    </div>
  )
}
