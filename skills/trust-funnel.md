# Skill: Trust Funnel
# Realize Together — Lade diesen Skill bei NDA / Synopsis / Bewerbungs-Aufgaben

## Trust Levels

```
Level 1 – Public:     title, logline, stage, commitment_type, project_roles
Level 2 – NDA:        synopsis_url → nur nach nda_consents Eintrag
                      Bucket "synopses" ist PRIVATE
Level 3 – High Trust: Drehbuch NICHT in DB — nur direkt im Chat
```

## NDA Flow

```
1. User klickt "Read Synopsis"
2. NDAModal erscheint → Checkbox → Bestätigen
3. nda_consents INSERT (project_id, user_id)
4. synopsis_url wird freigeschaltet → SynopsisViewer
5. KEIN Bewerbungsformular direkt nach NDA — User liest erst!
```

## Storage Policy synopses (NICHT ändern!)

```sql
EXISTS(
  SELECT 1 FROM nda_consents
  WHERE project_id = (storage.foldername(name))[1]::uuid
  AND user_id = auth.uid()
)
```

## Application Flow

```
pending
  → [Creator: acceptApplication()] → in_talks → Conversation erstellt
  → [Creator: rejectApplication()] → rejected

in_talks
  → [Creator: confirmMatch()] + [Applicant: confirmMatch()]
  → matched → project.status = in_progress
```

**Wichtig:** `role_id` in `project_applications` ist NULLABLE (frühe Stages).

## Storage Buckets

| Bucket   | Typ         | Pfad-Muster           |
|----------|-------------|------------------------|
| avatars  | public      | `{user_id}/avatar.*`  |
| videos   | public      | `{user_id}/video.*`   |
| synopses | **private** | `{project_id}/{file}` |

## Signed URLs

```typescript
// Synopses: 1 Stunde gültig
const { data } = await supabase.storage
  .from('synopses')
  .createSignedUrl(path, 3600)
```
