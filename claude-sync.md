# Realize Together – Claude Sync
**2026-03-12 23:28** | Projekt-Stand für Brainstorming & Planung

---

## 📁 Struktur
```
actions/application.actions.ts
actions/conversation.actions.ts
actions/match.actions.ts
actions/nda.actions.ts
actions/profile.actions.ts
actions/project.actions.ts
app/(auth)/login/page.tsx
app/(auth)/register/page.tsx
app/(main)/dashboard/page.tsx
app/(main)/dashboard/profile/page.tsx
app/(main)/explore/page.tsx
app/(main)/layout.tsx
app/(main)/messages/[id]/page.tsx
app/(main)/messages/page.tsx
app/(main)/projects/[id]/applications/page.tsx
app/(main)/projects/[id]/apply/page.tsx
app/(main)/projects/[id]/page.tsx
app/(main)/projects/new/page.tsx
app/auth/callback/route.ts
app/layout.tsx
app/page.tsx
components/chat/ChatView.tsx
components/chat/MatchConfirmBanner.tsx
components/layout/NavBar.tsx
components/profile/ProfileForm.tsx
components/projects/ApplicationsManager.tsx
components/projects/ApplyForm.tsx
components/projects/ExploreFilters.tsx
components/projects/ProjectCard.tsx
components/projects/ProjectForm.tsx
components/trust-funnel/NDAModal.tsx
components/trust-funnel/SynopsisViewer.tsx
components/ui/avatar.tsx
components/ui/badge.tsx
components/ui/button.tsx
components/ui/card.tsx
components/ui/dialog.tsx
components/ui/input.tsx
components/ui/label.tsx
components/ui/separator.tsx
components/ui/sonner.tsx
components/ui/textarea.tsx
lib/supabase/client.ts
lib/supabase/middleware.ts
lib/supabase/server.ts
lib/types/database.types.ts
lib/types/index.ts
lib/utils.ts
proxy.ts
```

## 🔀 Git Status
```
### Letzte Commits:
0da497d feat: initial commit
9f9839b Initial commit from Create Next App

### Geändert (unstaged):
CLAUDE.md
package-lock.json
package.json
src/app/page.tsx
src/lib/utils.ts

### Neu (untracked):
src/actions/application.actions.ts
src/actions/conversation.actions.ts
src/actions/match.actions.ts
src/actions/nda.actions.ts
src/actions/profile.actions.ts
src/actions/project.actions.ts
src/app/(auth)/login/page.tsx
src/app/(auth)/register/page.tsx
src/app/(main)/dashboard/page.tsx
src/app/(main)/dashboard/profile/page.tsx
src/app/(main)/explore/page.tsx
src/app/(main)/layout.tsx
src/app/(main)/messages/[id]/page.tsx
src/app/(main)/messages/page.tsx
src/app/(main)/projects/[id]/applications/page.tsx
src/app/(main)/projects/[id]/apply/page.tsx
src/app/(main)/projects/[id]/page.tsx
src/app/(main)/projects/new/page.tsx
src/app/auth/callback/route.ts
src/components/chat/ChatView.tsx
src/components/chat/MatchConfirmBanner.tsx
src/components/layout/NavBar.tsx
src/components/profile/ProfileForm.tsx
src/components/projects/ApplicationsManager.tsx
src/components/projects/ApplyForm.tsx
src/components/projects/ExploreFilters.tsx
src/components/projects/ProjectCard.tsx
src/components/projects/ProjectForm.tsx
src/components/trust-funnel/NDAModal.tsx
src/components/trust-funnel/SynopsisViewer.tsx
src/components/ui/avatar.tsx
src/components/ui/badge.tsx
src/components/ui/card.tsx
src/components/ui/dialog.tsx
src/components/ui/input.tsx
src/components/ui/label.tsx
src/components/ui/separator.tsx
src/components/ui/sonner.tsx
src/components/ui/textarea.tsx
src/lib/supabase/client.ts
src/lib/supabase/middleware.ts
src/lib/supabase/server.ts
src/lib/types/database.types.ts
src/lib/types/index.ts
src/proxy.ts
```

## 🏷️  Types
```typescript
export type { Database } from "./database.types";
export type { Tables, TablesInsert, TablesUpdate, Enums } from "./database.types";

// Generic server action result
export type ActionResult<T = null> =
  | { success: true; data: T }
  | { success: false; error: string };

// ENUMs
export type ProjectStage = "idea" | "concept" | "development" | "ready" | "production" | "completed";
export type ApplicationStatus = "pending" | "in_talks" | "matched" | "rejected";
export type CommitmentType = "hobby" | "side_project" | "serious" | "professional";
export type CollabType = "paid" | "passion" | "both";

// App-level row types (mirrors DB shape; replace with Tables<"profiles"> once schema is live)
export type Profile = {
  id: string;
  full_name: string;
  bio: string | null;
  avatar_url: string | null;
  video_url: string | null;
  portfolio_url: string | null;
  imdb_url: string | null;
  vimeo_url: string | null;
  linkedin_url: string | null;
  is_verified: boolean;
  verification_type: "none" | "portfolio" | "identity";
  verified_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  logline: string | null;
  category: string;
  stage: ProjectStage;
  status: "open" | "in_progress" | "completed";
  commitment_type: CommitmentType;
  collab_type: CollabType;
  synopsis_url: string | null;
  requires_nda: boolean;
  created_at: string;
  updated_at: string;
};

export type ProjectRole = {
  id: string;
  project_id: string;
  role_name: string;
  quantity: number;
  description: string | null;
};

export type ProjectWithRoles = Project & {
  project_roles: ProjectRole[];
  profiles: Pick<Profile, "id" | "full_name" | "avatar_url" | "is_verified" | "video_url">;
};
```

## ⚡ Server Actions (Signaturen)

### `application.actions.ts`
```typescript
11:export type ApplicationWithDetails = 
44:export async function submitApplication(input: 
92:export async function getApplicationsForProject(
132:export async function acceptApplication(
191:export async function rejectApplication(
228:export async function confirmMatch(
318:export async function getMyApplications(): Promise<ActionResult<ApplicationWithDetails[]>> 
```

### `conversation.actions.ts`
```typescript
11:export type ConversationPreview = 
21:export type MessageWithSender = 
31:export type ConversationDetail = 
46:export async function getMyConversations(): Promise<ActionResult<ConversationPreview[]>> 
137:export async function getConversation(id: string): Promise<ActionResult<ConversationDetail>> 
190:export async function sendMessage(conversationId: string, content: string): Promise<ActionResult<undefined>> 
212:export async function markAsRead(conversationId: string): Promise<ActionResult<undefined>> 
234:type OtherUser = { id: string; full_name: string; avatar_url: string | null }
235:type RawMessage = { id: string; content: string; sender_id: string; created_at: string; read_at: string | null }
```

### `match.actions.ts`
```typescript
7:export type MatchStatus = 
17:export async function confirmMatch(
116:export async function getMatchStatus(
```

### `nda.actions.ts`
```typescript
10:export async function checkNdaConsent(
34:export async function submitNdaConsent(
58:export async function getSynopsisUrl(
```

### `profile.actions.ts`
```typescript
11:export async function getProfile(userId: string): Promise<ActionResult<Profile>> 
24:export async function getCurrentProfile(): Promise<ActionResult<Profile>> 
37:export type UpdateProfileInput = 
46:export async function updateProfile(
78:export async function uploadAvatar(
125:export async function uploadVideo(
172:export async function verifyPortfolio(): Promise<ActionResult<void>> 
```

### `project.actions.ts`
```typescript
11:export type ProjectRoleInput = 
17:export type CreateProjectInput = 
33:export async function createProject(
92:export async function uploadSynopsis(
168:export async function getProjects(filters?: 
195:export async function getProject(id: string): Promise<ActionResult<ProjectWithRoles>> 
212:export async function getMyProjects(): Promise<ActionResult<ProjectWithRoles[]>> 
```

## 🧩 Components (Props & Exports)

### `components/chat/ChatView.tsx`
```typescript
13:interface ChatViewProps {
13:interface ChatViewProps 
26:export function ChatView({ conversationId, projectTitle, otherUser, initialMessages, myUserId }: ChatViewProps) 
```

### `components/chat/MatchConfirmBanner.tsx`
```typescript
9:interface MatchConfirmBannerProps {
9:interface MatchConfirmBannerProps 
16:export function MatchConfirmBanner(
```

### `components/layout/NavBar.tsx`
```typescript
10:type NavUser = { full_name: string; avatar_url: string | null } | null
12:export function NavBar() 
```

### `components/profile/ProfileForm.tsx`
```typescript
16:interface ProfileFormProps {
16:interface ProfileFormProps 
142:export function ProfileForm({ profile, isNew = false }: ProfileFormProps) 
```

### `components/projects/ApplicationsManager.tsx`
```typescript
171:interface ApplicationsManagerProps {
171:interface ApplicationsManagerProps 
177:export function ApplicationsManager({ projectId, projectTitle, applications: initialApplications }: ApplicationsManagerProps) 
```

### `components/projects/ApplyForm.tsx`
```typescript
15:interface ApplyFormProps {
13:export type Role = { id: string; role_name: string; description: string | null }
15:interface ApplyFormProps 
22:export function ApplyForm({ projectId, projectTitle, roles, isEarlyStage }: ApplyFormProps) 
```

### `components/projects/ExploreFilters.tsx`
```typescript
25:interface ExploreFiltersProps {
25:interface ExploreFiltersProps 
30:export function ExploreFilters({ currentStage, currentCommitment }: ExploreFiltersProps) 
```

### `components/projects/ProjectCard.tsx`
```typescript
24:export function ProjectCard({ project }: { project: ProjectWithRoles }) 
```

### `components/projects/ProjectForm.tsx`
```typescript
145:export function ProjectForm() 
```

### `components/trust-funnel/NDAModal.tsx`
```typescript
9:interface NDAModalProps {
9:interface NDAModalProps 
15:export function NDAModal({ projectId, projectTitle, onConsented }: NDAModalProps) 
```

### `components/trust-funnel/SynopsisViewer.tsx`
```typescript
10:interface SynopsisViewerProps {
10:interface SynopsisViewerProps 
19:export function SynopsisViewer(
```

### `components/ui/badge.tsx`
```typescript
3:import { cva, type VariantProps } from "class-variance-authority"
```

### `components/ui/button.tsx`
```typescript
4:import { cva, type VariantProps } from "class-variance-authority"
```

### `components/ui/input.tsx`
```typescript
6:function Input({ className, type, ...props }: React.ComponentProps<"input">) {
```

### `components/ui/sonner.tsx`
```typescript
4:import { Toaster as Sonner, type ToasterProps } from "sonner"
```

## 📄 Pages (Routen)
```
/(auth)/login
/(auth)/register
/dashboard
/dashboard/profile
/explore
/messages/[id]
/messages
/projects/[id]/applications
/projects/[id]/apply
/projects/[id]
/projects/new
/
```

## 📦 Dependencies
```json
{
  "dependencies": {
    "@base-ui/react": "^1.3.0",
    "@supabase/ssr": "^0.9.0",
    "@supabase/supabase-js": "^2.99.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.577.0",
    "next": "16.1.6",
    "next-themes": "^0.4.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "shadcn": "^4.0.5",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.5.0",
    "tw-animate-css": "^1.4.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

## 📄 Vollständige Datei: `src/components/layout/NavBar.tsx`
```typescript
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Compass, LayoutDashboard, MessageCircle, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"

type NavUser = { full_name: string; avatar_url: string | null } | null

export function NavBar() {
  const pathname = usePathname()
  const [user, setUser] = useState<NavUser>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          setUser(data ?? { full_name: user.user_metadata?.full_name ?? "?", avatar_url: null })
        })
    })
  }, [])

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname.startsWith("/dashboard")
    return pathname === href || pathname.startsWith(href + "/")
  }

  const linkClass = (href: string) =>
    `text-sm transition-colors ${
      isActive(href) ? "text-zinc-900 font-medium" : "text-zinc-500 hover:text-zinc-900"
    }`

  const mobileLinkClass = (href: string) =>
    `flex flex-col items-center gap-0.5 text-xs transition-colors ${
      isActive(href) ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-700"
    }`

  return (
    // Single nav — fixed bottom on mobile, sticky top on desktop
    <nav className="fixed bottom-0 left-0 right-0 w-full z-50 bg-white md:sticky md:bottom-auto md:top-0">

      {/* ── Desktop ── */}
      <div className="hidden md:flex border-b border-zinc-100 w-full">
        <div className="max-w-4xl mx-auto w-full px-4 h-14 flex items-center justify-between">

          <Link href="/dashboard" className="text-sm font-semibold text-zinc-900 tracking-tight shrink-0">
            Realize Together
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/explore" className={linkClass("/explore")}>Explore</Link>
            <Link href="/dashboard" className={linkClass("/dashboard")}>Dashboard</Link>
            <Link href="/messages" className={linkClass("/messages")}>Messages</Link>
          </div>

          <Link href="/dashboard/profile" className="shrink-0">
            <Avatar className="w-8 h-8 ring-2 ring-transparent hover:ring-zinc-200 transition">
              <AvatarImage src={user?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-zinc-100 text-xs">
                {user?.full_name?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
          </Link>

        </div>
      </div>

      {/* ── Mobile ── */}
      <div className="flex md:hidden border-t border-zinc-100 w-full h-16 items-center justify-around px-4">

        <Link href="/explore" className={mobileLinkClass("/explore")}>
          <Compass className="w-5 h-5" />
          Explore
        </Link>

        <Link href="/dashboard" className={mobileLinkClass("/dashboard")}>
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>

        <Link href="/messages" className={mobileLinkClass("/messages")}>
          <MessageCircle className="w-5 h-5" />
          Messages
        </Link>

        <Link href="/dashboard/profile" className={mobileLinkClass("/dashboard/profile")}>
          {user?.avatar_url ? (
            <Avatar className="w-6 h-6">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="bg-zinc-100 text-[10px]">
                {user.full_name?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
          ) : (
            <User className="w-5 h-5" />
          )}
          Profile
        </Link>

      </div>

    </nav>
  )
}
```
