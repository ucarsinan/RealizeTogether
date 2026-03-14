export type { Database } from './database.types'
export type { Tables, TablesInsert, TablesUpdate, Enums } from './database.types'

import type { Tables, Enums } from './database.types'

// Generic server action result
export type ActionResult<T = null> = { success: true; data: T } | { success: false; error: string }

// ENUM aliases (derived from generated schema)
export type ProjectStage = Enums<'project_stage'>
export type ApplicationStatus = Enums<'application_status'>
export type CommitmentType = Enums<'commitment_type'>
export type CollabType = Enums<'collab_type'>

// Row type aliases (generated from DB schema)
export type Profile = Tables<'profiles'>
export type Project = Tables<'projects'>
export type ProjectRole = Tables<'project_roles'>

// Join type for explore / project detail
export type ProjectWithRoles = Project & {
  project_roles: ProjectRole[]
  profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'is_verified' | 'video_url'>
}
