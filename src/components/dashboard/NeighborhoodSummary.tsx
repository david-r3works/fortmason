import Link from 'next/link'
import { STATUS_COLORS } from '@/lib/utils'
import type { StatusItem } from '@/lib/types'

interface Props {
  items: StatusItem[]
}

export default function NeighborhoodSummary({ items }: Props) {
  return (
    <div className="bg-white rounded-card border border-gray-200 shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <span className="text-base font-bold text-gray-900">🏘️ Neighborhood Status</span>
        <Link
          href="/status"
          className="text-sm px-3 py-1.5 rounded-lg border border-navy text-navy font-semibold hover:bg-navy hover:text-white transition-colors no-underline"
        >
          Details
        </Link>
      </div>
      <div className="px-5 py-3">
        <div className="flex flex-col gap-2.5">
          {items.map((item) => {
            const { dot, label } = STATUS_COLORS[item.status]
            return (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{item.name}</span>
                <span className="flex items-center gap-1.5 text-gray-700">
                  <span className={`w-2 h-2 rounded-full ${dot}`} />
                  {label}
                </span>
              </div>
            )
          })}
          {items.length === 0 && (
            <p className="text-sm text-gray-500 py-2">No status data available.</p>
          )}
        </div>
      </div>
    </div>
  )
}
