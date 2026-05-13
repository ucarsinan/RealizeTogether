import Link from 'next/link'
import type { CreatorAnalytics } from '@/actions/analytics.actions'

export function AnalyticsSection({ data }: { data: CreatorAnalytics | null }) {
  if (!data || data.projects.length === 0) return null

  const { global, projects } = data

  const globalChips = [
    { value: global.total_applications, label: 'Total Applications' },
    { value: global.total_matches, label: 'Total Matches' },
    { value: global.total_nda_consents, label: 'NDA Consents' },
    {
      value: global.match_rate !== null ? `${global.match_rate}%` : '—',
      label: 'Match Rate',
    },
  ]

  return (
    <div className="mt-6">
      {/* Section header */}
      <p className="font-unbounded text-[10px] font-bold tracking-[.18em] uppercase text-[#e8621a] mb-4">
        CREATOR ANALYTICS
      </p>

      {/* Global chips */}
      <div className="flex flex-wrap gap-4 mb-6">
        {globalChips.map((chip) => (
          <div
            key={chip.label}
            className="bg-white border border-[#e0ddd8] rounded-2xl px-6 py-4 flex flex-col gap-1 shadow-[0_4px_32px_rgba(0,0,0,0.07)] min-w-35"
          >
            <span className="font-unbounded font-black text-[28px] leading-none text-[#1a1918]">
              {chip.value}
            </span>
            <span className="font-sans text-[11px] uppercase tracking-widest text-[#6b6762]">
              {chip.label}
            </span>
          </div>
        ))}
      </div>

      {/* Per-project table */}
      <div className="bg-white border border-[#e0ddd8] rounded-2xl p-6 shadow-[0_4px_32px_rgba(0,0,0,0.07)] overflow-x-auto">
        <table className="w-full min-w-[640px] text-left border-collapse">
          <thead>
            <tr className="border-b border-[#e0ddd8]">
              {[
                'Project',
                'Status',
                'NDAs',
                'Applied',
                'In Talks',
                'Matched',
                'Rejected',
                'Verified',
                'Match Rate',
              ].map((col) => (
                <th
                  key={col}
                  className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#6b6762] pb-3 pr-4 whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.project_id} className="border-b border-[#f2f0ed] last:border-0">
                <td className="py-3 pr-4">
                  <Link
                    href={`/projects/${p.project_id}`}
                    className="font-sans text-[13px] font-medium text-[#1a1918] hover:text-[#e8621a] transition-colors truncate max-w-[180px] block"
                  >
                    {p.title}
                  </Link>
                </td>
                <td className="py-3 pr-4">
                  <span className="font-sans text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#f2f0ed] text-[#6b6762] capitalize whitespace-nowrap">
                    {p.status}
                  </span>
                </td>
                <td className="py-3 pr-4 font-sans text-[13px] text-[#1a1918]">{p.nda_consents}</td>
                <td className="py-3 pr-4 font-sans text-[13px] text-[#1a1918]">
                  {p.applications.total > 0 && p.applications.verified > 0
                    ? `${p.applications.total} (${p.applications.verified}✓)`
                    : p.applications.total}
                </td>
                <td className="py-3 pr-4 font-sans text-[13px] text-[#1a1918]">
                  {p.applications.in_talks}
                </td>
                <td className="py-3 pr-4 font-sans text-[13px] text-[#1a1918]">
                  {p.applications.matched}
                </td>
                <td className="py-3 pr-4 font-sans text-[13px] text-[#1a1918]">
                  {p.applications.rejected}
                </td>
                <td className="py-3 pr-4 font-sans text-[13px] text-[#1a1918]">
                  {p.applications.verified}
                </td>
                <td className="py-3 font-sans text-[13px] text-[#1a1918]">
                  {p.match_rate !== null ? `${p.match_rate}%` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
