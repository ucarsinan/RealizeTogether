"use client"

import { useState, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateProfile, uploadAvatar, uploadVideo, verifyPortfolio } from "@/actions/profile.actions"
import type { Profile } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Video, Link, CheckCircle, Upload, Film, Linkedin, Globe, AlertCircle, Loader2 } from "lucide-react"

interface ProfileFormProps {
  profile: Profile
  isNew?: boolean
}

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex gap-3 mb-4">
      <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-zinc-600" />
      </div>
      <div>
        <h3 className="font-medium text-sm text-zinc-900">{title}</h3>
        <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
      </div>
    </div>
  )
}

function StatusMessage({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div className={cn(
      "flex items-center gap-2 text-sm px-3 py-2 rounded-lg mt-3",
      type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
    )}>
      {type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      {message}
    </div>
  )
}

function AvatarUpload({ currentUrl }: { currentUrl: string | null }) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    const formData = new FormData()
    formData.append("avatar", file)
    startTransition(async () => {
      const result = await uploadAvatar(formData)
      setStatus(result.success
        ? { type: "success", message: "Profile photo updated" }
        : { type: "error", message: result.error }
      )
    })
  }

  return (
    <div className="flex items-center gap-4">
      <div
        className="w-16 h-16 rounded-full bg-zinc-100 overflow-hidden cursor-pointer ring-2 ring-zinc-200 hover:ring-zinc-400 transition-all"
        onClick={() => inputRef.current?.click()}
      >
        {preview
          ? <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><User className="w-6 h-6 text-zinc-400" /></div>
        }
      </div>
      <div>
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={isPending}>
          {isPending ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Upload className="w-3 h-3 mr-2" />}
          {isPending ? "Uploading..." : "Upload photo"}
        </Button>
        <p className="text-xs text-zinc-400 mt-1">Max 5MB · JPG, PNG, WebP</p>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      {status && <StatusMessage type={status.type} message={status.message} />}
    </div>
  )
}

function VideoUpload({ currentUrl }: { currentUrl: string | null }) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append("video", file)
    startTransition(async () => {
      const result = await uploadVideo(formData)
      setStatus(result.success
        ? { type: "success", message: "Intro video uploaded" }
        : { type: "error", message: result.error }
      )
    })
  }

  return (
    <div className="space-y-3">
      <div className={cn(
        "rounded-xl border-2 border-dashed p-6 text-center transition-colors",
        currentUrl ? "border-green-200 bg-green-50" : "border-zinc-200 hover:border-zinc-300"
      )}>
        {currentUrl ? (
          <div className="space-y-2">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
            <p className="text-sm font-medium text-green-700">Intro video uploaded</p>
            <video src={currentUrl} className="max-h-32 mx-auto rounded-lg" controls />
          </div>
        ) : (
          <div className="space-y-2">
            <Video className="w-8 h-8 text-zinc-300 mx-auto" />
            <p className="text-sm text-zinc-500">Record a 60-second intro video</p>
            <p className="text-xs text-zinc-400">This is the most powerful way to build trust with potential collaborators</p>
          </div>
        )}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={isPending} className="w-full">
        {isPending ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Upload className="w-3 h-3 mr-2" />}
        {isPending ? "Uploading..." : currentUrl ? "Replace video" : "Upload video"}
      </Button>
      <p className="text-xs text-zinc-400 text-center">Max 50MB · MP4, MOV, WebM</p>
      <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
      {status && <StatusMessage type={status.type} message={status.message} />}
    </div>
  )
}

export function ProfileForm({ profile, isNew = false }: ProfileFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isVerifying, startVerifying] = useTransition()
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [verifyStatus, setVerifyStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const [formData, setFormData] = useState({
    full_name: profile.full_name ?? "",
    bio: profile.bio ?? "",
    portfolio_url: profile.portfolio_url ?? "",
    imdb_url: profile.imdb_url ?? "",
    vimeo_url: profile.vimeo_url ?? "",
    linkedin_url: profile.linkedin_url ?? "",
  })

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
    setSaveStatus(null)
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateProfile(formData)
      if (!result.success) {
        setSaveStatus({ type: "error", message: result.error })
        return
      }
      if (isNew) {
        router.push("/dashboard")
      } else {
        setSaveStatus({ type: "success", message: "Profile saved successfully" })
      }
    })
  }

  function handleVerify() {
    startVerifying(async () => {
      const result = await verifyPortfolio()
      setVerifyStatus(result.success
        ? { type: "success", message: "Portfolio verified! Badge added to your profile." }
        : { type: "error", message: result.error }
      )
    })
  }

  const hasPortfolioLink = [formData.imdb_url, formData.vimeo_url, formData.linkedin_url, formData.portfolio_url].some(v => v.trim() !== "")

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">{isNew ? "Complete your profile" : "Edit Profile"}</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{isNew ? "Tell collaborators who you are before you dive in" : "How collaborators will find and trust you"}</p>
        </div>
        {profile.is_verified && (
          <Badge variant="secondary" className="gap-1 bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3" />
            Verified
          </Badge>
        )}
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-5">
        <SectionHeader icon={User} title="Basic Info" description="Your name and bio are always public" />
        <AvatarUpload currentUrl={profile.avatar_url} />
        <Separator />
        <div className="space-y-1.5">
          <Label htmlFor="full_name" className="text-sm font-medium">Full Name <span className="text-red-500">*</span></Label>
          <Input id="full_name" value={formData.full_name} onChange={e => handleChange("full_name", e.target.value)} placeholder="Your name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
          <Textarea id="bio" value={formData.bio} onChange={e => handleChange("bio", e.target.value)} placeholder="Who are you? What are you working on?" rows={4} className="resize-none" />
          <p className="text-xs text-zinc-400">{formData.bio.length}/500 characters</p>
        </div>
      </div>

      {/* Intro Video */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-5">
        <SectionHeader icon={Video} title="Intro Video" description="A 60-second video builds more trust than any text" />
        <VideoUpload currentUrl={profile.video_url} />
      </div>

      {/* Portfolio Links */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-5">
        <div className="flex items-start justify-between">
          <SectionHeader icon={Link} title="Portfolio Links" description="Show your work. One link is enough for verification." />
          {!profile.is_verified && (
            <Button type="button" size="sm" variant="outline" onClick={handleVerify} disabled={!hasPortfolioLink || isVerifying} className="shrink-0 ml-4">
              {isVerifying ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-2" />}
              Get Verified
            </Button>
          )}
        </div>
        {verifyStatus && <StatusMessage type={verifyStatus.type} message={verifyStatus.message} />}

        {[
          { id: "imdb_url", label: "IMDb Profile", icon: Film, iconClass: "text-yellow-500", placeholder: "https://www.imdb.com/name/..." },
          { id: "vimeo_url", label: "Vimeo", icon: Video, iconClass: "text-blue-500", placeholder: "https://vimeo.com/..." },
          { id: "linkedin_url", label: "LinkedIn", icon: Linkedin, iconClass: "text-blue-700", placeholder: "https://linkedin.com/in/..." },
          { id: "portfolio_url", label: "Personal Website / Portfolio", icon: Globe, iconClass: "text-zinc-500", placeholder: "https://yoursite.com" },
        ].map(field => (
          <div key={field.id} className="space-y-1.5">
            <Label htmlFor={field.id} className="text-sm font-medium flex items-center gap-2">
              <field.icon className={`w-3.5 h-3.5 ${field.iconClass}`} />
              {field.label}
            </Label>
            <Input
              id={field.id}
              type="url"
              value={formData[field.id as keyof typeof formData]}
              onChange={e => handleChange(field.id, e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-zinc-100 -mx-4 px-4 py-3">
        <Button onClick={handleSave} disabled={isPending || !formData.full_name.trim()} className="w-full" size="lg">
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isPending ? "Saving..." : isNew ? "Save & continue →" : "Save Profile"}
        </Button>
        {saveStatus && <StatusMessage type={saveStatus.type} message={saveStatus.message} />}
      </div>
    </div>
  )
}
