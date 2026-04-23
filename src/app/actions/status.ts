'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { StatusLevel } from '@/lib/types'

export async function updateStatusItem(id: string, status: StatusLevel, description: string) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Not authenticated' }

  const { data: user } = await supabase.from('users').select('role').eq('id', session.user.id).single()
  if (!user || !['board', 'admin'].includes(user.role)) return { error: 'Board member access required' }

  const { error } = await supabase
    .from('status_items')
    .update({ status, description, updated_by: session.user.id, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/status')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function submitIssueReport(formData: FormData) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Not authenticated' }

  const body = formData.get('body') as string
  if (!body?.trim()) return { error: 'Please describe the issue' }

  const { error } = await supabase.from('issue_reports').insert({
    body: body.trim(),
    submitted_by: session.user.id,
  })

  if (error) return { error: error.message }

  revalidatePath('/status')
  return { success: true }
}
