import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/layout/Topbar'
import { ToastProvider } from '@/components/ui/Toast'
import type { User } from '@/lib/types'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const { data: rawUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  const user = rawUser as User | null

  if (!user) redirect('/login')

  if (!user.approved) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-navy-dark mb-3">Account Pending Approval</h1>
          <p className="text-gray-600 mb-4 leading-relaxed">
            Your account is awaiting approval from a board member. You&apos;ll receive an email at{' '}
            <strong>{user.email}</strong> once approved.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Questions? Email{' '}
            <a href="mailto:board@fortmason.info" className="text-navy font-semibold">
              board@fortmason.info
            </a>
          </p>
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="px-5 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-light transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-100">
        <Topbar user={user} />
        <main>{children}</main>
      </div>
    </ToastProvider>
  )
}
