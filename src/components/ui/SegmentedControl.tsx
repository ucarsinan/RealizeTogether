type SegmentedControlProps = {
  options: { label: string; value: string }[]
  value: string
  onChange: (value: string) => void
}

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  return (
    <div className="inline-flex items-center bg-[#e0ddd8] rounded-full p-1 gap-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            px-4 py-1.5 rounded-full text-[12px] font-['DM_Sans'] font-medium
            transition-all duration-200 whitespace-nowrap
            ${value === option.value
              ? 'bg-white text-[#1a1918] shadow-sm font-bold'
              : 'text-[#6b6762] hover:text-[#1a1918]'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
