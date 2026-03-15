# Skill: Database Schema
# Realize Together — Lade diesen Skill nur bei DB/Schema/Typen-Aufgaben

## Tabellen

```
profiles           id, full_name, bio, avatar_url, video_url,
                   portfolio_url, imdb_url, vimeo_url, linkedin_url,
                   is_verified, verification_type, verified_at

projects           id, creator_id, title, description, logline, category,
                   stage, status, commitment_type, collab_type,
                   synopsis_url, requires_nda

project_roles      id, project_id, role_name, quantity, description

nda_consents       id, project_id, user_id, consented_at
                   UNIQUE(project_id, user_id)

project_applications  id, project_id, role_id (NULLABLE!), applicant_id,
                      status, message
                      UNIQUE NULLS NOT DISTINCT (project_id, role_id, applicant_id)

conversations      id, application_id, project_id

messages           id, conversation_id, sender_id, content, read_at, created_at

matches            id, project_id, user_id, role_id,
                   creator_confirmed, applicant_confirmed, matched_at
                   UNIQUE(project_id, user_id)
```

## ENUMs

```typescript
project_stage:      "idea" | "concept" | "development" | "ready" | "production" | "completed"
application_status: "pending" | "in_talks" | "matched" | "rejected"
commitment_type:    "hobby" | "side_project" | "serious" | "professional"
collab_type:        "paid" | "passion" | "both"
```

## Types verwenden

```typescript
// Immer aus src/lib/types/index.ts:
import type { Profile, Project, ProjectRole, ProjectWithRoles } from '@/lib/types'

// Generiert aus DB — nie manuell definieren:
export type Profile = Tables<'profiles'>
export type Project = Tables<'projects'>
export type ProjectRole = Tables<'project_roles'>
```

## Types neu generieren

```bash
npx supabase gen types typescript \
  --project-id dsmzvqaevqbygefuqeno \
  > src/lib/types/database.types.ts
```
