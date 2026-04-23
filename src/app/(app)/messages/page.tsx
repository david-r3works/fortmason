import { createClient } from '@/lib/supabase/server'
import MessagesClient from '@/components/messages/MessagesClient'
import type { Thread, User } from '@/lib/types'

export const metadata = { title: 'Message Board — Fort Mason HOA' }
export const dynamic = 'force-dynamic'

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string }
}) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const { data: rawUser } = await supabase.from('users').select('*').eq('id', session!.user.id).single()
  const currentUser = rawUser as User

  let query = supabase
    .from('threads')
    .select('*, author:users(full_name, role, email)')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (searchParams.q) {
    query = query.or(`title.ilike.%${searchParams.q}%,body.ilike.%${searchParams.q}%`)
  }

  const { data: rawThreads } = await query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const threads = (rawThreads ?? []) as any[]

  const threadIds = threads.map((t) => t.id as string)
  const { data: rawPostCounts } = await supabase
    .from('posts')
    .select('thread_id')
    .in('thread_id', threadIds.length ? threadIds : ['00000000-0000-0000-0000-000000000000'])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const postCounts = (rawPostCounts ?? []) as any[]
  const countMap: Record<string, number> = {}
  postCounts.forEach((p) => {
    countMap[p.thread_id] = (countMap[p.thread_id] ?? 0) + 1
  })

  const enriched = threads.map((t) => ({
    ...t,
    post_count: countMap[t.id] ?? 0,
  })) as (Thread & { author?: User | null; post_count: number })[]

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-8">
      <MessagesClient
        threads={enriched}
        currentUser={currentUser}
        searchQuery={searchParams.q}
      />
    </div>
  )
}
