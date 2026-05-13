function CardSkeleton() {
  return (
    <div className="bg-white border border-[#e0ddd8] rounded-2xl p-6 shadow-[0_4px_32px_rgba(0,0,0,0.07)] flex flex-col gap-3 animate-pulse">
      <div className="h-3 bg-[#f2f0ed] rounded-full w-1/3" />
      <div className="h-5 bg-[#f2f0ed] rounded-full w-4/5" />
      <div className="h-4 bg-[#f2f0ed] rounded-full w-full" />
      <div className="h-4 bg-[#f2f0ed] rounded-full w-2/3" />
      <div className="flex gap-2 mt-1">
        <div className="h-5 bg-[#f2f0ed] rounded-full w-16" />
        <div className="h-5 bg-[#f2f0ed] rounded-full w-20" />
      </div>
    </div>
  )
}

export default function ExploreLoading() {
  return (
    <div className="min-h-screen bg-[#f2f0ed]">
      <div className="max-w-270 mx-auto px-10 max-md:px-5 py-10">
        {/* Header */}
        <div className="mb-8 animate-pulse">
          <div className="h-3 bg-[#e0ddd8] rounded-full w-24 mb-3" />
          <div className="h-10 bg-[#e0ddd8] rounded-full w-64 mb-2" />
          <div className="h-4 bg-[#e0ddd8] rounded-full w-48" />
        </div>

        {/* Filter bar */}
        <div className="flex gap-3 mb-8 flex-wrap animate-pulse">
          {[80, 100, 72, 88].map((w, i) => (
            <div key={i} className="h-9 bg-[#e0ddd8] rounded-full" style={{ width: w }} />
          ))}
        </div>

        {/* Project grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
