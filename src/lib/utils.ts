import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ThreadCategory, DocumentCategory, StatusLevel } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string, opts?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...opts,
  })
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return formatDate(dateStr, { month: 'short', day: 'numeric' })
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export const CATEGORY_LABELS: Record<ThreadCategory, string> = {
  announcements: '📢 Announcements',
  general: '💬 General Discussion',
  events: '🎉 Events & Activities',
  safety: '🛡️ Safety & Security',
  maintenance: '🔧 Maintenance & Repairs',
  classifieds: '🏷️ Buy / Sell / Trade',
}

export const CATEGORY_ICONS: Record<ThreadCategory, string> = {
  announcements: '📢',
  general: '💬',
  events: '🎉',
  safety: '🛡️',
  maintenance: '🔧',
  classifieds: '🏷️',
}

export const DOC_CATEGORY_LABELS: Record<DocumentCategory, { label: string; icon: string }> = {
  budgets:     { label: 'Annual Budgets',       icon: '📊' },
  reports:     { label: 'Financial Reports',    icon: '📈' },
  audits:      { label: 'Audits & Reviews',     icon: '🔍' },
  tax:         { label: 'Tax Filings',          icon: '🧾' },
  assessments: { label: 'Assessment Notices',   icon: '💵' },
  reserves:    { label: 'Reserve Studies',      icon: '🏦' },
}

export const STATUS_COLORS: Record<StatusLevel, { bg: string; dot: string; text: string; label: string }> = {
  ok:    { bg: 'bg-green-50',  dot: 'bg-green-500',  text: 'text-green-700',  label: 'Operational' },
  warn:  { bg: 'bg-yellow-50', dot: 'bg-yellow-500', text: 'text-yellow-700', label: 'Work Scheduled' },
  alert: { bg: 'bg-red-50',    dot: 'bg-red-500',    text: 'text-red-700',    label: 'Alert' },
}

const AVATAR_COLORS = [
  'bg-navy', 'bg-sage', 'bg-gold', 'bg-purple-700',
  'bg-red-600', 'bg-teal-600', 'bg-indigo-600', 'bg-pink-600',
]

export function getAvatarColor(name: string): string {
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
