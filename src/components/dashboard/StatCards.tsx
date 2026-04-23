interface Props {
  threadCount: number
  docCount: number
  meetingCount: number
  memberCount: number
}

const stats = (p: Props) => [
  { icon: '💬', label: 'Message Board Posts', value: p.threadCount, bg: '#eff6ff' },
  { icon: '📁', label: 'Financial Documents',  value: p.docCount,    bg: '#f0fdf4' },
  { icon: '📋', label: 'Meeting Records',       value: p.meetingCount, bg: '#fef9c3' },
  { icon: '👥', label: 'Registered Members',    value: p.memberCount,  bg: '#fce7f3' },
]

export default function StatCards(props: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
      {stats(props).map((s) => (
        <div key={s.label} className="bg-white rounded-card p-5 border border-gray-200 shadow-card">
          <div
            className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xl mb-3"
            style={{ background: s.bg }}
          >
            {s.icon}
          </div>
          <div className="text-3xl font-bold text-gray-900">{s.value.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  )
}
