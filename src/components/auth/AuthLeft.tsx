export default function AuthLeft() {
  return (
    <div className="flex-1 hidden md:flex flex-col justify-center items-center px-10 py-16 text-white text-center auth-gradient">
      <div
        className="w-28 h-28 rounded-full flex items-center justify-center text-5xl mb-7"
        style={{
          background: 'rgba(255,255,255,.12)',
          border: '3px solid #c8a84b',
        }}
      >
        🏡
      </div>
      <h1 className="text-3xl font-bold mb-2 tracking-tight">
        Fort Mason<br />Landowners Association
      </h1>
      <p className="text-base opacity-75 max-w-xs leading-relaxed">
        Your community portal for neighborhood communications, resources, and governance.
      </p>
      <p
        className="mt-12 pt-8 text-xs opacity-60 italic max-w-[280px] leading-relaxed"
        style={{ borderTop: '1px solid rgba(255,255,255,.2)' }}
      >
        &ldquo;Building a stronger community together, one conversation at a time.&rdquo;
      </p>
    </div>
  )
}
