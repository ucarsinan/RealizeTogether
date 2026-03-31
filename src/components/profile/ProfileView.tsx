import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CheckCircle, Play, ExternalLink, Pencil } from 'lucide-react'
import type { Profile } from '@/lib/types'

const PORTFOLIO_LINKS: { key: keyof Profile; label: string }[] = [
  { key: 'portfolio_url', label: 'Portfolio' },
  { key: 'imdb_url', label: 'IMDb' },
  { key: 'vimeo_url', label: 'Vimeo' },
  { key: 'linkedin_url', label: 'LinkedIn' },
]

export function ProfileView({ profile, isOwner }: { profile: Profile; isOwner: boolean }) {
  const activeLinks = PORTFOLIO_LINKS.filter(({ key }) => Boolean(profile[key]))

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white border border-[#e0ddd8] rounded-2xl p-8 shadow-[0_4px_32px_rgba(0,0,0,0.07)]">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          {/* Avatar + Name */}
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20 shrink-0 ring-2 ring-[#e0ddd8]">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="bg-[#fdf2ec] text-[#e8621a] font-unbounded font-bold text-2xl">
                {profile.full_name?.[0]?.toUpperCase() ?? '?'}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-unbounded font-black text-[clamp(20px,2.5vw,36px)] tracking-[-0.03em] leading-none text-[#1a1918]">
                  {profile.full_name}
                </h1>
                {profile.is_verified && <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />}
              </div>
              {profile.is_verified && (
                <p className="font-sans text-[11px] text-green-600 font-medium mt-1.5">
                  Verified member
                </p>
              )}
            </div>
          </div>

          {/* Actions top-right */}
          <div className="flex items-center gap-2 shrink-0">
            {profile.video_url && (
              <a
                href={profile.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-sans text-[12px] text-[#6b6762] hover:text-[#1a1918] border border-[#e0ddd8] hover:border-[#1a1918] px-3 py-1.5 rounded-full transition-colors"
              >
                <Play className="w-3 h-3" /> Intro video
              </a>
            )}
            {isOwner && (
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-1.5 font-sans text-[12px] font-bold text-white bg-[#1a1918] hover:bg-[#e8621a] px-4 py-1.5 rounded-full transition-colors duration-150"
              >
                <Pencil className="w-3 h-3" /> Edit Profile
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="bg-white border border-[#e0ddd8] rounded-2xl p-8 shadow-[0_4px_32px_rgba(0,0,0,0.07)]">
          <h2 className="font-sans text-[12px] font-medium text-[#6b6762] uppercase tracking-widest mb-3">
            About
          </h2>
          <p className="font-sans text-[14px] text-[#1a1918] leading-relaxed whitespace-pre-line">
            {profile.bio}
          </p>
        </div>
      )}

      {/* Portfolio links */}
      {activeLinks.length > 0 && (
        <div className="bg-white border border-[#e0ddd8] rounded-2xl p-8 shadow-[0_4px_32px_rgba(0,0,0,0.07)]">
          <h2 className="font-sans text-[12px] font-medium text-[#6b6762] uppercase tracking-widest mb-4">
            Links
          </h2>
          <div className="flex flex-wrap gap-2">
            {activeLinks.map(({ key, label }) => (
              <a
                key={key}
                href={profile[key] as string}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-sans text-[12px] font-medium text-[#1a1918] border border-[#e0ddd8] hover:border-[#e8621a] hover:text-[#e8621a] px-4 py-2 rounded-full transition-colors"
              >
                {label}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
