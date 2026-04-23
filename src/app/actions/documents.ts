'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { DocumentCategory } from '@/lib/types'

export async function uploadDocument(formData: FormData) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Not authenticated' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: user } = await (supabase.from('users') as any).select('role').eq('id', session.user.id).single()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!user || !['board', 'admin'].includes((user as any).role)) return { error: 'Board member access required' }

  const file = formData.get('file') as File
  const name = formData.get('name') as string
  const category = formData.get('category') as DocumentCategory
  const year = parseInt(formData.get('year') as string, 10)
  const status = (formData.get('status') as string) || null

  if (!file || !name || !category || !year) return { error: 'All fields are required' }

  const path = `documents/${category}/${year}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadError) return { error: uploadError.message }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: dbError } = await (supabase.from('documents') as any).insert({
    name: name.trim(),
    category,
    year,
    file_path: path,
    file_size: file.size,
    status: status || null,
    uploaded_by: session.user.id,
  })

  if (dbError) {
    await supabase.storage.from('documents').remove([path])
    return { error: (dbError as Error).message }
  }

  revalidatePath('/documents')
  return { success: true }
}

export async function deleteDocument(id: string, filePath: string) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Not authenticated' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: user } = await (supabase.from('users') as any).select('role').eq('id', session.user.id).single()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!user || !['board', 'admin'].includes((user as any).role)) return { error: 'Board member access required' }

  await supabase.storage.from('documents').remove([filePath])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('documents') as any).delete().eq('id', id)
  if (error) return { error: (error as Error).message }

  revalidatePath('/documents')
  return { success: true }
}
