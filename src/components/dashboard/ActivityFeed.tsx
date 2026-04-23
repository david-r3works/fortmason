import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils'
import type { Thread, Document, Correspondence } from '@/lib/types'

type ActivityItem =
  | { kind: 'thread'; data: Thread & { author?: { full_name: string; role: string } | null }; ts: string }
  | { kind: 'doc'; data: Document; ts: string }
  | { kind: 'correspondence'; data: Correspondence & { sender?: { full_name: string } | null }; ts: string }

interface Props {
  items: ActivityItem[]
}

export default function ActivityFeed({ items }: Props) {
  return (
    <div className="bg-white rounded-card border border-gray-200 shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <span className="text-base font-bold text-gray-900">Recent Activity</span>
        <Link href="/messages" className="text-sm px-3 py-1.5 rounded-lg border border-navy text-navy font-semibold hover:bg-navy hover:text-white transition-colors no-underline">
          View All
        </Link>
      </div>
      <div className="px-5">
        {items.length === 0 && (
          <p className="py-6 text-sm text-gray-500 text-center">No recent activity.</p>
        )}
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 py-3.5 border-b border-gray-200 last:border-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
              style={{
                background: item.kind === 'thread' ? '#eff6ff' : item.kind === 'doc' ? '#f0fdf4' : '#fef9c3',
              }}
            >
              {item.kind === 'thread' ? '💬' : item.kind === 'doc' ? '📄' : '📧'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 leading-snug">
                {item.kind === 'thread' && (
                  <>
                    <strong className="text-gray-900">
                      {item.data.author?.full_name ?? 'Unknown'}
                    </strong>{' '}
                    posted &ldquo;
                    <Link href={`/messages/${item.data.id}`} className="text-navy hover:underline">
                      {item.data.title}
                    </Link>
                    &rdquo;
                  </>
                )}
                {item.kind === 'doc' && (
                  <>
                    New document:{' '}
                    <Link href="/documents" className="text-navy hover:underline font-semibold">
                      {item.data.name}
                    </Link>{' '}
                    uploaded
                  </>
                )}
                {item.kind === 'correspondence' && (
                  <>
                    <strong className="text-gray-900">Board:</strong>{' '}
                    {item.data.subject}
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{formatRelativeTime(item.ts)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
