import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ThreadDetailClient from '@/components/messages/ThreadDetailClient'
import type { Thread, Post, User } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { threadId: string } }) {
  const supabase = createClient()
  const { data } = await supabase.from('threads').select('title').eq('id', params.threadId).single()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const title = (data as any)?.title as string | undefined
  return { title: title ? `${title} — Fort Mason HOA` : 'Thread — Fort Mason HOA' }
}

export default async function ThreadPage({ params }: { params: { threadId: string } }) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const [{ data: rawThread }, { data: rawPosts }, { data: rawUser }] = await Promise.all([
    supabase.from('threads').select('*, author:users(full_name, role, email)').eq('id', params.threadId).single(),
    supabase.from('posts').select('*, author:users(full_name, role, email)').eq('thread_id', params.threadId).order('created_at', { ascending: true }),
    supabase.from('users').select('*').eq('id', session!.user.id).single(),
  ])

  if (!rawThread) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const thread = rawThread as any as (Thread & { author?: User | null })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const posts = (rawPosts ?? []) as any as (Post & { author?: User | null })[]
  const currentUser = rawUser as User

  // Increment view count (fire-and-forget)
  supabase.from('threads').update({ view_count: thread.view_count + 1 }).eq('id', params.threadId).then(() => {})

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-8">
      <ThreadDetailClient
        thread={thread}
        posts={posts}
        currentUser={currentUser}
      />
    </div>
  )
}
