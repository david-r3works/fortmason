'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, Menu, X } from 'lucide-react'
import { cn, getInitials, getAvatarColor } from '@/lib/utils'
import type { User } from '@/lib/types'
import UserDropdown from './UserDropdown'

const NAV_ITEMS = [
  { href: '/dashboard',  label: '🏠 Home' },
  { href: '/messages',   label: '💬 Message Board' },
  { href: '/documents',  label: '📁 Financial Docs' },
  { href: '/meetings',   label: '📋 Board Meetings' },
  { href: '/status',     label: '🏘️ Neighborhood' },
  { href: '/archive',    label: '🗄️ Archive' },
]

interface TopbarProps {
  user: User
}

export default function Topbar({ user }: TopbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) router.push(`/messages?q=${encodeURIComponent(search.trim())}`)
  }

  return (
    <>
      <nav
        className="sticky top-0 z-50 flex items-center px-6 h-[60px] text-white shadow-panel"
        style={{ background: '#1a3a5c' }}
      >
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 font-bold text-base tracking-tight text-white no-underline">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
            style={{ background: 'rgba(255,255,255,.15)', border: '2px solid #c8a84b' }}
          >
            🏡
          </div>
          <span className="hidden sm:block">Fort Mason HOA</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5 ml-8 flex-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3.5 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap no-underline',
                  active
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-white/80 hover:bg-white/12 hover:text-white'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm text-white/70"
            style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)' }}
          >
            <Search size={13} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search portal…"
              className="bg-transparent border-none outline-none text-white placeholder-white/60 text-sm w-36"
            />
          </form>

          {/* User pill */}
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full py-1 pl-1.5 pr-3.5 transition-colors"
            style={{ background: 'rgba(255,255,255,.12)' }}
          >
            <div
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-navy-dark',
                getAvatarColor(user.full_name)
              )}
            >
              {getInitials(user.full_name)}
            </div>
            <span className="text-sm font-medium">{user.full_name.split(' ')[0]}</span>
            <span className="text-[10px] opacity-70">▾</span>
          </button>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-1 rounded text-white/80 hover:text-white"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile nav */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 pt-[60px]"
          style={{ background: 'rgba(0,0,0,.5)' }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="text-white py-2"
            style={{ background: '#1a3a5c' }}
            onClick={(e) => e.stopPropagation()}
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center px-6 py-3 text-sm font-medium no-underline border-b',
                  pathname.startsWith(item.href)
                    ? 'bg-white/20 text-white'
                    : 'text-white/80',
                  'border-white/10'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* User dropdown */}
      <UserDropdown
        user={user}
        open={dropdownOpen}
        onClose={() => setDropdownOpen(false)}
      />
    </>
  )
}
