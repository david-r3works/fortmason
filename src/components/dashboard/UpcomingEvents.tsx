import Link from 'next/link'
import type { Meeting } from '@/lib/types'

interface Props {
  meetings: Meeting[]
}

function MonthDay({ date }: { date: string }) {
  const d = new Date(date + 'T00:00:00')
  const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  const day = d.getDate()
  return (
    <div
      className="rounded-[10px] px-3 py-2 text-center min-w-[56px] flex-shrink-0 text-white"
      style={{ background: '#1a3a5c' }}
    >
      <div className="text-[10px] font-semibold opacity-80">{month}</div>
      <div className="text-xl font-bold leading-none">{day}</div>
    </div>
  )
}

export default function UpcomingEvents({ meetings }: Props) {
  return (
    <div className="bg-white rounded-card border border-gray-200 shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200">
        <span className="text-base font-bold text-gray-900">📅 Upcoming Events</span>
      </div>
      <div className="px-5">
        {meetings.length === 0 && (
          <p className="py-5 text-sm text-gray-500 text-center">No upcoming meetings scheduled.</p>
        )}
        {meetings.map((m) => (
          <div key={m.id} className="flex gap-3 py-3.5 border-b border-gray-200 last:border-0 items-start">
            <MonthDay date={m.date} />
            <div>
              <p className="text-sm font-semibold text-gray-900">{m.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">📋 {m.time} · {m.location}</p>
            </div>
          </div>
        ))}
        <Link
          href="/meetings"
          className="flex items-center justify-center py-3 text-sm text-navy font-semibold hover:underline no-underline"
        >
          View all meetings →
        </Link>
      </div>
    </div>
  )
}
