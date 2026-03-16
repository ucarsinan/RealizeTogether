import Link from 'next/link'

type BreadcrumbItem = {
  label: string
  href?: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-2 mb-6">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-[#e0ddd8] text-[12px]">/</span>}
          {item.href && i < items.length - 1 ? (
            <Link
              href={item.href}
              className="font-sans text-[12px] text-[#6b6762] hover:text-[#e8621a] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-sans text-[12px] text-[#1a1918] font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
