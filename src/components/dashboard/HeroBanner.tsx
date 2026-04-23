import Link from 'next/link'

interface Props {
  userName: string
}

export default function HeroBanner({ userName }: Props) {
  const firstName = userName.split(' ')[0]

  return (
    <div
      className="rounded-card p-8 text-white mb-7 flex items-center justify-between overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #234d7a 100%)' }}
    >
      <div className="relative z-10">
        <h2 className="text-2xl font-bold mb-1.5">Welcome back, {firstName}! 👋</h2>
        <p className="text-sm opacity-80 max-w-lg leading-relaxed">
          Stay up to date with what&apos;s happening in the Fort Mason community.
        </p>
        <div className="flex gap-2.5 mt-4 flex-wrap">
          <Link
            href="/messages"
            className="px-4 py-2 rounded-lg text-sm font-bold text-navy-dark no-underline transition-colors"
            style={{ background: '#c8a84b' }}
          >
            View Message Board
          </Link>
          <Link
            href="/status"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white no-underline transition-colors"
            style={{ background: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.4)' }}
          >
            Neighborhood Status
          </Link>
        </div>
      </div>
      <div
        className="absolute right-8 top-1/2 -translate-y-1/2 text-[120px] opacity-15 pointer-events-none select-none"
        aria-hidden
      >
        🏘️
      </div>
    </div>
  )
}
