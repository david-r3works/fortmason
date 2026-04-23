'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateStatusItem, submitIssueReport } from '@/app/actions/status'
import { STATUS_COLORS, cn } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import type { StatusItem, Project, User, StatusLevel } from '@/lib/types'

interface Props {
  facilities: StatusItem[]
  infrastructure: StatusItem[]
  projects: Project[]
  alerts: StatusItem[]
  warnings: StatusItem[]
  currentUser: User
}

function StatusRow({ item, isBoard, onEdit }: { item: StatusItem; isBoard: boolean; onEdit: (item: StatusItem) => void }) {
  const { bg, dot, text, label } = STATUS_COLORS[item.status]
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-gray-200 last:border-0">
      <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0', bg)}>
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full flex-shrink-0', dot)} />
          {item.name}
        </div>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.description}</p>
      </div>
      {isBoard && (
        <button
          onClick={() => onEdit(item)}
          className="text-xs text-gray-400 hover:text-navy flex-shrink-0 mt-0.5"
        >
          ✏️
        </button>
      )}
    </div>
  )
}

export default function StatusClient({ facilities, infrastructure, projects, alerts, warnings, currentUser }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, startTransition] = useTransition()
  const [editItem, setEditItem] = useState<StatusItem | null>(null)
  const [editStatus, setEditStatus] = useState<StatusLevel>('ok')
  const [editDesc, setEditDesc] = useState('')
  const [issueBody, setIssueBody] = useState('')
  const isBoard = currentUser.role === 'board' || currentUser.role === 'admin'

  const openEdit = (item: StatusItem) => {
    setEditItem(item)
    setEditStatus(item.status)
    setEditDesc(item.description)
  }

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editItem) return

    startTransition(async () => {
      const result = await updateStatusItem(editItem.id, editStatus, editDesc)
      if (result.error) toast(result.error, 'error')
      else { toast('Status updated!'); setEditItem(null); router.refresh() }
    })
  }

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('body', issueBody)

    startTransition(async () => {
      const result = await submitIssueReport(fd)
      if (result.error) toast(result.error, 'error')
      else { toast('✅ Issue reported — the board has been notified. Thank you!'); setIssueBody('') }
    })
  }

  const lastUpdated = [...facilities, ...infrastructure]
    .map((s) => new Date(s.updated_at))
    .sort((a, b) => b.getTime() - a.getTime())[0]

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-3xl font-bold text-navy-dark tracking-tight">🏘️ Neighborhood Status</h1>
          <p className="text-sm text-gray-500 mt-1">Live updates on community facilities, projects, and service notices</p>
        </div>
        {lastUpdated && (
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
          </p>
        )}
      </div>

      {/* Alert banners */}
      {alerts.map((a) => (
        <div key={a.id} className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <span className="text-xl flex-shrink-0">🚨</span>
          <div>
            <p className="text-sm font-bold text-gray-900">{a.name} — Alert</p>
            <p className="text-sm text-gray-700 mt-0.5">{a.description}</p>
          </div>
        </div>
      ))}
      {warnings.map((w) => (
        <div key={w.id} className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
          <span className="text-xl flex-shrink-0">⚠️</span>
          <div>
            <p className="text-sm font-bold text-gray-900">{w.name} — Work Scheduled</p>
            <p className="text-sm text-gray-700 mt-0.5">{w.description}</p>
          </div>
        </div>
      ))}

      {/* Status grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-white rounded-card border border-gray-200 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <span className="font-bold text-gray-900">🏊 Amenities & Facilities</span>
          </div>
          <div className="px-5">
            {facilities.map((item) => (
              <StatusRow key={item.id} item={item} isBoard={isBoard} onEdit={openEdit} />
            ))}
            {facilities.length === 0 && <p className="py-6 text-sm text-gray-500 text-center">No facility data.</p>}
          </div>
        </div>

        <div className="bg-white rounded-card border border-gray-200 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <span className="font-bold text-gray-900">🔧 Infrastructure & Services</span>
          </div>
          <div className="px-5">
            {infrastructure.map((item) => (
              <StatusRow key={item.id} item={item} isBoard={isBoard} onEdit={openEdit} />
            ))}
            {infrastructure.length === 0 && <p className="py-6 text-sm text-gray-500 text-center">No infrastructure data.</p>}
          </div>
        </div>
      </div>

      {/* Projects + Issue report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active projects */}
        <div className="bg-white rounded-card border border-gray-200 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <span className="font-bold text-gray-900">🏗️ Active Projects</span>
          </div>
          <div className="px-5">
            {projects.length === 0 && <p className="py-6 text-sm text-gray-500 text-center">No active projects.</p>}
            {projects.map((project) => (
              <div key={project.id} className="py-3.5 border-b border-gray-200 last:border-0">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-yellow-50 flex items-center justify-center text-base flex-shrink-0">
                    {project.status === 'active' ? '🏗️' : '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{project.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{project.description}</p>
                    {project.budget && (
                      <p className="text-xs text-gray-500">Budget: ${project.budget.toLocaleString()}</p>
                    )}
                    <div className="mt-2 progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${project.progress}%`,
                          background: project.progress < 30 ? '#c8a84b' : project.progress < 70 ? '#16a34a' : '#1a3a5c',
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">{project.progress}% complete</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map + Issue report */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-card border border-gray-200 shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <span className="font-bold text-gray-900">🗺️ Community Map</span>
            </div>
            <div className="p-5">
              <div className="w-full h-48 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center">
                <span className="text-5xl mb-2">🗺️</span>
                <p className="text-xs italic text-gray-500">Interactive map coming soon</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-card border border-gray-200 shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <span className="font-bold text-gray-900">📞 Report an Issue</span>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-gray-700 mb-3">See something that needs attention? Let the board know.</p>
              <form onSubmit={handleIssueSubmit}>
                <textarea
                  value={issueBody}
                  onChange={(e) => setIssueBody(e.target.value)}
                  placeholder="Describe the issue (location, nature of problem)…"
                  rows={3}
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus-navy resize-y"
                />
                <button
                  type="submit"
                  disabled={pending}
                  className="mt-2.5 w-full py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-light disabled:opacity-60 transition-colors"
                >
                  {pending ? 'Submitting…' : 'Submit Report'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Edit status modal (board only) */}
      {editItem && isBoard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-card w-full max-w-md shadow-modal">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <span className="font-bold text-gray-900">Update: {editItem.name}</span>
              <button onClick={() => setEditItem(null)} className="text-gray-500 hover:text-gray-900 text-xl">×</button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <div className="flex gap-2">
                  {(['ok', 'warn', 'alert'] as StatusLevel[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEditStatus(s)}
                      className={cn(
                        'flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors',
                        editStatus === s
                          ? s === 'ok' ? 'bg-green-500 text-white border-green-500'
                            : s === 'warn' ? 'bg-yellow-500 text-white border-yellow-500'
                            : 'bg-red-500 text-white border-red-500'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      )}
                    >
                      {s === 'ok' ? '✅ OK' : s === 'warn' ? '⚠️ Warn' : '🚨 Alert'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus-navy resize-y"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={pending} className="flex-1 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-light disabled:opacity-60 transition-colors">
                  {pending ? 'Saving…' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditItem(null)} className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
