function ColumnSkeleton() {
  return (
    <div className="bg-white border border-[#e0ddd8] rounded-2xl p-6 shadow-[0_4px_32px_rgba(0,0,0,0.07)] flex flex-col gap-4 animate-pulse">
      <div className="h-4 bg-[#f2f0ed] rounded-full w-1/2" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-[#e0ddd8] rounded-xl p-3 space-y-2">
            <div className="h-4 bg-[#f2f0ed] rounded-full w-3/4" />
            <div className="h-3 bg-[#f2f0ed] rounded-full w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#f2f0ed]">
      <div className="max-w-[1080px] mx-auto px-10 max-md:px-5 py-10">
        {/* Header */}
        <div className="mb-10 animate-pulse">
          <div className="h-3 bg-[#e0ddd8] rounded-full w-20 mb-3" />
          <div className="h-10 bg-[#e0ddd8] rounded-full w-56" />
        </div>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ColumnSkeleton />
          <ColumnSkeleton />
          <ColumnSkeleton />
        </div>
      </div>
    </div>
  )
}
