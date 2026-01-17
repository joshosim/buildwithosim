'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'

interface AdminAuthProps {
  children: React.ReactNode
}

export default function AdminAuth({ children }: AdminAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const ADMIN_PASSWORD = 'buildwithosim2025' // Change this to your secure password

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setError('')
      // Store in sessionStorage so it persists during session
      sessionStorage.setItem('admin_authenticated', 'true')
    } else {
      setError('Invalid password')
    }
  }

  // Check if already authenticated
  if (typeof window !== 'undefined' && sessionStorage.getItem('admin_authenticated') === 'true') {
    return <>{children}</>
  }

  if (isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-[#fdbe21] rounded-full flex items-center justify-center mb-4">
            <Lock className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Access</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Enter password to access admin panel
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#fdbe21] focus:border-transparent"
              placeholder="Enter admin password"
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#fdbe21] hover:bg-[#ff9a00] text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Access Admin Panel
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Authorized personnel only
          </p>
        </div>
      </div>
    </div>
  )
}