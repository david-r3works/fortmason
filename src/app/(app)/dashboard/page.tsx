import { createClient } from '@/lib/supabase/server'
import type { Thread, Document, Correspondence, StatusItem, Meeting, User } from '@/lib/types'
import HeroBanner from '@/components/dashboard/HeroBanner'
import StatCards from '@/components/dashboard/StatCards'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import UpcomingEvents from '@/components/dashboard/UpcomingEvents'
import NeighborhoodSummary from '@/components/dashboard/NeighborhoodSummary'

export const metadata = { title: 'Dashboard — Fort Mason HOA' }
export const dynamic = 'force-dynamic'

type ActivityItem =
  | { kind: 'thread'; data: Thread & { author?: { full_name: string; role: string } | null }; ts: string }
  | { kind: 'doc'; data: Document; ts: string }
  | { kind: 'correspondence'; data: Correspondence & { sender?: { full_name: string } | null }; ts: string }

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const [
    { data: user },
    { count: threadCount },
    { count: docCount },
    { count: meetingCount },
    { count: memberCount },
    { data: recentThreads },
    { data: recentDocs },
    { data: recentCorrespondence },
    { data: upcomingMeetings },
    { data: statusItems },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', session!.user.id).single(),
    supabase.from('threads').select('*', { count: 'exact', head: true }),
    supabase.from('documents').select('*', { count: 'exact', head: true }),
    supabase.from('meetings').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('approved', true),
    supabase.from('threads').select('*, author:users(full_name, role)').order('created_at', { ascending: false }).limit(5),
    supabase.from('documents').select('*').order('created_at', { ascending: false }).limit(3),
    supabase.from('correspondence').select('*, sender:users(full_name)').order('created_at', { ascending: false }).limit(3),
    supabase.from('meetings').select('*').eq('status', 'upcoming').order('date', { ascending: true }).limit(3),
    supabase.from('status_items').select('*').order('category').limit(6),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activity: ActivityItem[] = [
    ...((recentThreads ?? []) as any[]).map((t) => ({ kind: 'thread' as const, data: t as Thread & { author?: { full_name: string; role: string } | null }, ts: t.created_at as string })),
    ...((recentDocs ?? []) as any[]).map((d) => ({ kind: 'doc' as const, data: d as Document, ts: d.created_at as string })),
    ...((recentCorrespondence ?? []) as any[]).map((c) => ({ kind: 'correspondence' as const, data: c as Correspondence & { sender?: { full_name: string } | null }, ts: c.created_at as string })),
  ].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()).slice(0, 6)

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-8">
      <HeroBanner userName={(user as User | null)?.full_name ?? 'there'} />

      <StatCards
        threadCount={threadCount ?? 0}
        docCount={docCount ?? 0}
        meetingCount={meetingCount ?? 0}
        memberCount={memberCount ?? 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <ActivityFeed items={activity} />
        <div className="flex flex-col gap-4">
          <UpcomingEvents meetings={(upcomingMeetings ?? []) as Meeting[]} />
          <NeighborhoodSummary items={(statusItems ?? []) as StatusItem[]} />
        </div>
      </div>
    </div>
  )
}
