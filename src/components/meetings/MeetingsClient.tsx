'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { rsvpMeeting, cancelRsvp, subscribeMeetingNotifications, sendCorrespondence } from '@/app/actions/meetings'
import { formatDate, formatRelativeTime, cn } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import type { Meeting, MeetingAttachment, Correspondence, User } from '@/lib/types'

interface BoardMember { name: string; role: string; initials: string; color: string }

type MeetingWithExtras = Meeting & {
  attachments: (MeetingAttachment & { signedUrl: string | null })[]
  rsvp_count: number
  user_rsvped: boolean
}

interface Props {
  meetings: MeetingWithExtras[]
  correspondence: (Correspondence & { sender?: User | null })[]
  currentUser: User
  boardMembers: BoardMember[]
}

export default function MeetingsClient({ meetings, correspondence, currentUser, boardMembers }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, startTransition] = useTransition()
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all')
  const [showCorrespForm, setShowCorrespForm] = useState(false)
  const [correspForm, setCorrespForm] = useState({ subject: '', body: '' })
  const isBoard = currentUser.role === 'board' || currentUser.role === 'admin'

  const upcomingMeeting = meetings.find((m) => m.status === 'upcoming')
  const filtered = meetings.filter((m) => yearFilter === 'all' || new Date(m.date).getFullYear() === yearFilter)
  const years = Array.from(new Set(meetings.map((m) => new Date(m.date).getFullYear()))).sort((a, b) => b - a)

  const handleRsvp = (meeting: MeetingWithExtras) => {
    startTransition(async () => {
      if (meeting.user_rsvped) {
        const result = await cancelRsvp(meeting.id)
        if (result.error) toast(result.error, 'error')
        else { toast('RSVP cancelled'); router.refresh() }
      } else {
        const result = await rsvpMeeting(meeting.id)
        if (result.error) toast(result.error, 'error')
        else { toast('📩 RSVP recorded — see you there!'); router.refresh() }
      }
    })
  }

  const handleSubscribe = () => {
    startTransition(async () => {
      const result = await subscribeMeetingNotifications()
      if (result.error) toast(result.error, 'error')
      else toast('🔔 You\'re subscribed to meeting notifications!')
    })
  }

  const handleSendCorrespondence = (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('subject', correspForm.subject)
    fd.append('body', correspForm.body)

    startTransition(async () => {
      const result = await sendCorrespondence(fd)
      if (result.error) toast(result.error, 'error')
      else {
        toast('📧 Correspondence sent to all members!')
        setShowCorrespForm(false)
        setCorrespForm({ subject: '', body: '' })
        router.refresh()
      }
    })
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-3xl font-bold text-navy-dark tracking-tight">📋 Board Meeting Communications</h1>
          <p className="text-sm text-gray-500 mt-1">Agendas, minutes, notices, and board correspondence</p>
        </div>
        <button
          onClick={handleSubscribe}
          disabled={pending}
          className="px-4 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-light transition-colors disabled:opacity-60"
        >
          🔔 Subscribe to Notices
        </button>
      </div>

      {/* Upcoming meeting alert */}
      {upcomingMeeting && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
          <span className="text-xl flex-shrink-0">📅</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900 mb-1">
              Next Board Meeting: {formatDate(upcomingMeeting.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} — {upcomingMeeting.time}
            </p>
            <p className="text-sm text-gray-600 mb-3">
              {upcomingMeeting.location}. Members may submit agenda items to{' '}
              <a href="mailto:board@fortmason.info" className="text-navy hover:underline">board@fortmason.info</a>.
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleRsvp(upcomingMeeting)}
                disabled={pending}
                className={cn(
                  'px-4 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-60',
                  upcomingMeeting.user_rsvped
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-navy text-white hover:bg-navy-light'
                )}
              >
                {upcomingMeeting.user_rsvped ? '✅ RSVPed' : 'RSVP to Attend'}
              </button>
              {upcomingMeeting.rsvp_count > 0 && (
                <span className="px-3 py-2 text-sm text-gray-600">
                  {upcomingMeeting.rsvp_count} member{upcomingMeeting.rsvp_count !== 1 ? 's' : ''} attending
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Board correspondence form (board only) */}
      {isBoard && (
        <div className="mb-5">
          <button
            onClick={() => setShowCorrespForm((v) => !v)}
            className="px-4 py-2 border border-navy text-navy text-sm font-semibold rounded-lg hover:bg-navy hover:text-white transition-colors"
          >
            📧 Send Board Correspondence
          </button>
          {showCorrespForm && (
            <form onSubmit={handleSendCorrespondence} className="mt-3 p-4 bg-cream rounded-lg border border-cream-dark">
              <input
                value={correspForm.subject}
                onChange={(e) => setCorrespForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="Subject…"
                required
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus-navy mb-2.5"
              />
              <textarea
                value={correspForm.body}
                onChange={(e) => setCorrespForm((f) => ({ ...f, body: e.target.value }))}
                placeholder="Message to all members…"
                required
                rows={3}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus-navy resize-y"
              />
              <div className="flex gap-2 mt-2.5">
                <button type="submit" disabled={pending} className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-light disabled:opacity-60 transition-colors">
                  Send to All Members
                </button>
                <button type="button" onClick={() => setShowCorrespForm(false)} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Meeting list */}
      <div className="bg-white rounded-card border border-gray-200 shadow-card mb-5 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <span className="font-bold text-gray-900">Board Communications & Meeting Records</span>
          <select
            value={String(yearFilter)}
            onChange={(e) => setYearFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus-navy"
          >
            <option value="all">All Years</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {filtered.map((meeting) => {
          const d = new Date(meeting.date + 'T00:00:00')
          const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
          const day = d.getDate()

          return (
            <div key={meeting.id} className="flex gap-4 px-5 py-5 border-b border-gray-200 last:border-0 items-start">
              <div
                className="rounded-[10px] px-3 py-2 text-center min-w-[56px] flex-shrink-0 text-white"
                style={{ background: meeting.status === 'upcoming' ? '#1a3a5c' : '#6b7280' }}
              >
                <div className="text-[10px] font-semibold opacity-80">{month}</div>
                <div className="text-2xl font-bold leading-none">{day}</div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-base font-bold text-gray-900 mb-1">
                  {meeting.title}
                  {meeting.status === 'upcoming' && (
                    <span className="ml-2 bg-green-100 text-green-700 text-[11px] font-bold px-2 py-0.5 rounded-full">UPCOMING</span>
                  )}
                </div>
                <div className="flex gap-4 text-sm text-gray-500 flex-wrap mb-3">
                  <span>🕖 {meeting.time}</span>
                  <span>📍 {meeting.location}</span>
                </div>
                {meeting.attachments && meeting.attachments.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {(meeting.attachments as (MeetingAttachment & { signedUrl: string | null })[]).map((att) => (
                      <a
                        key={att.id}
                        href={att.signedUrl ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cream border border-cream-dark rounded-lg text-xs font-medium text-navy hover:bg-navy hover:text-white hover:border-navy transition-all no-underline"
                      >
                        📄 {att.label}
                      </a>
                    ))}
                  </div>
                )}
                {meeting.status === 'upcoming' && (
                  <div className="mt-3">
                    <button
                      onClick={() => handleRsvp(meeting)}
                      disabled={pending}
                      className={cn(
                        'text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-60',
                        meeting.user_rsvped
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-navy/10 text-navy hover:bg-navy hover:text-white'
                      )}
                    >
                      {meeting.user_rsvped ? '✅ RSVPed' : 'RSVP'}
                    </button>
                    {meeting.rsvp_count > 0 && (
                      <span className="ml-2 text-xs text-gray-500">{meeting.rsvp_count} attending</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-500">No meetings found.</div>
        )}
      </div>

      {/* Two-column: correspondence + board panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Correspondence feed */}
        <div className="bg-white rounded-card border border-gray-200 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <span className="font-bold text-gray-900">📧 Board Correspondence</span>
          </div>
          <div className="px-5">
            {correspondence.length === 0 && (
              <p className="py-6 text-sm text-gray-500 text-center">No correspondence yet.</p>
            )}
            {correspondence.map((c) => (
              <div key={c.id} className="flex gap-3 py-3.5 border-b border-gray-200 last:border-0">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-base flex-shrink-0">📧</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{c.subject}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatRelativeTime(c.created_at)} · From: {c.sender?.full_name ?? 'Board'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Board members panel */}
        <div className="bg-white rounded-card border border-gray-200 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <span className="font-bold text-gray-900">👥 Current Board</span>
          </div>
          <div className="px-5 py-4">
            <div className="flex flex-col gap-3.5">
              {boardMembers.map((bm) => (
                <div key={bm.name} className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: bm.color }}
                  >
                    {bm.initials}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{bm.name}</div>
                    <div className="text-xs font-semibold" style={{ color: '#5a7a5c' }}>{bm.role}</div>
                  </div>
                </div>
              ))}
            </div>
            <a
              href="mailto:board@fortmason.info"
              className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 border border-navy text-navy text-sm font-semibold rounded-lg hover:bg-navy hover:text-white transition-colors no-underline"
            >
              📧 Contact the Board
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
