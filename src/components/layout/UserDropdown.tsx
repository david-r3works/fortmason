'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getInitials, getAvatarColor } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { User } from '@/lib/types'

interface Props {
  user: User
  open: boolean
  onClose: () => void
}

export default function UserDropdown({ user, open, onClose }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (!open) return null

  const roleLabel = user.role === 'board' ? 'Board Member' : user.role === 'admin' ? 'Administrator' : 'Resident Member'

  return (
    <div
      ref={ref}
      className="fixed top-[60px] right-5 z-50 w-56 bg-white rounded-card shadow-modal border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3.5 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2.5 mb-1">
          <div
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0',
              getAvatarColor(user.full_name)
            )}
          >
            {getInitials(user.full_name)}
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">{user.full_name}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
        </div>
        <span className="inline-block text-[11px] font-semibold text-sage bg-green-50 rounded px-2 py-0.5">
          {roleLabel}
        </span>
      </div>

      {/* Items */}
      {[
        { icon: '⚙️', label: 'Profile Settings', href: '/profile' },
        { icon: '🔔', label: 'Notifications', href: '/notifications' },
        { icon: '📞', label: 'Contact Board', action: () => window.open('mailto:board@fortmason.info') },
      ].map((item) => (
        <button
          key={item.label}
          onClick={() => { onClose(); item.action?.() ?? router.push(item.href!) }}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-200 last:border-0 transition-colors text-left"
        >
          <span>{item.icon}</span>
          {item.label}
        </button>
      ))}

      <button
        onClick={handleSignOut}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
      >
        <span>🚪</span>
        Sign Out
      </button>
    </div>
  )
}
