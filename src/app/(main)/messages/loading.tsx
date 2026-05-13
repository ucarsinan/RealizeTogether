function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-[#e0ddd8] animate-pulse">
      <div className="w-10 h-10 bg-[#f2f0ed] rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[#f2f0ed] rounded-full w-1/3" />
        <div className="h-3 bg-[#f2f0ed] rounded-full w-2/3" />
      </div>
      <div className="h-3 bg-[#f2f0ed] rounded-full w-12 shrink-0" />
    </div>
  )
}

export default function MessagesLoading() {
  return (
    <div className="min-h-screen bg-[#f2f0ed]">
      <div className="max-w-2xl mx-auto px-10 max-md:px-5 py-10">
        <div className="mb-8 animate-pulse">
          <div className="h-3 bg-[#e0ddd8] rounded-full w-20 mb-3" />
          <div className="h-10 bg-[#e0ddd8] rounded-full w-40" />
        </div>
        <div className="bg-white border border-[#e0ddd8] rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.07)] overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <ConversationSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
