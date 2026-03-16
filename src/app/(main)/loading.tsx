export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f2f0ed] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#e0ddd8] border-t-[#e8621a] rounded-full animate-spin" />
        <p className="font-sans text-[13px] text-[#6b6762]">Loading...</p>
      </div>
    </div>
  )
}
