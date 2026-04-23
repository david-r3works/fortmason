import AuthLeft from '@/components/auth/AuthLeft'
import LoginForm from '@/components/auth/LoginForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Sign In — Fort Mason HOA' }

export default function LoginPage() {
  return (
    <div className="flex min-h-screen auth-gradient">
      <AuthLeft />
      <div className="flex-1 flex items-center justify-center p-10 bg-cream">
        <LoginForm />
      </div>
    </div>
  )
}
