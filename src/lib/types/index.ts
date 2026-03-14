export type { Database } from './database.types'
export type { Tables, TablesInsert, TablesUpdate, Enums } from './database.types'

// Generic server action result
export type ActionResult<T = null> = { success: true; data: T } | { success: false; error: string }

// ENUMs
export type ProjectStage = 'idea' | 'concept' | 'development' | 'ready' | 'production' | 'completed'
export type ApplicationStatus = 'pending' | 'in_talks' | 'matched' | 'rejected'
export type CommitmentType = 'hobby' | 'side_project' | 'serious' | 'professional'
export type CollabType = 'paid' | 'passion' | 'both'

// App-level row types (mirrors DB shape; replace with Tables<"profiles"> once schema is live)
export type Profile = {
  id: string
  full_name: string
  bio: string | null
  avatar_url: string | null
  video_url: string | null
  portfolio_url: string | null
  imdb_url: string | null
  vimeo_url: string | null
  linkedin_url: string | null
  is_verified: boolean
  verification_type: 'none' | 'portfolio' | 'identity'
  verified_at: string | null
  created_at: string
  updated_at: string
}

export type Project = {
  id: string
  creator_id: string
  title: string
  description: string
  logline: string | null
  category: string
  stage: ProjectStage
  status: 'open' | 'in_progress' | 'completed'
  commitment_type: CommitmentType
  collab_type: CollabType
  synopsis_url: string | null
  requires_nda: boolean
  created_at: string
  updated_at: string
}

export type ProjectRole = {
  id: string
  project_id: string
  role_name: string
  quantity: number
  description: string | null
}

export type ProjectWithRoles = Project & {
  project_roles: ProjectRole[]
  profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'is_verified' | 'video_url'>
}
