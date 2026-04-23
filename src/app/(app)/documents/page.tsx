import { createClient } from '@/lib/supabase/server'
import DocumentsClient from '@/components/documents/DocumentsClient'
import type { Document, User } from '@/lib/types'

export const metadata = { title: 'Financial Documents — Fort Mason HOA' }
export const dynamic = 'force-dynamic'

export default async function DocumentsPage({ searchParams }: { searchParams: { q?: string; category?: string } }) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const { data: rawUser } = await supabase.from('users').select('*').eq('id', session!.user.id).single()
  const currentUser = rawUser as User

  let query = supabase.from('documents').select('*').order('created_at', { ascending: false })
  if (searchParams.category) query = query.eq('category', searchParams.category)
  if (searchParams.q) query = query.ilike('name', `%${searchParams.q}%`)

  const { data: rawDocs } = await query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawDocList = (rawDocs ?? []) as any[]

  const docs = await Promise.all(
    rawDocList.map(async (doc) => {
      const { data } = await supabase.storage.from('documents').createSignedUrl(doc.file_path as string, 3600)
      return { ...doc, signedUrl: data?.signedUrl ?? null }
    })
  )

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-8">
      <DocumentsClient
        documents={docs as (Document & { signedUrl: string | null })[]}
        currentUser={currentUser}
        searchQuery={searchParams.q}
        activeCategory={searchParams.category}
      />
    </div>
  )
}
