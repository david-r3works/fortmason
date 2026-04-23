import { createClient } from '@/lib/supabase/server'
import MeetingsClient from '@/components/meetings/MeetingsClient'
import type { Meeting, MeetingAttachment, Correspondence, User } from '@/lib/types'

export const metadata = { title: 'Board Meetings — Fort Mason HOA' }
export const dynamic = 'force-dynamic'

const BOARD_MEMBERS = [
  { name: 'Robert Henderson', role: 'President',       initials: 'RH', color: '#1a3a5c' },
  { name: 'Sandra Martinez',  role: 'Vice President',  initials: 'SM', color: '#5a7a5c' },
  { name: 'David Kim',        role: 'Treasurer',       initials: 'DK', color: '#c8a84b' },
  { name: 'Laura Peters',     role: 'Secretary',       initials: 'LP', color: '#7c3aed' },
  { name: 'Tom Callahan',     role: 'Member at Large', initials: 'TC', color: '#dc2626' },
]

export default async function MeetingsPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const [
    { data: rawUser },
    { data: rawMeetings },
    { data: rawCorrespondence },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', session!.user.id).single(),
    supabase.from('meetings').select('*, attachments:meeting_attachments(*)').order('date', { ascending: false }),
    supabase.from('correspondence').select('*, sender:users(full_name, role)').order('created_at', { ascending: false }).limit(10),
  ])

  const currentUser = rawUser as User
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meetingList = (rawMeetings ?? []) as any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const correspondenceList = (rawCorrespondence ?? []) as any[]

  const upcomingIds = meetingList.filter((m) => m.status === 'upcoming').map((m) => m.id as string)
  const { data: rawRsvps } = await supabase
    .from('meeting_rsvps')
    .select('meeting_id, user_id')
    .in('meeting_id', upcomingIds.length ? upcomingIds : ['00000000-0000-0000-0000-000000000000'])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rsvpList = (rawRsvps ?? []) as any[]
  const rsvpCounts: Record<string, number> = {}
  const userRsvps = new Set<string>()
  rsvpList.forEach((r) => {
    rsvpCounts[r.meeting_id] = (rsvpCounts[r.meeting_id] ?? 0) + 1
    if (r.user_id === session!.user.id) userRsvps.add(r.meeting_id as string)
  })

  const meetingsWithUrls = await Promise.all(
    meetingList.map(async (meeting) => {
      const attachmentsWithUrls = await Promise.all(
        ((meeting.attachments ?? []) as MeetingAttachment[]).map(async (att) => {
          const { data } = await supabase.storage.from('documents').createSignedUrl(att.file_path, 3600)
          return { ...att, signedUrl: data?.signedUrl ?? null }
        })
      )
      return {
        ...meeting,
        attachments: attachmentsWithUrls,
        rsvp_count: rsvpCounts[meeting.id] ?? 0,
        user_rsvped: userRsvps.has(meeting.id as string),
      }
    })
  )

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-8">
      <MeetingsClient
        meetings={meetingsWithUrls as (Meeting & { attachments: (MeetingAttachment & { signedUrl: string | null })[]; rsvp_count: number; user_rsvped: boolean })[]}
        correspondence={correspondenceList as (Correspondence & { sender?: User | null })[]}
        currentUser={currentUser}
        boardMembers={BOARD_MEMBERS}
      />
    </div>
  )
}
