import Link from 'next/link'

export const metadata = { title: 'Archive — Fort Mason HOA' }

const SNAPSHOTS = [
  { year: '2024', url: 'https://web.archive.org/web/2024/http://fortmason.info/', label: 'Most Recent (2024)' },
  { year: '2023', url: 'https://web.archive.org/web/2023/http://fortmason.info/', label: '2023' },
  { year: '2022', url: 'https://web.archive.org/web/2022/http://fortmason.info/', label: '2022' },
  { year: '2021', url: 'https://web.archive.org/web/2021/http://fortmason.info/', label: '2021' },
  { year: '2015', url: 'https://web.archive.org/web/2015/http://fortmason.info/', label: '2015' },
]

export default function ArchivePage() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-8">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-navy-dark tracking-tight">🗄️ Website Archive</h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse previous versions of fortmason.info, preserved via the Internet Archive (archive.org)
        </p>
      </div>

      {/* Archive banner */}
      <div
        className="rounded-card p-8 text-white mb-6 flex items-start gap-5"
        style={{ background: 'linear-gradient(135deg, #4a3728 0%, #6b5344 100%)' }}
      >
        <div className="text-5xl flex-shrink-0">📚</div>
        <div>
          <h3 className="text-xl font-bold mb-2">Previous Site — fortmason.info (Archived)</h3>
          <p className="text-sm opacity-80 leading-relaxed mb-4 max-w-2xl">
            This portal is the new home of fortmason.info. The previous version of this website has been preserved on
            the Wayback Machine (archive.org). All prior pages are browsable in their original form, including past
            announcements, documents, and contact information.
          </p>
          <div className="flex gap-2 flex-wrap">
            <a
              href="https://web.archive.org/web/*/fortmason.info"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold no-underline transition-colors text-white"
              style={{ background: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.4)' }}
            >
              🌐 Open in Wayback Machine
            </a>
            <a
              href="https://web.archive.org/web/2024/http://fortmason.info/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold no-underline transition-colors text-white"
              style={{ background: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.4)' }}
            >
              📷 Browse Most Recent Snapshot
            </a>
          </div>
        </div>
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Snapshot list */}
        <div className="bg-white rounded-card border border-gray-200 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <span className="font-bold text-gray-900">📅 Archive Snapshots</span>
          </div>
          <div className="px-5">
            {SNAPSHOTS.map((s) => (
              <div key={s.year} className="flex gap-3 py-3.5 border-b border-gray-200 last:border-0">
                <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center text-base flex-shrink-0">📷</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{s.label}</p>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-navy hover:underline"
                  >
                    Browse → fortmason.info ({s.year})
                  </a>
                </div>
              </div>
            ))}
            <div className="flex gap-3 py-3.5">
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-base flex-shrink-0">🗓️</div>
              <div>
                <p className="text-sm font-semibold text-gray-900">All Available Snapshots</p>
                <a
                  href="https://web.archive.org/web/*/fortmason.info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-navy hover:underline"
                >
                  View full archive calendar →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* About this site */}
        <div className="bg-white rounded-card border border-gray-200 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <span className="font-bold text-gray-900">ℹ️ About This Site</span>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              This portal is the official, redesigned home of <strong>fortmason.info</strong>. The previous version of
              the site served the Fort Mason community for many years and is preserved in full on the Wayback Machine.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              This new portal adds member login, a community message board, financial transparency, board meeting
              records, and real-time neighborhood status — all at the same address you already know.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              If you need content from the previous site that is not yet available here, please{' '}
              <strong>contact the board</strong> and we will help migrate it.
            </p>
            <a
              href="mailto:board@fortmason.info"
              className="inline-flex items-center gap-2 px-4 py-2 border border-navy text-navy text-sm font-semibold rounded-lg hover:bg-navy hover:text-white transition-colors no-underline"
            >
              📧 Contact Board
            </a>
          </div>
        </div>
      </div>

      {/* Simulated old-site preview */}
      <div className="bg-white rounded-card border border-gray-200 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <span className="font-bold text-gray-900">🔭 Preview: Archived Site (Simulated)</span>
          <a
            href="https://web.archive.org/web/*/fortmason.info"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-3 py-1.5 rounded-lg border border-navy text-navy font-semibold hover:bg-navy hover:text-white transition-colors no-underline"
          >
            Open Real Archive ↗
          </a>
        </div>
        <div className="p-0">
          {/* Browser chrome */}
          <div className="bg-gray-200 px-4 py-2.5 flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
            </div>
            <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-500 font-mono">
              https://web.archive.org/web/20231015/http://fortmason.info/
            </div>
          </div>
          {/* Old site content */}
          <div className="bg-white">
            <div className="bg-[#003366] px-5 py-4 text-white">
              <h2 className="text-xl font-serif">Fort Mason Landowners Association</h2>
              <p className="text-xs opacity-80 mt-1">Serving the Fort Mason Community since 1987</p>
            </div>
            <div className="bg-[#336699] flex">
              {['Home', 'About Us', 'News', 'Documents', 'Board', 'Contact'].map((item) => (
                <span key={item} className="px-3.5 py-2 text-sm text-white cursor-default hover:bg-white/15 border-r border-white/20">
                  {item}
                </span>
              ))}
            </div>
            <div className="p-6">
              <h3 className="text-base font-bold text-[#003366] mb-2">Welcome to the Fort Mason Landowners Association</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                The Fort Mason Landowners Association is dedicated to preserving and enhancing our neighborhood&apos;s
                character, maintaining common areas, and fostering a strong sense of community among our residents.
              </p>
              <h3 className="text-base font-bold text-[#003366] mb-2">Latest Announcements</h3>
              <p className="text-sm text-gray-700 mb-1">• Annual Meeting scheduled for January 2024 — all members encouraged to attend.</p>
              <p className="text-sm text-gray-700 mb-1">• Annual assessments due January 31. Payment instructions mailed December 1.</p>
              <p className="text-sm text-gray-700">• Holiday light display contest — judging December 20.</p>
              <p className="text-xs text-gray-400 mt-5 pt-4 border-t border-gray-200 italic">
                This is a reconstructed preview for illustration purposes. Click &ldquo;Open Real Archive&rdquo; above to browse actual archived content on archive.org.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
