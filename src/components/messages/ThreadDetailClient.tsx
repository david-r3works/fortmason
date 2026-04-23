'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createPost, likePost, togglePinThread, toggleLockThread } from '@/app/actions/threads'
import { formatDate, getInitials, getAvatarColor, CATEGORY_ICONS, cn } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import type { Thread, Post, User } from '@/lib/types'

interface Props {
  thread: Thread & { author?: User | null }
  posts: (Post & { author?: User | null })[]
  currentUser: User
}

function Avatar({ user }: { user: User | null | undefined }) {
  if (!user) return (
    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">?</div>
  )
  return (
    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0', getAvatarColor(user.full_name))}>
      {getInitials(user.full_name)}
    </div>
  )
}

export default function ThreadDetailClient({ thread, posts, currentUser }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [replyBody, setReplyBody] = useState('')
  const [pending, startTransition] = useTransition()
  const [localPosts, setLocalPosts] = useState(posts)
  const isBoard = currentUser.role === 'board' || currentUser.role === 'admin'

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyBody.trim()) return

    const fd = new FormData()
    fd.append('threadId', thread.id)
    fd.append('body', replyBody.trim())

    startTransition(async () => {
      const result = await createPost(fd)
      if (result.error) {
        toast(result.error, 'error')
      } else {
        setReplyBody('')
        router.refresh()
        toast('Reply posted!')
      }
    })
  }

  const handleLike = async (postId: string) => {
    setLocalPosts((prev) =>
      prev.map((p) => p.id === postId ? { ...p, like_count: p.like_count + 1 } : p)
    )
    await likePost(postId)
  }

  const handlePin = async () => {
    const result = await togglePinThread(thread.id, !thread.pinned)
    if (result.error) toast(result.error, 'error')
    else { toast(thread.pinned ? 'Thread unpinned' : 'Thread pinned'); router.refresh() }
  }

  const handleLock = async () => {
    const result = await toggleLockThread(thread.id, !thread.locked)
    if (result.error) toast(result.error, 'error')
    else { toast(thread.locked ? 'Thread unlocked' : 'Thread locked'); router.refresh() }
  }

  return (
    <>
      <div className="mb-5">
        <Link href="/messages" className="text-sm text-navy hover:underline no-underline">← Back to Message Board</Link>
      </div>

      <div className="bg-white rounded-card border border-gray-200 shadow-card overflow-hidden">
        {/* Thread header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {thread.pinned && <span className="text-xs font-bold text-gold">📌 PINNED</span>}
                {thread.locked && <span className="text-xs font-semibold text-gray-500">🔒 LOCKED</span>}
                <span className="inline-block bg-cream-dark text-navy text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  {CATEGORY_ICONS[thread.category]} {thread.category.charAt(0).toUpperCase() + thread.category.slice(1)}
                </span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">{thread.title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Posted by {thread.author?.full_name ?? 'Unknown'} · {formatDate(thread.created_at)} · {thread.view_count} views
              </p>
            </div>
            {isBoard && (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={handlePin}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:border-navy hover:text-navy transition-colors"
                >
                  {thread.pinned ? 'Unpin' : '📌 Pin'}
                </button>
                <button
                  onClick={handleLock}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:border-navy hover:text-navy transition-colors"
                >
                  {thread.locked ? '🔓 Unlock' : '🔒 Lock'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Original post */}
        <div className="px-6 pt-5 pb-3 border-b border-gray-200">
          <div className="flex gap-3.5">
            <Avatar user={thread.author} />
            <div className="flex-1">
              <div className="text-sm">
                <span className="font-bold text-gray-900">{thread.author?.full_name ?? 'Unknown'}</span>
                {thread.author?.role !== 'resident' && (
                  <span className="ml-2 text-sage font-semibold text-xs capitalize">{thread.author?.role}</span>
                )}
                <span className="ml-2 text-xs text-gray-500">{formatDate(thread.created_at, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
              </div>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{thread.body}</p>
            </div>
          </div>
        </div>

        {/* Replies */}
        {localPosts.length > 0 && (
          <div className="divide-y divide-gray-200">
            {localPosts.map((post) => (
              <div key={post.id} className="px-6 py-4">
                <div className="flex gap-3.5">
                  <Avatar user={post.author} />
                  <div className="flex-1">
                    <div className="text-sm">
                      <span className="font-bold text-gray-900">{post.author?.full_name ?? 'Unknown'}</span>
                      {post.author?.role !== 'resident' && (
                        <span className="ml-2 text-sage font-semibold text-xs capitalize">{post.author?.role}</span>
                      )}
                      <span className="ml-2 text-xs text-gray-500">{formatDate(post.created_at, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{post.body}</p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-navy px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                      >
                        👍 {post.like_count > 0 && post.like_count}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reply box */}
        {!thread.locked ? (
          <div className="px-6 py-5 bg-gray-50 border-t border-gray-200">
            <form onSubmit={handleReply}>
              <textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Write a reply…"
                rows={3}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus-navy resize-y"
              />
              <div className="flex gap-2 mt-2.5">
                <button
                  type="submit"
                  disabled={pending || !replyBody.trim()}
                  className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-light disabled:opacity-50 transition-colors"
                >
                  {pending ? 'Posting…' : 'Post Reply'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500 text-center">
            🔒 This thread has been locked and is no longer accepting replies.
          </div>
        )}
      </div>
    </>
  )
}
