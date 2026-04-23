'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleOAuth = async (provider: 'google' | 'apple') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <form onSubmit={handleLogin} className="w-full max-w-md">
      <h2 className="text-2xl font-bold text-navy-dark mb-1">Welcome back</h2>
      <p className="text-sm text-gray-500 mb-7">Sign in to access the community portal</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-base bg-white focus-navy transition-colors"
        />
      </div>

      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-base bg-white focus-navy transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-navy text-white font-semibold rounded-lg hover:bg-navy-light transition-colors disabled:opacity-60 mb-4"
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>

      <div className="flex items-center gap-3 my-4 text-gray-500 text-sm">
        <div className="flex-1 h-px bg-gray-300" />
        or continue with
        <div className="flex-1 h-px bg-gray-300" />
      </div>

      <button
        type="button"
        onClick={() => handleOAuth('google')}
        className="w-full mb-2.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <button
        type="button"
        onClick={() => handleOAuth('apple')}
        className="w-full py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.39.07 2.34.74 3.15.75.81.01 2.33-.91 3.91-.77 1.67.13 2.92.8 3.74 2.01-3.44 2.06-2.87 6.62.48 7.89-.58 1.67-1.36 3.31-3.28 5zm-3.3-17.25c.13 2.02-1.48 3.69-3.49 3.81-.21-1.96 1.52-3.73 3.49-3.81z"/>
        </svg>
        Continue with Apple
      </button>

      <p className="text-center text-sm text-gray-500 mt-5">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-navy font-semibold hover:underline">
          Request access
        </Link>
        {' · '}
        <Link href="/reset-password" className="text-navy font-semibold hover:underline">
          Forgot password?
        </Link>
      </p>
    </form>
  )
}
