'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createThread } from '@/app/actions/threads'
import { CATEGORY_LABELS, CATEGORY_ICONS, formatDate, getInitials, getAvatarColor, cn } from '@/lib/utils'
import type { Thread, User, ThreadCategory } from '@/lib/types'

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ThreadCategory[]

interface Props {
  threads: (Thread & { author?: User | null; post_count: number })[]
  currentUser: User
  searchQuery?: string
}

export default function MessagesClient({ threads, currentUser, searchQuery }: Props) {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<ThreadCategory | 'all'>('all')
  const [showNewForm, setShowNewForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [newCategory, setNewCategory] = useState<ThreadCategory>('general')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const filtered = activeCategory === 'all'
    ? threads
    : threads.filter((t) => t.category === activeCategory)

  const counts: Record<string, number> = { all: threads.length }
  CATEGORIES.forEach((c) => { counts[c] = threads.filter((t) => t.category === c).length })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const fd = new FormData()
    fd.append('title', newTitle)
    fd.append('body', newBody)
    fd.append('category', newCategory)

    startTransition(async () => {
      const result = await createThread(fd)
      if (result.error) {
        setError(result.error)
      } else {
        setShowNewForm(false)
        setNewTitle(''); setNewBody(''); setNewCategory('general')
        router.refresh()
      }
    })
  }

  const isBoard = currentUser.role === 'board' || currentUser.role === 'admin'

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-3xl font-bold text-navy-dark tracking-tight">💬 Message Board</h1>
          <p className="text-sm text-gray-500 mt-1">Community discussions, announcements, and neighbor conversations</p>
          {searchQuery && (
            <p className="text-sm text-navy mt-1">
              Showing results for &ldquo;<strong>{searchQuery}</strong>&rdquo;
              {' — '}
              <button onClick={() => router.push('/messages')} className="text-navy underline">clear</button>
            </p>
          )}
        </div>
        <button
          onClick={() => setShowNewForm((v) => !v)}
          className="px-4 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-light transition-colors"
        >
          + New Post
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-5">
        {/* Category sidebar */}
        <div className="bg-white rounded-card border border-gray-200 shadow-card h-fit">
          <div className="px-5 py-4 border-b border-gray-200">
            <span className="font-bold text-gray-900">Categories</span>
          </div>
          <div className="p-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={cn(
                'w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition-all',
                activeCategory === 'all' ? 'bg-navy text-white font-semibold' : 'text-gray-700 hover:bg-cream hover:text-navy'
              )}
            >
              <span>📌 All Posts</span>
              <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full', activeCategory === 'all' ? 'bg-white/30 text-white' : 'bg-gold text-navy-dark')}>
                {counts.all}
              </span>
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition-all',
                  activeCategory === cat ? 'bg-navy text-white font-semibold' : 'text-gray-700 hover:bg-cream hover:text-navy'
                )}
              >
                <span>{CATEGORY_LABELS[cat]}</span>
                <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full', activeCategory === cat ? 'bg-white/30 text-white' : 'bg-gold text-navy-dark')}>
                  {counts[cat]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Thread list */}
        <div className="bg-white rounded-card border border-gray-200 shadow-card overflow-hidden">
          {/* New thread form */}
          {showNewForm && (
            <form onSubmit={handleSubmit} className="p-5 bg-cream border-b border-gray-200">
              <div className="font-bold text-navy mb-3">Create New Post</div>
              {error && <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Post title…"
                required
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus-navy mb-2.5"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ThreadCategory)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus-navy mb-2.5"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
              <textarea
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                placeholder="Write your message…"
                required
                rows={4}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus-navy resize-y"
              />
              <div className="flex gap-2 mt-2.5">
                <button type="submit" disabled={pending} className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-light disabled:opacity-60 transition-colors">
                  {pending ? 'Posting…' : 'Post'}
                </button>
                <button type="button" onClick={() => setShowNewForm(false)} className="px-4 py-2 bg-white text-navy border border-navy text-sm font-semibold rounded-lg hover:bg-navy hover:text-white transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-500 text-sm">
              No posts in this category yet.
            </div>
          )}

          {filtered.map((thread) => (
            <Link
              key={thread.id}
              href={`/messages/${thread.id}`}
              className="block px-5 py-4 border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors no-underline"
            >
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  {thread.pinned && <span className="text-xs text-gold font-bold">📌 PINNED</span>}
                  {thread.locked && <span className="text-xs text-gray-500">🔒</span>}
                  {thread.title}
                </div>
                <div className="text-xs text-gray-500 whitespace-nowrap">{formatDate(thread.created_at, { month: 'short', day: 'numeric' })}</div>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 mb-2">{thread.body}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>💬 {thread.post_count} {thread.post_count === 1 ? 'reply' : 'replies'}</span>
                <span>👁️ {thread.view_count} views</span>
                {thread.author && (
                  <span className="text-gray-500">
                    by {thread.author.full_name}
                  </span>
                )}
                <span className="ml-auto">
                  <span className="inline-block bg-cream-dark text-navy text-[11px] font-semibold px-2 py-0.5 rounded-full">
                    {CATEGORY_ICONS[thread.category]} {thread.category.charAt(0).toUpperCase() + thread.category.slice(1)}
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
