'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function rsvpMeeting(meetingId: string) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Not authenticated' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('meeting_rsvps') as any)
    .insert({ meeting_id: meetingId, user_id: session.user.id })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((error as any)?.code === '23505') return { error: 'Already RSVPed' }
  if (error) return { error: (error as Error).message }

  revalidatePath('/meetings')
  return { success: true }
}

export async function cancelRsvp(meetingId: string) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Not authenticated' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('meeting_rsvps') as any)
    .delete()
    .eq('meeting_id', meetingId)
    .eq('user_id', session.user.id)

  if (error) return { error: (error as Error).message }

  revalidatePath('/meetings')
  return { success: true }
}

export async function subscribeMeetingNotifications() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Not authenticated' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('notification_subscriptions') as any)
    .upsert({ user_id: session.user.id, meetings: true, announcements: true })

  if (error) return { error: (error as Error).message }
  return { success: true }
}

export async function uploadMeetingAttachment(formData: FormData) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Not authenticated' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: user } = await (supabase.from('users') as any).select('role').eq('id', session.user.id).single()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!user || !['board', 'admin'].includes((user as any).role)) return { error: 'Board member access required' }

  const file = formData.get('file') as File
  const meetingId = formData.get('meetingId') as string
  const label = formData.get('label') as string

  const path = `meetings/${meetingId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
  const { error: uploadError } = await supabase.storage.from('documents').upload(path, file, { contentType: file.type })
  if (uploadError) return { error: uploadError.message }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('meeting_attachments') as any).insert({
    meeting_id: meetingId,
    label: label || file.name,
    file_path: path,
  })
  if (error) return { error: (error as Error).message }

  revalidatePath('/meetings')
  return { success: true }
}

export async function sendCorrespondence(formData: FormData) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Not authenticated' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: user } = await (supabase.from('users') as any).select('role').eq('id', session.user.id).single()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!user || !['board', 'admin'].includes((user as any).role)) return { error: 'Board member access required' }

  const subject = formData.get('subject') as string
  const body = formData.get('body') as string
  if (!subject?.trim() || !body?.trim()) return { error: 'Subject and body are required' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('correspondence') as any).insert({
    subject: subject.trim(),
    body: body.trim(),
    sent_by: session.user.id,
  })
  if (error) return { error: (error as Error).message }

  revalidatePath('/meetings')
  return { success: true }
}
