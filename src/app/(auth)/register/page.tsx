import AuthLeft from '@/components/auth/AuthLeft'
import RegisterForm from '@/components/auth/RegisterForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Request Access — Fort Mason HOA' }

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen auth-gradient">
      <AuthLeft />
      <div className="flex-1 flex items-center justify-center p-10 bg-cream overflow-y-auto">
        <RegisterForm />
      </div>
    </div>
  )
}
