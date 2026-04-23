import { createClient } from '@/lib/supabase/server'
import StatusClient from '@/components/status/StatusClient'
import type { StatusItem, Project, User } from '@/lib/types'

export const metadata = { title: 'Neighborhood Status — Fort Mason HOA' }
export const dynamic = 'force-dynamic'

export default async function StatusPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const [
    { data: rawUser },
    { data: rawStatus },
    { data: rawProjects },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', session!.user.id).single(),
    supabase.from('status_items').select('*').order('category').order('name'),
    supabase.from('projects').select('*').neq('status', 'completed').order('created_at', { ascending: false }),
  ])

  const currentUser = rawUser as User
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const statusItems = (rawStatus ?? []) as any[] as StatusItem[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projects = (rawProjects ?? []) as any[] as Project[]

  const facilities = statusItems.filter((s) => s.category === 'facilities')
  const infrastructure = statusItems.filter((s) => s.category === 'infrastructure')
  const alerts = statusItems.filter((s) => s.status === 'alert')
  const warnings = statusItems.filter((s) => s.status === 'warn')

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-8">
      <StatusClient
        facilities={facilities}
        infrastructure={infrastructure}
        projects={projects}
        alerts={alerts}
        warnings={warnings}
        currentUser={currentUser}
      />
    </div>
  )
}
