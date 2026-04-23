'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordForm() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password/update`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="text-5xl mb-4">📧</div>
        <h2 className="text-2xl font-bold text-navy-dark mb-3">Check your inbox</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          We sent a password reset link to <strong>{email}</strong>. Follow the link to choose a new password.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-2.5 bg-navy text-white font-semibold rounded-lg hover:bg-navy-light transition-colors"
        >
          Back to Sign In
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleReset} className="w-full max-w-md">
      <h2 className="text-2xl font-bold text-navy-dark mb-1">Reset your password</h2>
      <p className="text-sm text-gray-500 mb-7">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-5">
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

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-navy text-white font-semibold rounded-lg hover:bg-navy-light transition-colors disabled:opacity-60 mb-4"
      >
        {loading ? 'Sending…' : 'Send Reset Link'}
      </button>

      <p className="text-center text-sm text-gray-500">
        <Link href="/login" className="text-navy font-semibold hover:underline">
          ← Back to Sign In
        </Link>
      </p>
    </form>
  )
}
