'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ThreadCategory } from '@/lib/types'

export async function createThread(formData: FormData) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Not authenticated' }

  const title = formData.get('title') as string
  const body = formData.get('body') as string
  const category = formData.get('category') as ThreadCategory

  if (!title?.trim() || !body?.trim() || !category) {
    return { error: 'All fields are required' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('threads') as any)
    .insert({ title: title.trim(), body: body.trim(), category, author_id: session.user.id })
    .select()
    .single()

  if (error) return { error: (error as Error).message }

  revalidatePath('/messages')
  return { data }
}

export async function createPost(formData: FormData) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Not authenticated' }

  const threadId = formData.get('threadId') as string
  const body = formData.get('body') as string

  if (!body?.trim()) return { error: 'Reply cannot be empty' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('posts') as any)
    .insert({ thread_id: threadId, body: body.trim(), author_id: session.user.id })
    .select()
    .single()

  if (error) return { error: (error as Error).message }

  revalidatePath(`/messages/${threadId}`)
  return { data }
}

export async function likePost(postId: string) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Not authenticated' }

  // Manual increment since we don't have a stored procedure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: post } = await (supabase.from('posts') as any).select('like_count').eq('id', postId).single()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('posts') as any).update({ like_count: ((post as any)?.like_count ?? 0) + 1 }).eq('id', postId)

  return { success: true }
}

export async function togglePinThread(threadId: string, pinned: boolean) {
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('threads') as any).update({ pinned }).eq('id', threadId)
  if (error) return { error: (error as Error).message }
  revalidatePath('/messages')
  return { success: true }
}

export async function toggleLockThread(threadId: string, locked: boolean) {
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('threads') as any).update({ locked }).eq('id', threadId)
  if (error) return { error: (error as Error).message }
  revalidatePath('/messages')
  return { success: true }
}
