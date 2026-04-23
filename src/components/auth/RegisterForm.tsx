'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterForm() {
  const supabase = createClient()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    propertyAddress: '',
    phone: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          property_address: form.propertyAddress,
          phone: form.phone,
        },
      },
    })

    if (error) {
      console.error('signUp error:', error)
      setError(`${error.message} (status: ${error.status})`)
      setLoading(false)
    } else {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-navy-dark mb-3">Request submitted!</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Thank you, {form.fullName.split(' ')[0]}! Your access request has been sent to the board.
          A board member will verify your residency and contact you within 2 business days.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Please check your email ({form.email}) to confirm your address first.
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
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <h2 className="text-2xl font-bold text-navy-dark mb-1">Request Portal Access</h2>
      <p className="text-sm text-gray-500 mb-7">
        Submit your information — a board member will verify your residency.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {(['fullName', 'email', 'propertyAddress', 'phone', 'password'] as const).map((field) => {
        const labels: Record<string, string> = {
          fullName: 'Full Name',
          email: 'Email Address',
          propertyAddress: 'Property Address',
          phone: 'Phone Number',
          password: 'Create Password',
        }
        const placeholders: Record<string, string> = {
          fullName: 'Jane Smith',
          email: 'jane@example.com',
          propertyAddress: '123 Fort Mason Dr',
          phone: '(555) 000-0000',
          password: '••••••••',
        }
        const types: Record<string, string> = {
          fullName: 'text', email: 'email', propertyAddress: 'text',
          phone: 'tel', password: 'password',
        }
        return (
          <div key={field} className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {labels[field]}
            </label>
            <input
              type={types[field]}
              value={form[field]}
              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              placeholder={placeholders[field]}
              required={field !== 'phone'}
              minLength={field === 'password' ? 8 : undefined}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-base bg-white focus-navy transition-colors"
            />
          </div>
        )
      })}

      <p className="text-xs text-gray-500 mb-5">
        Minimum 8-character password. You won&apos;t be able to log in until the board approves your account.
      </p>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-navy text-white font-semibold rounded-lg hover:bg-navy-light transition-colors disabled:opacity-60"
      >
        {loading ? 'Submitting…' : 'Submit Request'}
      </button>

      <p className="text-center text-sm text-gray-500 mt-5">
        Already have an account?{' '}
        <Link href="/login" className="text-navy font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
