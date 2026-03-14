'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-[#f2f0ed] flex items-center justify-center p-8">
      <div className="bg-white border border-[#e0ddd8] rounded-2xl p-10 max-w-md w-full text-center shadow-[0_4px_32px_rgba(0,0,0,0.07)]">
        <p className="font-['Unbounded'] text-[10px] font-bold tracking-[.18em] uppercase text-[#e8621a] mb-4">
          Something went wrong
        </p>
        <h1 className="font-['Unbounded'] font-black text-[28px] tracking-[-0.04em] text-[#1a1918] mb-3">
          Unexpected error
        </h1>
        <p className="font-['DM_Sans'] text-[14px] text-[#6b6762] mb-8 leading-relaxed">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <button
          onClick={reset}
          className="bg-[#e8621a] hover:bg-[#c9521a] text-white font-bold text-[13px] px-6 py-2.5 rounded-full transition-colors font-['DM_Sans']"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
