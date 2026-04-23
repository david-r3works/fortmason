import AuthLeft from '@/components/auth/AuthLeft'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Reset Password — Fort Mason HOA' }

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen auth-gradient">
      <AuthLeft />
      <div className="flex-1 flex items-center justify-center p-10 bg-cream">
        <ResetPasswordForm />
      </div>
    </div>
  )
}
