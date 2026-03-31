'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  updateProfile,
  uploadAvatar,
  uploadVideo,
  verifyPortfolio,
  extractSkillsFromBio,
} from '@/actions/profile.actions'
import type { Profile } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  User,
  Video,
  Link,
  CheckCircle,
  Upload,
  Film,
  Linkedin,
  Globe,
  AlertCircle,
  Loader2,
  Wand2,
  X,
} from 'lucide-react'

interface ProfileFormProps {
  profile: Profile
  isNew?: boolean
}

const inputClass =
  'w-full bg-white border-[1.5px] border-[#e0ddd8] focus:border-[#e8621a] rounded-full px-5 py-2.5 text-[13px] text-[#1a1918] placeholder:text-[#bab7b2] outline-none transition-colors font-sans'
const textareaClass =
  'w-full bg-white border-[1.5px] border-[#e0ddd8] focus:border-[#e8621a] rounded-xl px-5 py-3 text-[13px] text-[#1a1918] placeholder:text-[#bab7b2] outline-none transition-colors font-sans resize-none'
const labelClass = 'block font-sans text-[12px] font-medium text-[#6b6762] mb-1.5'

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="flex gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-[#fdf2ec] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#e8621a]" />
      </div>
      <div>
        <h3 className="font-unbounded font-bold text-[13px] tracking-[-0.01em] text-[#1a1918]">
          {title}
        </h3>
        <p className="font-sans text-[12px] text-[#6b6762] mt-0.5">{description}</p>
      </div>
    </div>
  )
}

function StatusMessage({ type, message }: { type: 'success' | 'error'; message: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 font-sans text-[12px] px-4 py-2.5 rounded-xl mt-3',
        type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
      )}
    >
      {type === 'success' ? (
        <CheckCircle className="w-4 h-4 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 shrink-0" />
      )}
      {message}
    </div>
  )
}

function AvatarUpload({ currentUrl }: { currentUrl: string | null }) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    const formData = new FormData()
    formData.append('avatar', file)
    startTransition(async () => {
      const result = await uploadAvatar(formData)
      setStatus(
        result.success
          ? { type: 'success', message: 'Profile photo updated' }
          : { type: 'error', message: result.error }
      )
    })
  }

  return (
    <div className="flex items-center gap-4">
      <div
        className="w-16 h-16 rounded-full bg-[#f2f0ed] overflow-hidden cursor-pointer ring-2 ring-[#e0ddd8] hover:ring-[#e8621a] transition-all"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-6 h-6 text-[#6b6762]" />
          </div>
        )}
      </div>
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="flex items-center gap-1.5 border border-[#e0ddd8] hover:border-[#1a1918] text-[#6b6762] hover:text-[#1a1918] font-sans text-[12px] px-4 py-2 rounded-full transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Upload className="w-3 h-3" />
          )}
          {isPending ? 'Uploading...' : 'Upload photo'}
        </button>
        <p className="font-sans text-[11px] text-[#6b6762] mt-1">Max 5MB · JPG, PNG, WebP</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {status && <StatusMessage type={status.type} message={status.message} />}
    </div>
  )
}

function VideoUpload({ currentUrl }: { currentUrl: string | null }) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('video', file)
    startTransition(async () => {
      const result = await uploadVideo(formData)
      setStatus(
        result.success
          ? { type: 'success', message: 'Intro video uploaded' }
          : { type: 'error', message: result.error }
      )
    })
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'rounded-xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer',
          currentUrl
            ? 'border-green-200 bg-green-50'
            : 'border-[#e0ddd8] hover:border-[#e8621a] hover:bg-[#fdf2ec]'
        )}
        onClick={() => !currentUrl && inputRef.current?.click()}
      >
        {currentUrl ? (
          <div className="space-y-2">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
            <p className="font-sans text-[13px] font-medium text-green-700">Intro video uploaded</p>
            <video src={currentUrl} className="max-h-32 mx-auto rounded-lg" controls />
          </div>
        ) : (
          <div className="space-y-2">
            <Video className="w-8 h-8 text-[#e0ddd8] mx-auto" />
            <p className="font-sans text-[13px] text-[#6b6762]">Record a 60-second intro video</p>
            <p className="font-sans text-[11px] text-[#6b6762]">
              The most powerful way to build trust with collaborators
            </p>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-1.5 border border-[#e0ddd8] hover:border-[#1a1918] text-[#6b6762] hover:text-[#1a1918] font-sans text-[12px] px-4 py-2.5 rounded-full transition-colors disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
        {isPending ? 'Uploading...' : currentUrl ? 'Replace video' : 'Upload video'}
      </button>
      <p className="font-sans text-[11px] text-[#6b6762] text-center">Max 50MB · MP4, MOV, WebM</p>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {status && <StatusMessage type={status.type} message={status.message} />}
    </div>
  )
}

export function ProfileForm({ profile, isNew = false }: ProfileFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isVerifying, startVerifying] = useTransition()
  const [isExtracting, startExtracting] = useTransition()
  const [saveStatus, setSaveStatus] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [verifyStatus, setVerifyStatus] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [skillsStatus, setSkillsStatus] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const [formData, setFormData] = useState({
    full_name: profile.full_name ?? '',
    bio: profile.bio ?? '',
    portfolio_url: profile.portfolio_url ?? '',
    imdb_url: profile.imdb_url ?? '',
    vimeo_url: profile.vimeo_url ?? '',
    linkedin_url: profile.linkedin_url ?? '',
  })

  const [skills, setSkills] = useState<string[]>(
    (profile as Profile & { skills?: string[] }).skills ?? []
  )

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setSaveStatus(null)
  }

  function handleExtractSkills() {
    if (!formData.bio.trim()) return
    startExtracting(async () => {
      const result = await extractSkillsFromBio(formData.bio)
      if (!result.success) {
        setSkillsStatus({ type: 'error', message: result.error })
        return
      }
      setSkills(result.data.skills)
      setSkillsStatus(null)
    })
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateProfile({ ...formData, skills })
      if (!result.success) {
        setSaveStatus({ type: 'error', message: result.error })
        return
      }
      if (isNew) {
        router.push('/dashboard')
      } else {
        setSaveStatus({ type: 'success', message: 'Profile saved successfully' })
      }
    })
  }

  function handleVerify() {
    startVerifying(async () => {
      const result = await verifyPortfolio()
      setVerifyStatus(
        result.success
          ? { type: 'success', message: 'Portfolio verified! Badge added to your profile.' }
          : { type: 'error', message: result.error }
      )
    })
  }

  const hasPortfolioLink = [
    formData.imdb_url,
    formData.vimeo_url,
    formData.linkedin_url,
    formData.portfolio_url,
  ].some((v) => v.trim() !== '')

  return (
    <div className="space-y-6 pb-12">
      {/* Verified badge */}
      {profile.is_verified && (
        <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
          <span className="font-sans text-[12px] font-medium text-green-700">Verified</span>
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-4">
        <SectionHeader
          icon={User}
          title="Basic Info"
          description="Your name and bio are always public"
        />
        <AvatarUpload currentUrl={profile.avatar_url} />
        <div className="border-t border-[#e0ddd8] my-4" />
        <div>
          <label htmlFor="full_name" className={labelClass}>
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="full_name"
            type="text"
            value={formData.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            placeholder="Your name"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="bio" className={labelClass}>
            Bio
          </label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Who are you? What are you working on?"
            rows={4}
            className={textareaClass}
          />
          <div className="flex items-center justify-between mt-2">
            <p className="font-sans text-[11px] text-[#6b6762]">
              {formData.bio.length}/500 characters
            </p>
            <button
              type="button"
              onClick={handleExtractSkills}
              disabled={isExtracting || !formData.bio.trim()}
              className="flex items-center gap-1.5 border border-[#e0ddd8] hover:border-[#e8621a] text-[#6b6762] hover:text-[#e8621a] font-sans text-[11px] px-3 py-1.5 rounded-full transition-colors disabled:opacity-40"
            >
              {isExtracting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Wand2 className="w-3 h-3" />
              )}
              {isExtracting ? 'Analysing...' : 'Suggest skills from bio'}
            </button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 font-sans text-[11px] font-medium bg-[#fdf2ec] text-[#e8621a] border border-[#e8621a]/20 px-3 py-1 rounded-full"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => setSkills((prev) => prev.filter((s) => s !== skill))}
                    className="hover:text-[#c9521a] transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          {skillsStatus && (
            <StatusMessage type={skillsStatus.type} message={skillsStatus.message} />
          )}
        </div>
      </div>

      {/* Intro Video */}
      <div className="border-t border-[#e0ddd8] pt-6 space-y-4">
        <SectionHeader
          icon={Video}
          title="Intro Video"
          description="A 60-second video builds more trust than any text"
        />
        <VideoUpload currentUrl={profile.video_url} />
      </div>

      {/* Portfolio Links */}
      <div className="border-t border-[#e0ddd8] pt-6 space-y-4">
        <div className="flex items-start justify-between">
          <SectionHeader
            icon={Link}
            title="Portfolio Links"
            description="Show your work. One link is enough for verification."
          />
          {!profile.is_verified && (
            <button
              type="button"
              onClick={handleVerify}
              disabled={!hasPortfolioLink || isVerifying}
              className="flex items-center gap-1.5 border border-[#e0ddd8] hover:border-[#e8621a] text-[#6b6762] hover:text-[#e8621a] font-sans text-[12px] px-4 py-2 rounded-full transition-colors disabled:opacity-40 shrink-0 ml-4"
            >
              {isVerifying ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <CheckCircle className="w-3 h-3" />
              )}
              Verify portfolio
            </button>
          )}
        </div>
        {verifyStatus && <StatusMessage type={verifyStatus.type} message={verifyStatus.message} />}

        {[
          {
            id: 'imdb_url',
            label: 'IMDb Profile',
            icon: Film,
            iconClass: 'text-yellow-500',
            placeholder: 'https://www.imdb.com/name/...',
          },
          {
            id: 'vimeo_url',
            label: 'Vimeo',
            icon: Video,
            iconClass: 'text-blue-500',
            placeholder: 'https://vimeo.com/...',
          },
          {
            id: 'linkedin_url',
            label: 'LinkedIn',
            icon: Linkedin,
            iconClass: 'text-blue-700',
            placeholder: 'https://linkedin.com/in/...',
          },
          {
            id: 'portfolio_url',
            label: 'Personal Website / Portfolio',
            icon: Globe,
            iconClass: 'text-[#6b6762]',
            placeholder: 'https://yoursite.com',
          },
        ].map((field) => (
          <div key={field.id}>
            <label
              htmlFor={field.id}
              className="flex items-center gap-2 font-sans text-[12px] font-medium text-[#6b6762] mb-1.5"
            >
              <field.icon className={`w-3.5 h-3.5 ${field.iconClass}`} />
              {field.label}
            </label>
            <input
              id={field.id}
              type="url"
              value={formData[field.id as keyof typeof formData]}
              onChange={(e) => handleChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={inputClass}
            />
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-[#e0ddd8] -mx-8 px-8 py-4">
        <button
          onClick={handleSave}
          disabled={isPending || !formData.full_name.trim()}
          className="w-full bg-[#e8621a] hover:bg-[#c9521a] text-white font-bold text-[13px] px-6 py-3 rounded-full transition-colors duration-150 font-sans disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? 'Saving...' : isNew ? 'Save & continue →' : 'Save changes'}
        </button>
        {saveStatus && <StatusMessage type={saveStatus.type} message={saveStatus.message} />}
      </div>
    </div>
  )
}
